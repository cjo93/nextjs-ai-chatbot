/**
 * Subscription Utilities
 * 
 * Functions for managing DEFRAG subscription tiers and feature access.
 */

import { db } from "@/lib/db";
import { subscription, blueprint, event } from "@/lib/db/schema";
import { eq, and, gte } from "drizzle-orm";

type SubscriptionTier = "free" | "pro" | "lineage";

/**
 * Tier feature limits
 */
const TIER_LIMITS = {
  free: {
    blueprints: 1,
    eventsPerMonth: 3,
    severityLevels: [1, 2], // Only signal and friction
    hasRelationships: false,
    hasApiAccess: false,
  },
  pro: {
    blueprints: Infinity,
    eventsPerMonth: Infinity,
    severityLevels: [1, 2, 3, 4, 5], // All severity levels
    hasRelationships: true,
    hasApiAccess: false,
  },
  lineage: {
    blueprints: Infinity,
    eventsPerMonth: Infinity,
    severityLevels: [1, 2, 3, 4, 5], // All severity levels
    hasRelationships: true,
    hasApiAccess: true,
  },
};

/**
 * Get user's subscription information
 * @param userId - User ID
 * @returns Subscription data or null if not found
 */
export async function getUserSubscription(userId: string) {
  const subscriptions = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, userId))
    .limit(1);

  if (subscriptions.length === 0) {
    // Create free tier subscription if it doesn't exist
    const newSubscription = await db
      .insert(subscription)
      .values({
        userId,
        tier: "free",
        status: "active",
      })
      .returning();

    return newSubscription[0];
  }

  return subscriptions[0];
}

/**
 * Check if user has access to a specific feature
 * @param tier - Subscription tier
 * @param feature - Feature name
 * @returns True if user has access to the feature
 */
export function checkFeatureAccess(
  tier: SubscriptionTier,
  feature: keyof typeof TIER_LIMITS.free
): boolean {
  const limits = TIER_LIMITS[tier];
  const value = limits[feature];
  
  if (typeof value === "boolean") {
    return value;
  }
  
  return true;
}

/**
 * Check if user can log an event with the given severity
 * @param userId - User ID
 * @param severity - Event severity level (1-5)
 * @returns Object with canLog boolean and reason if false
 */
export async function canLogEvent(
  userId: string,
  severity: number
): Promise<{ canLog: boolean; reason?: string }> {
  const userSubscription = await getUserSubscription(userId);
  const limits = TIER_LIMITS[userSubscription.tier];

  // Check severity level access
  if (!limits.severityLevels.includes(severity)) {
    return {
      canLog: false,
      reason: `Severity level ${severity} requires a ${severity <= 2 ? "Free" : "Pro"} tier or higher.`,
    };
  }

  // Check event limit for free tier
  if (userSubscription.tier === "free") {
    if (userSubscription.eventsThisPeriod >= limits.eventsPerMonth) {
      return {
        canLog: false,
        reason: "You've reached your monthly event limit. Upgrade to Pro for unlimited events.",
      };
    }
  }

  return { canLog: true };
}

/**
 * Check if user can create a new blueprint
 * @param userId - User ID
 * @returns Object with canCreate boolean and reason if false
 */
export async function canCreateBlueprint(
  userId: string
): Promise<{ canCreate: boolean; reason?: string }> {
  const userSubscription = await getUserSubscription(userId);
  const limits = TIER_LIMITS[userSubscription.tier];

  if (limits.blueprints === Infinity) {
    return { canCreate: true };
  }

  // Count existing blueprints
  const blueprints = await db
    .select()
    .from(blueprint)
    .where(eq(blueprint.userId, userId));

  if (blueprints.length >= limits.blueprints) {
    return {
      canCreate: false,
      reason: "You've reached your blueprint limit. Upgrade to Pro for unlimited blueprints.",
    };
  }

  return { canCreate: true };
}

/**
 * Increment event count for the current period
 * @param userId - User ID
 */
export async function incrementEventCount(userId: string): Promise<void> {
  await db
    .update(subscription)
    .set({
      eventsThisPeriod: db
        .select()
        .from(subscription)
        .where(eq(subscription.userId, userId))
        .then((subs) => (subs[0]?.eventsThisPeriod || 0) + 1),
      updatedAt: new Date(),
    })
    .where(eq(subscription.userId, userId));
}

/**
 * Reset monthly limits for all users
 * This should be called by a cron job at the start of each billing period
 */
export async function resetMonthlyLimits(): Promise<void> {
  const now = new Date();
  
  // Reset for subscriptions where current period has ended
  await db
    .update(subscription)
    .set({
      eventsThisPeriod: 0,
      updatedAt: now,
    })
    .where(
      and(
        eq(subscription.tier, "free"),
        gte(now, subscription.currentPeriodEnd || new Date(0))
      )
    );
}

/**
 * Get tier limits for a specific tier
 * @param tier - Subscription tier
 * @returns Tier limits object
 */
export function getTierLimits(tier: SubscriptionTier) {
  return TIER_LIMITS[tier];
}
