import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { subscription, type Subscription } from "@/lib/db/schema";

/**
 * Get user's current subscription
 */
export async function getUserSubscription(
  userId: string
): Promise<Subscription | null> {
  try {
    const [userSub] = await db
      .select()
      .from(subscription)
      .where(eq(subscription.userId, userId))
      .limit(1);

    return userSub || null;
  } catch (error) {
    console.error("Error getting user subscription:", error);
    return null;
  }
}

/**
 * Check if user can access a specific feature based on tier
 */
export async function canAccessFeature(
  userId: string,
  feature: "blueprints" | "events" | "relationships" | "experiments"
): Promise<boolean> {
  try {
    const userSub = await getUserSubscription(userId);

    if (!userSub) {
      return false;
    }

    // Feature access by tier
    const featureAccess = {
      free: {
        blueprints: 1,
        events: 10,
        relationships: 0,
        experiments: false,
      },
      pro: {
        blueprints: 5,
        events: 100,
        relationships: 5,
        experiments: true,
      },
      lineage: {
        blueprints: Infinity,
        events: Infinity,
        relationships: Infinity,
        experiments: true,
      },
    };

    const tier = userSub.tier as "free" | "pro" | "lineage";
    return featureAccess[tier][feature] !== 0;
  } catch (error) {
    console.error("Error checking feature access:", error);
    return false;
  }
}

/**
 * Check if user has reached their event limit for the current period
 */
export async function checkEventLimit(userId: string): Promise<{
  canLog: boolean;
  used: number;
  limit: number;
}> {
  try {
    const userSub = await getUserSubscription(userId);

    if (!userSub) {
      return { canLog: false, used: 0, limit: 0 };
    }

    const limits = {
      free: 10,
      pro: 100,
      lineage: Infinity,
    };

    const tier = userSub.tier as "free" | "pro" | "lineage";
    const limit = limits[tier];
    const used = userSub.eventsThisPeriod || 0;

    return {
      canLog: used < limit,
      used,
      limit,
    };
  } catch (error) {
    console.error("Error checking event limit:", error);
    return { canLog: false, used: 0, limit: 0 };
  }
}

/**
 * Increment event count for current period
 */
export async function incrementEventCount(userId: string): Promise<boolean> {
  try {
    const userSub = await getUserSubscription(userId);

    if (!userSub) {
      return false;
    }

    await db
      .update(subscription)
      .set({
        eventsThisPeriod: (userSub.eventsThisPeriod || 0) + 1,
        updatedAt: new Date(),
      })
      .where(eq(subscription.userId, userId));

    return true;
  } catch (error) {
    console.error("Error incrementing event count:", error);
    return false;
  }
}

/**
 * Reset event count (called by Stripe webhook on period renewal)
 */
export async function resetEventCount(userId: string): Promise<boolean> {
  try {
    await db
      .update(subscription)
      .set({
        eventsThisPeriod: 0,
        updatedAt: new Date(),
      })
      .where(eq(subscription.userId, userId));

    return true;
  } catch (error) {
    console.error("Error resetting event count:", error);
    return false;
  }
}

/**
 * Get blueprint limit for user's tier
 */
export async function getBlueprintLimit(userId: string): Promise<number> {
  try {
    const userSub = await getUserSubscription(userId);

    if (!userSub) {
      return 0;
    }

    const limits = {
      free: 1,
      pro: 5,
      lineage: 999,
    };

    const tier = userSub.tier as "free" | "pro" | "lineage";
    return limits[tier];
  } catch (error) {
    console.error("Error getting blueprint limit:", error);
    return 0;
  }
}
