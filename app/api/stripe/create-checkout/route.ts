/**
 * Stripe Checkout Session Creation
 * Creates a checkout session for upgrading subscription
 */

import { auth } from "@/app/(auth)/auth";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { STRIPE_PRICES } from "@/lib/defrag/types";

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe not configured. Please set STRIPE_SECRET_KEY environment variable." },
        { status: 500 }
      );
    }
    
    const { tier } = await req.json();
    
    if (!tier || !["basic", "pro"].includes(tier)) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }
    
    const priceId = STRIPE_PRICES[tier as "basic" | "pro"].monthly;
    
    // TODO: Uncomment when Stripe is installed
    // const checkoutSession = await stripe.checkout.sessions.create({
    //   customer_email: session.user.email,
    //   client_reference_id: session.user.id,
    //   mode: 'subscription',
    //   payment_method_types: ['card'],
    //   line_items: [
    //     {
    //       price: priceId,
    //       quantity: 1,
    //     },
    //   ],
    //   success_url: `${process.env.NEXT_PUBLIC_APP_URL}/defrag/dashboard?upgrade=success`,
    //   cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/defrag/pricing?upgrade=canceled`,
    //   metadata: {
    //     userId: session.user.id,
    //     tier,
    //   },
    // });
    
    // return NextResponse.json({ url: checkoutSession.url });
    
    // Stub response for now
    return NextResponse.json({
      error: "Stripe checkout not implemented. Install Stripe with: pnpm add stripe",
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
