import { auth } from "@/(auth)/auth";
import { db } from "@/lib/db/utils";
import { subscription as subscriptionTable, user } from "@/lib/db/schema";
import { stripe, STRIPE_CONFIG } from "@/lib/stripe/client";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

/**
 * POST /api/stripe/create-checkout
 * Creates a Stripe checkout session for upgrading to Pro or Lineage tier
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tier } = await req.json();

    if (tier !== "pro" && tier !== "lineage") {
      return NextResponse.json(
        { error: "Invalid tier. Must be 'pro' or 'lineage'" },
        { status: 400 }
      );
    }

    // Get or create subscription record
    const [existingSubscription] = await db
      .select()
      .from(subscriptionTable)
      .where(eq(subscriptionTable.userId, session.user.id))
      .limit(1);

    let stripeCustomerId = existingSubscription?.stripeCustomerId;

    // Create Stripe customer if doesn't exist
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: session.user.email || undefined,
        metadata: {
          userId: session.user.id,
        },
      });
      stripeCustomerId = customer.id;

      // Update subscription record with customer ID
      if (existingSubscription) {
        await db
          .update(subscriptionTable)
          .set({
            stripeCustomerId: customer.id,
            updatedAt: new Date(),
          })
          .where(eq(subscriptionTable.id, existingSubscription.id));
      } else {
        await db.insert(subscriptionTable).values({
          userId: session.user.id,
          stripeCustomerId: customer.id,
          tier: "free",
        });
      }
    }

    const priceId =
      tier === "pro" ? STRIPE_CONFIG.prices.pro : STRIPE_CONFIG.prices.lineage;

    if (!priceId) {
      return NextResponse.json(
        { error: "Price not configured for this tier" },
        { status: 500 }
      );
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin}/defrag/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin}/defrag/pricing`,
      metadata: {
        userId: session.user.id,
        tier,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
