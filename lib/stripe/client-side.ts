/**
 * Stripe Client-Side Loader
 *
 * This module provides a function to load Stripe.js on the client side.
 * Uses the publishable key which is safe to expose in client-side code.
 */

import { loadStripe, type Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null>;

/**
 * Get or initialize the Stripe.js instance
 * @returns Promise resolving to Stripe instance or null if key is missing
 */
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      console.error(
        "Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable"
      );
      return Promise.resolve(null);
    }

    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
};
