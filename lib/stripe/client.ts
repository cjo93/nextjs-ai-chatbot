/**
 * Stripe Server-Side Client
 *
 * This module initializes and exports a Stripe instance for server-side operations.
 * Uses the secret key for authenticated API calls.
 */

import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

/**
 * Stripe client instance for server-side operations
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});
