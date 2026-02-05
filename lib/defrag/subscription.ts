/**
 * Subscription Management Utilities
 */

import { db } from "@/lib/db";
import { defragSubscription } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { SubscriptionTier } from "@/lib/defrag/types";

/**
 * Get or create subscription record for user
 */
export async function getOrCreateSubscription(userId: string) {
  const [existing] = await db
    .select()
    .from(defragSubscription)
    .where(eq(defragSubscription.userId, userId))
    .limit(1);
  
  if (existing) {
    return existing;
  }
  
  // Create default free subscription
  const [subscription] = await db
    .insert(defragSubscription)
    .values({
      userId,
      tier: "free",
      status: "active",
    })
    .returning();
  
  return subscription;
}

/**
 * Update subscription tier
 */
export async function updateSubscriptionTier(
  userId: string,
  tier: SubscriptionTier,
  stripeData?: {
    customerId: string;
    subscriptionId: string;
    priceId: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
  }
) {
  await db
    .update(defragSubscription)
    .set({
      tier,
      ...(stripeData && {
        stripeCustomerId: stripeData.customerId,
        stripeSubscriptionId: stripeData.subscriptionId,
        stripePriceId: stripeData.priceId,
        currentPeriodStart: stripeData.currentPeriodStart,
        currentPeriodEnd: stripeData.currentPeriodEnd,
      }),
      status: "active",
      updatedAt: new Date(),
    })
    .where(eq(defragSubscription.userId, userId));
}

/**
 * Cancel subscription (mark for cancellation at period end)
 */
export async function cancelSubscription(userId: string) {
  await db
    .update(defragSubscription)
    .set({
      cancelAtPeriodEnd: true,
      updatedAt: new Date(),
    })
    .where(eq(defragSubscription.userId, userId));
}

/**
 * Check if user has access to a feature based on tier
 */
export async function hasFeatureAccess(
  userId: string,
  feature: "experiments" | "relationships" | "analytics"
): Promise<boolean> {
  const subscription = await getOrCreateSubscription(userId);
  
  const featureAccess = {
    experiments: ["pro"],
    relationships: ["pro"],
    analytics: ["basic", "pro"],
  };
  
  return featureAccess[feature].includes(subscription.tier);
}
