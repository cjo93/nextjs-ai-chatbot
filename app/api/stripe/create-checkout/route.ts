import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { stripe } from "@/lib/stripe/client";
import { getUserSubscription } from "@/lib/stripe/subscription";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { tier } = body;

    if (!tier || !["pro", "lineage"].includes(tier)) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    // Check if user already has a subscription
    const existingSub = await getUserSubscription(session.user.id);

    if (existingSub?.stripeCustomerId) {
      // User already has a subscription, redirect to portal
      return NextResponse.json(
        { error: "User already has a subscription. Use billing portal." },
        { status: 400 }
      );
    }

    // Price IDs (these should be in environment variables in production)
    const priceIds = {
      pro: process.env.STRIPE_PRO_PRICE_ID || "price_pro",
      lineage: process.env.STRIPE_LINEAGE_PRICE_ID || "price_lineage",
    };

    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: session.user.email || undefined,
      client_reference_id: session.user.id,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceIds[tier as "pro" | "lineage"],
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing`,
      metadata: {
        userId: session.user.id,
        tier,
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
          tier,
        },
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
