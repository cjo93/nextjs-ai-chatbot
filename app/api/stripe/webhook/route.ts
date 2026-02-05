import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/client";
import { db } from "@/lib/db";
import { subscription } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { resetEventCount } from "@/lib/stripe/subscription";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
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
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(sub);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(sub);
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
  const userId = session.metadata?.userId || session.client_reference_id;
  const tier = session.metadata?.tier || "pro";

  if (!userId) {
    console.error("No userId found in checkout session");
    return;
  }

  // Get the subscription
  const stripeSubscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!stripeSubscriptionId) {
    console.error("No subscription ID found");
    return;
  }

  const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);

  // Create or update subscription in database
  await db
    .insert(subscription)
    .values({
      userId,
      tier: tier as "free" | "pro" | "lineage",
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: stripeSub.id,
      stripePriceId: stripeSub.items.data[0].price.id,
      status: stripeSub.status as "active" | "canceled" | "past_due" | "trialing" | "incomplete",
      currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
      cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
      eventsThisPeriod: 0,
      blueprintsCreated: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: subscription.userId,
      set: {
        tier: tier as "free" | "pro" | "lineage",
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: stripeSub.id,
        stripePriceId: stripeSub.items.data[0].price.id,
        status: stripeSub.status as "active" | "canceled" | "past_due" | "trialing" | "incomplete",
        currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
        cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
        updatedAt: new Date(),
      },
    });
}

async function handleSubscriptionUpdated(stripeSub: Stripe.Subscription) {
  const userId = stripeSub.metadata?.userId;

  if (!userId) {
    console.error("No userId found in subscription metadata");
    return;
  }

  await db
    .update(subscription)
    .set({
      status: stripeSub.status as "active" | "canceled" | "past_due" | "trialing" | "incomplete",
      currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
      cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
      updatedAt: new Date(),
    })
    .where(eq(subscription.userId, userId));
}

async function handleSubscriptionDeleted(stripeSub: Stripe.Subscription) {
  const userId = stripeSub.metadata?.userId;

  if (!userId) {
    console.error("No userId found in subscription metadata");
    return;
  }

  await db
    .update(subscription)
    .set({
      status: "canceled",
      tier: "free",
      updatedAt: new Date(),
    })
    .where(eq(subscription.userId, userId));
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const stripeSubscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id;

  if (!stripeSubscriptionId) {
    return;
  }

  const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  const userId = stripeSub.metadata?.userId;

  if (!userId) {
    console.error("No userId found in subscription metadata");
    return;
  }

  // Reset event count on successful payment (new period)
  await resetEventCount(userId);

  await db
    .update(subscription)
    .set({
      status: "active",
      currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
      eventsThisPeriod: 0,
      updatedAt: new Date(),
    })
    .where(eq(subscription.userId, userId));
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const stripeSubscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id;

  if (!stripeSubscriptionId) {
    return;
  }

  const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  const userId = stripeSub.metadata?.userId;

  if (!userId) {
    console.error("No userId found in subscription metadata");
    return;
  }

  await db
    .update(subscription)
    .set({
      status: "past_due",
      updatedAt: new Date(),
    })
    .where(eq(subscription.userId, userId));
}
