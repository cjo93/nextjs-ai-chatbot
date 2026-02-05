/**
 * Stripe Billing Portal API Route
 * 
 * Creates a Stripe billing portal session for subscription management.
 */

import { auth } from "@/app/(auth)/auth";
import { stripe } from "@/lib/stripe/client";
import { db } from "@/lib/db";
import { subscription } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's subscription
    const userSubscription = await db
      .select()
      .from(subscription)
      .where(eq(subscription.userId, session.user.id))
      .limit(1);

    if (userSubscription.length === 0 || !userSubscription[0].stripeCustomerId) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Create billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: userSubscription[0].stripeCustomerId,
      return_url: `${appUrl}/defrag/settings`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Error creating portal session:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
