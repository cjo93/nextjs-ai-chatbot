/**
 * Stripe Customer Portal Session Creation Endpoint
 * POST /api/stripe/create-portal
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db";
import { subscription as subscriptionTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createPortalSession } from "@/lib/stripe/utils";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's subscription
    const [userSubscription] = await db
      .select()
      .from(subscriptionTable)
      .where(eq(subscriptionTable.userId, session.user.id))
      .limit(1);

    if (!userSubscription || !userSubscription.stripeCustomerId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const portalUrl = await createPortalSession({
      customerId: userSubscription.stripeCustomerId,
      returnUrl: `${appUrl}/settings`,
    });

    return NextResponse.json({ url: portalUrl });
  } catch (error) {
    console.error("Portal session creation error:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
