import { db } from "@/lib/db/utils";
import { subscription as subscriptionTable } from "@/lib/db/schema";
import { stripe } from "@/lib/stripe/client";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events for subscription lifecycle management
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier as "pro" | "lineage" | undefined;

  if (!userId || !tier) {
    console.error("Missing metadata in checkout session");
    return;
  }

  const stripeSubscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!stripeSubscriptionId) {
    console.error("No subscription ID in checkout session");
    return;
  }

  // Fetch full subscription details
  const subscription = await stripe.subscriptions.retrieve(
    stripeSubscriptionId
  );

  await db
    .update(subscriptionTable)
    .set({
      tier,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0]?.price.id,
      status: subscription.status as "active" | "canceled" | "past_due" | "trialing" | "incomplete",
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      eventsThisPeriod: 0,
      updatedAt: new Date(),
    })
    .where(eq(subscriptionTable.userId, userId));
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    // Try to find by customer ID
    const [existingSubscription] = await db
      .select()
      .from(subscriptionTable)
      .where(eq(subscriptionTable.stripeCustomerId, subscription.customer as string))
      .limit(1);

    if (!existingSubscription) {
      console.error("Could not find subscription to update");
      return;
    }

    await db
      .update(subscriptionTable)
      .set({
        status: subscription.status as "active" | "canceled" | "past_due" | "trialing" | "incomplete",
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: new Date(),
      })
      .where(eq(subscriptionTable.id, existingSubscription.id));
  } else {
    await db
      .update(subscriptionTable)
      .set({
        status: subscription.status as "active" | "canceled" | "past_due" | "trialing" | "incomplete",
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: new Date(),
      })
      .where(eq(subscriptionTable.userId, userId));
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    const [existingSubscription] = await db
      .select()
      .from(subscriptionTable)
      .where(eq(subscriptionTable.stripeCustomerId, subscription.customer as string))
      .limit(1);

    if (!existingSubscription) {
      console.error("Could not find subscription to delete");
      return;
    }

    await db
      .update(subscriptionTable)
      .set({
        tier: "free",
        status: "canceled",
        stripeSubscriptionId: null,
        stripePriceId: null,
        cancelAtPeriodEnd: false,
        updatedAt: new Date(),
      })
      .where(eq(subscriptionTable.id, existingSubscription.id));
  } else {
    await db
      .update(subscriptionTable)
      .set({
        tier: "free",
        status: "canceled",
        stripeSubscriptionId: null,
        stripePriceId: null,
        cancelAtPeriodEnd: false,
        updatedAt: new Date(),
      })
      .where(eq(subscriptionTable.userId, userId));
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id;

  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const [existingSubscription] = await db
    .select()
    .from(subscriptionTable)
    .where(eq(subscriptionTable.stripeSubscriptionId, subscriptionId))
    .limit(1);

  if (existingSubscription) {
    // Reset event counter on new billing period
    await db
      .update(subscriptionTable)
      .set({
        status: "active",
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        eventsThisPeriod: 0,
        updatedAt: new Date(),
      })
      .where(eq(subscriptionTable.id, existingSubscription.id));
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id;

  if (!subscriptionId) return;

  const [existingSubscription] = await db
    .select()
    .from(subscriptionTable)
    .where(eq(subscriptionTable.stripeSubscriptionId, subscriptionId))
    .limit(1);

  if (existingSubscription) {
    await db
      .update(subscriptionTable)
      .set({
        status: "past_due",
        updatedAt: new Date(),
      })
      .where(eq(subscriptionTable.id, existingSubscription.id));
  }
}
