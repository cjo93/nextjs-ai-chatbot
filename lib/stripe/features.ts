/**
 * Feature Gates and Usage Limits
 * Determines what features are available for each subscription tier
 */
import { TIER_METADATA, type SubscriptionTier } from "./utils";

/**
 * Check if a user can create a new blueprint
 */
export function canCreateBlueprint(
  tier: SubscriptionTier,
  currentCount: number
): { allowed: boolean; limit: number; remaining: number } {
  const limit = TIER_METADATA[tier].blueprintLimit;
  const remaining = limit === Infinity ? Infinity : Math.max(0, limit - currentCount);
  
  return {
    allowed: currentCount < limit,
    limit,
    remaining,
  };
}

/**
 * Check if a user can log a new event
 */
export function canLogEvent(
  tier: SubscriptionTier,
  currentMonthCount: number
): { allowed: boolean; limit: number; remaining: number } {
  const limit = TIER_METADATA[tier].eventsPerMonth;
  const remaining = limit === Infinity ? Infinity : Math.max(0, limit - currentMonthCount);
  
  return {
    allowed: currentMonthCount < limit,
    limit,
    remaining,
  };
}

/**
 * Check if a user has access to relationship synastry
 */
export function canAccessSynastry(tier: SubscriptionTier): boolean {
  return tier !== "free";
}

/**
 * Check if a user has access to custom experiments
 */
export function canAccessExperiments(tier: SubscriptionTier): boolean {
  return tier === "professional" || tier === "enterprise";
}

/**
 * Check if a user has access to SEDA protocols
 */
export function canAccessSEDA(tier: SubscriptionTier): boolean {
  return tier === "professional" || tier === "enterprise";
}

/**
 * Check if a user has access to advanced analytics
 */
export function canAccessAdvancedAnalytics(tier: SubscriptionTier): boolean {
  return tier === "professional" || tier === "enterprise";
}

/**
 * Check if a user has access to API
 */
export function canAccessAPI(tier: SubscriptionTier): boolean {
  return tier === "enterprise";
}

/**
 * Get all feature flags for a tier
 */
export function getFeatureFlags(tier: SubscriptionTier) {
  return {
    synastry: canAccessSynastry(tier),
    experiments: canAccessExperiments(tier),
    seda: canAccessSEDA(tier),
    advancedAnalytics: canAccessAdvancedAnalytics(tier),
    api: canAccessAPI(tier),
  };
}
