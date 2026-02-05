import Stripe from "stripe";

// Allow build to succeed without Stripe key
// In production, this should be set
const stripeKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";

export const stripe = new Stripe(stripeKey, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});
