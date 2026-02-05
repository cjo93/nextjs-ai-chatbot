import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
}

/**
 * Stripe client instance configured with the secret key
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});

/**
 * Stripe pricing configuration for DEFRAG platform
 */
export const STRIPE_CONFIG = {
  prices: {
    pro: process.env.STRIPE_PRO_PRICE_ID || "",
    lineage: process.env.STRIPE_LINEAGE_PRICE_ID || "",
  },
  tiers: {
    free: {
      name: "Free",
      eventsPerPeriod: 5,
      blueprintsMax: 1,
    },
    pro: {
      name: "Pro",
      eventsPerPeriod: 100,
      blueprintsMax: 10,
    },
    lineage: {
      name: "Lineage",
      eventsPerPeriod: -1, // unlimited
      blueprintsMax: -1, // unlimited
    },
  },
} as const;

/**
 * Check if a user has reached their tier limits
 */
export function checkTierLimits(
  tier: "free" | "pro" | "lineage",
  eventsThisPeriod: number,
  blueprintsCreated: number
): { canLogEvent: boolean; canCreateBlueprint: boolean } {
  const tierConfig = STRIPE_CONFIG.tiers[tier];

  return {
    canLogEvent:
      tierConfig.eventsPerPeriod === -1 ||
      eventsThisPeriod < tierConfig.eventsPerPeriod,
    canCreateBlueprint:
      tierConfig.blueprintsMax === -1 ||
      blueprintsCreated < tierConfig.blueprintsMax,
  };
}
