/**
 * Stripe Checkout Session Creation Endpoint
 * POST /api/stripe/create-checkout
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { createCheckoutSession } from "@/lib/stripe/utils";
import { z } from "zod";

const checkoutSchema = z.object({
  tier: z.enum(["starter", "professional", "enterprise"]),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = checkoutSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validation.error },
        { status: 400 }
      );
    }

    const { tier } = validation.data;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const checkoutUrl = await createCheckoutSession({
      userId: session.user.id,
      tier,
      successUrl: `${appUrl}/dashboard?success=true`,
      cancelUrl: `${appUrl}/pricing?canceled=true`,
    });

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error("Checkout session creation error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
