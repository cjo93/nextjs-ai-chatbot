/**
 * Stripe Webhook Handler
 * POST /api/stripe/webhook
 * 
 * Handles Stripe webhook events for subscription management
 */
import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe/client";
import { db } from "@/lib/db";
import { subscription as subscriptionTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    const event = constructWebhookEvent(body, signature);

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
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
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier;

  if (!userId || !tier) {
    console.error("Missing metadata in checkout session");
    return;
  }

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;

  if (!subscriptionId || !customerId) {
    console.error("Missing subscription or customer ID");
    return;
  }

  // Create or update subscription record
  await db
    .insert(subscriptionTable)
    .values({
      userId,
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: customerId,
      stripePriceId: session.line_items?.data[0]?.price?.id || null,
      tier: tier as "free" | "starter" | "professional" | "enterprise",
      status: "active",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: subscriptionTable.userId,
      set: {
        stripeSubscriptionId: subscriptionId,
        stripeCustomerId: customerId,
        tier: tier as "free" | "starter" | "professional" | "enterprise",
        status: "active",
        updatedAt: new Date(),
      },
    });
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const [existing] = await db
    .select()
    .from(subscriptionTable)
    .where(eq(subscriptionTable.stripeCustomerId, customerId))
    .limit(1);

  if (!existing) {
    console.error("Subscription not found for customer:", customerId);
    return;
  }

  const subAny = subscription as any;

  await db
    .update(subscriptionTable)
    .set({
      status: subscription.status as any,
      currentPeriodStart: new Date(subAny.current_period_start * 1000),
      currentPeriodEnd: new Date(subAny.current_period_end * 1000),
      cancelAtPeriodEnd: subAny.cancel_at_period_end || false,
      updatedAt: new Date(),
    })
    .where(eq(subscriptionTable.id, existing.id));
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const [existing] = await db
    .select()
    .from(subscriptionTable)
    .where(eq(subscriptionTable.stripeCustomerId, customerId))
    .limit(1);

  if (!existing) {
    return;
  }

  await db
    .update(subscriptionTable)
    .set({
      status: "canceled",
      tier: "free",
      updatedAt: new Date(),
    })
    .where(eq(subscriptionTable.id, existing.id));
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Could trigger welcome email or other actions
  console.log("Payment succeeded for invoice:", invoice.id);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // Could trigger notification to user
  console.log("Payment failed for invoice:", invoice.id);
}
