import { auth } from "@/(auth)/auth";
import { db } from "@/lib/db/utils";
import { subscription as subscriptionTable } from "@/lib/db/schema";
import { stripe } from "@/lib/stripe/client";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

/**
 * POST /api/stripe/create-portal
 * Creates a Stripe billing portal session for managing subscriptions
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get subscription record
    const [existingSubscription] = await db
      .select()
      .from(subscriptionTable)
      .where(eq(subscriptionTable.userId, session.user.id))
      .limit(1);

    if (!existingSubscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No Stripe customer found" },
        { status: 404 }
      );
    }

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: existingSubscription.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin}/defrag/settings`,
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
