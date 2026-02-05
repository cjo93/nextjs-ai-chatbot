/**
 * Stripe Webhook Handler
 * Processes Stripe events (subscription created, updated, canceled, etc.)
 */

import { NextResponse } from "next/server";
import { stripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe/client";
import { updateSubscriptionTier, cancelSubscription } from "@/lib/defrag/subscription";

export async function POST(req: Request) {
  try {
    if (!stripe || !STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 500 }
      );
    }
    
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }
    
    // TODO: Uncomment when Stripe is installed
    // const event = stripe.webhooks.constructEvent(
    //   body,
    //   signature,
    //   STRIPE_WEBHOOK_SECRET
    // );
    
    // Handle different event types
    // switch (event.type) {
    //   case 'checkout.session.completed': {
    //     const session = event.data.object;
    //     const userId = session.metadata?.userId;
    //     const tier = session.metadata?.tier;
    //     
    //     if (userId && tier) {
    //       await updateSubscriptionTier(userId, tier as any);
    //     }
    //     break;
    //   }
    //   
    //   case 'customer.subscription.updated': {
    //     const subscription = event.data.object;
    //     // Handle subscription updates
    //     break;
    //   }
    //   
    //   case 'customer.subscription.deleted': {
    //     const subscription = event.data.object;
    //     const userId = subscription.metadata?.userId;
    //     
    //     if (userId) {
    //       await cancelSubscription(userId);
    //     }
    //     break;
    //   }
    // }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler error" },
      { status: 400 }
    );
  }
}
