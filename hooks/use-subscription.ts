/**
 * useSubscription Hook
 *
 * React hook for accessing subscription state and feature access.
 */

"use client";

import { useEffect, useState } from "react";
import type { Subscription } from "@/lib/db/schema";

interface SubscriptionState {
  subscription: Subscription | null;
  isLoading: boolean;
  error: Error | null;
  tier: "free" | "pro" | "lineage";
  canAccessFeature: (feature: string) => boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook to access user's subscription information
 * @returns Subscription state and helper functions
 */
export function useSubscription(): SubscriptionState {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/subscription");

      if (!response.ok) {
        throw new Error("Failed to fetch subscription");
      }

      const data = await response.json();
      setSubscription(data.subscription);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const canAccessFeature = (feature: string): boolean => {
    if (!subscription) {
      return false;
    }

    const tier = subscription.tier;

    switch (feature) {
      case "blueprints":
        return tier === "pro" || tier === "lineage";
      case "relationships":
        return tier === "pro" || tier === "lineage";
      case "api":
        return tier === "lineage";
      case "unlimited-events":
        return tier === "pro" || tier === "lineage";
      case "all-severity-levels":
        return tier === "pro" || tier === "lineage";
      default:
        return true;
    }
  };

  return {
    subscription,
    isLoading,
    error,
    tier: subscription?.tier || "free",
    canAccessFeature,
    refresh: fetchSubscription,
  };
}
