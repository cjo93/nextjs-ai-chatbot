/**
 * Stripe Checkout Session API Route
 * 
 * Creates a Stripe checkout session for DEFRAG subscription purchases.
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

    const { priceId, tier } = await request.json();

    if (!priceId || !tier) {
      return NextResponse.json(
        { error: "Missing required parameters: priceId and tier" },
        { status: 400 }
      );
    }

    if (!["pro", "lineage"].includes(tier)) {
      return NextResponse.json(
        { error: "Invalid tier. Must be 'pro' or 'lineage'" },
        { status: 400 }
      );
    }

    // Get or create subscription record for the user
    const existingSubscriptions = await db
      .select()
      .from(subscription)
      .where(eq(subscription.userId, session.user.id))
      .limit(1);

    let stripeCustomerId: string | undefined;

    if (existingSubscriptions.length > 0) {
      stripeCustomerId = existingSubscriptions[0].stripeCustomerId || undefined;
    }

    // Create or retrieve Stripe customer
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: session.user.email || undefined,
        metadata: {
          userId: session.user.id,
        },
      });
      stripeCustomerId = customer.id;

      // Update subscription record with customer ID
      if (existingSubscriptions.length > 0) {
        await db
          .update(subscription)
          .set({ stripeCustomerId })
          .where(eq(subscription.userId, session.user.id));
      } else {
        await db.insert(subscription).values({
          userId: session.user.id,
          tier: "free",
          stripeCustomerId,
          status: "active",
        });
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/defrag/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/defrag/pricing`,
      metadata: {
        userId: session.user.id,
        tier,
      },
    });

    return NextResponse.json({ 
      url: checkoutSession.url,
      sessionId: checkoutSession.id 
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
