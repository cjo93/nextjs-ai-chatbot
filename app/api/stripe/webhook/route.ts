/**
 * Stripe Webhook Handler
 *
 * Handles Stripe webhook events for subscription lifecycle management.
 */

import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { subscription } from "@/lib/db/schema";
import { stripe } from "@/lib/stripe/client";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
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
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.updated": {
        const stripeSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(stripeSubscription);
        break;
      }

      case "customer.subscription.deleted": {
        const stripeSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(stripeSubscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
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
  const tier = session.metadata?.tier as "pro" | "lineage";

  if (!userId || !tier) {
    console.error("Missing userId or tier in checkout session metadata");
    return;
  }

  const stripeSubscription = await stripe.subscriptions.retrieve(
    session.subscription as string,
    { expand: ["items.data.price"] }
  );

  // Update or create subscription record
  const existingSubscriptions = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, userId))
    .limit(1);

  const subscriptionData = {
    tier,
    stripeCustomerId: session.customer as string,
    stripeSubscriptionId: session.subscription as string,
    stripePriceId: stripeSubscription.items.data[0]?.price.id || "",
    status: stripeSubscription.status as
      | "active"
      | "canceled"
      | "past_due"
      | "trialing"
      | "incomplete",
    currentPeriodStart: new Date(
      (stripeSubscription.current_period_start || 0) * 1000
    ),
    currentPeriodEnd: new Date(
      (stripeSubscription.current_period_end || 0) * 1000
    ),
    cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end || false,
    updatedAt: new Date(),
  };

  if (existingSubscriptions.length > 0) {
    await db
      .update(subscription)
      .set(subscriptionData)
      .where(eq(subscription.userId, userId));
  } else {
    await db.insert(subscription).values({
      userId,
      eventsThisPeriod: 0,
      blueprintsCreated: 0,
      ...subscriptionData,
    });
  }
}

async function handleSubscriptionUpdated(
  stripeSubscription: Stripe.Subscription
) {
  const userId = stripeSubscription.metadata?.userId;

  if (userId) {
    await db
      .update(subscription)
      .set({
        status: stripeSubscription.status as
          | "active"
          | "canceled"
          | "past_due"
          | "trialing"
          | "incomplete",
        currentPeriodStart: new Date(
          (stripeSubscription.current_period_start || 0) * 1000
        ),
        currentPeriodEnd: new Date(
          (stripeSubscription.current_period_end || 0) * 1000
        ),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end || false,
        updatedAt: new Date(),
      })
      .where(eq(subscription.userId, userId));
  } else {
    // Find user by stripeSubscriptionId
    const existingSubscriptions = await db
      .select()
      .from(subscription)
      .where(eq(subscription.stripeSubscriptionId, stripeSubscription.id))
      .limit(1);

    if (existingSubscriptions.length === 0) {
      console.error(
        "Could not find subscription for Stripe subscription ID:",
        stripeSubscription.id
      );
      return;
    }

    await db
      .update(subscription)
      .set({
        status: stripeSubscription.status as
          | "active"
          | "canceled"
          | "past_due"
          | "trialing"
          | "incomplete",
        currentPeriodStart: new Date(
          (stripeSubscription.current_period_start || 0) * 1000
        ),
        currentPeriodEnd: new Date(
          (stripeSubscription.current_period_end || 0) * 1000
        ),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end || false,
        updatedAt: new Date(),
      })
      .where(eq(subscription.stripeSubscriptionId, stripeSubscription.id));
  }
}

async function handleSubscriptionDeleted(
  stripeSubscription: Stripe.Subscription
) {
  // Downgrade to free tier
  const existingSubscriptions = await db
    .select()
    .from(subscription)
    .where(eq(subscription.stripeSubscriptionId, stripeSubscription.id))
    .limit(1);

  if (existingSubscriptions.length === 0) {
    console.error(
      "Could not find subscription for Stripe subscription ID:",
      stripeSubscription.id
    );
    return;
  }

  await db
    .update(subscription)
    .set({
      tier: "free",
      status: "canceled",
      cancelAtPeriodEnd: false,
      updatedAt: new Date(),
    })
    .where(eq(subscription.stripeSubscriptionId, stripeSubscription.id));
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Reset monthly event count on successful payment
  if (!invoice.subscription) {
    return;
  }

  const existingSubscriptions = await db
    .select()
    .from(subscription)
    .where(
      eq(subscription.stripeSubscriptionId, invoice.subscription as string)
    )
    .limit(1);

  if (existingSubscriptions.length === 0) {
    return;
  }

  await db
    .update(subscription)
    .set({
      eventsThisPeriod: 0,
      status: "active",
      updatedAt: new Date(),
    })
    .where(
      eq(subscription.stripeSubscriptionId, invoice.subscription as string)
    );
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Mark subscription as past_due
  if (!invoice.subscription) {
    return;
  }

  const existingSubscriptions = await db
    .select()
    .from(subscription)
    .where(
      eq(subscription.stripeSubscriptionId, invoice.subscription as string)
    )
    .limit(1);

  if (existingSubscriptions.length === 0) {
    return;
  }

  await db
    .update(subscription)
    .set({
      status: "past_due",
      updatedAt: new Date(),
    })
    .where(
      eq(subscription.stripeSubscriptionId, invoice.subscription as string)
    );
}
