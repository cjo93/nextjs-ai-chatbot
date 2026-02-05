/**
 * Stripe Utility Functions
 * Helper functions for subscription management
 */
import { stripe } from "./client";
import type { Subscription } from "@/lib/db/schema";

export type SubscriptionTier = "free" | "starter" | "professional" | "enterprise";

/**
 * Price ID mapping for subscription tiers
 */
export const PRICE_IDS: Record<SubscriptionTier, string> = {
  free: "", // No price ID for free tier
  starter: process.env.STRIPE_PRICE_ID_STARTER || "",
  professional: process.env.STRIPE_PRICE_ID_PROFESSIONAL || "",
  enterprise: process.env.STRIPE_PRICE_ID_ENTERPRISE || "",
};

/**
 * Tier metadata for display and limits
 */
export const TIER_METADATA = {
  free: {
    name: "Free",
    price: "$0",
    blueprintLimit: 1,
    eventsPerMonth: 10,
    features: [
      "1 Birth Chart",
      "10 Events per month",
      "Basic God Engine protocols",
      "Community support",
    ],
  },
  starter: {
    name: "Starter",
    price: "$19",
    blueprintLimit: 3,
    eventsPerMonth: 50,
    features: [
      "3 Birth Charts",
      "50 Events per month",
      "Full God Engine access",
      "Email support",
      "Relationship synastry",
    ],
  },
  professional: {
    name: "Professional",
    price: "$49",
    blueprintLimit: 10,
    eventsPerMonth: 200,
    features: [
      "10 Birth Charts",
      "200 Events per month",
      "Advanced analytics",
      "Priority support",
      "Custom experiments",
      "SEDA protocols",
    ],
  },
  enterprise: {
    name: "Enterprise",
    price: "$199",
    blueprintLimit: Infinity,
    eventsPerMonth: Infinity,
    features: [
      "Unlimited Birth Charts",
      "Unlimited Events",
      "White-label options",
      "Dedicated support",
      "API access",
      "Custom integrations",
    ],
  },
} as const;

/**
 * Create a Stripe checkout session for subscription
 */
export async function createCheckoutSession(params: {
  userId: string;
  tier: SubscriptionTier;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const { userId, tier, successUrl, cancelUrl } = params;

  if (tier === "free") {
    throw new Error("Cannot create checkout session for free tier");
  }

  const priceId = PRICE_IDS[tier];
  if (!priceId) {
    throw new Error(`Missing price ID for tier: ${tier}`);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      tier,
    },
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session URL");
  }

  return session.url;
}

/**
 * Create a Stripe customer portal session
 */
export async function createPortalSession(params: {
  customerId: string;
  returnUrl: string;
}): Promise<string> {
  const { customerId, returnUrl } = params;

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session.url;
}

/**
 * Get subscription status from Stripe
 */
export async function getSubscriptionStatus(
  subscriptionId: string
): Promise<{
  status: string;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  return {
    status: subscription.status,
    currentPeriodEnd: (subscription as any).current_period_end
      ? new Date((subscription as any).current_period_end * 1000)
      : null,
    cancelAtPeriodEnd: (subscription as any).cancel_at_period_end || false,
  };
}

/**
 * Cancel a subscription at period end
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<void> {
  await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * Resume a canceled subscription
 */
export async function resumeSubscription(subscriptionId: string): Promise<void> {
  await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}
