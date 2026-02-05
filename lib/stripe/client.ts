/**
 * Stripe Client Configuration
 */

// Note: Stripe is not installed in package.json yet
// To use this in production, run: pnpm add stripe

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if (!STRIPE_SECRET_KEY) {
  console.warn("⚠️ STRIPE_SECRET_KEY not set. Stripe integration will not work.");
}

/**
 * Initialize Stripe client
 * Returns null if Stripe is not configured
 */
export function getStripeClient() {
  if (!STRIPE_SECRET_KEY) {
    return null;
  }
  
  try {
    // TODO: Uncomment when Stripe is installed
    // const Stripe = require('stripe');
    // return new Stripe(STRIPE_SECRET_KEY, {
    //   apiVersion: '2023-10-16',
    // });
    
    console.warn("Stripe not installed. Run: pnpm add stripe");
    return null;
  } catch (error) {
    console.error("Failed to initialize Stripe:", error);
    return null;
  }
}

export const stripe = getStripeClient();

export { STRIPE_WEBHOOK_SECRET };
