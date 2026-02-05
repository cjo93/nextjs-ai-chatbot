/**
 * Stripe Customer Portal
 * Creates a portal session for managing subscription
 */

import { auth } from "@/app/(auth)/auth";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { db } from "@/lib/db";
import { defragSubscription } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 500 }
      );
    }
    
    // Get user's Stripe customer ID
    const [subscription] = await db
      .select()
      .from(defragSubscription)
      .where(eq(defragSubscription.userId, session.user.id))
      .limit(1);
    
    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 400 }
      );
    }
    
    // TODO: Uncomment when Stripe is installed
    // const portalSession = await stripe.billingPortal.sessions.create({
    //   customer: subscription.stripeCustomerId,
    //   return_url: `${process.env.NEXT_PUBLIC_APP_URL}/defrag/dashboard`,
    // });
    
    // return NextResponse.json({ url: portalSession.url });
    
    return NextResponse.json({
      error: "Stripe portal not implemented. Install Stripe with: pnpm add stripe",
    });
  } catch (error) {
    console.error("Portal error:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
