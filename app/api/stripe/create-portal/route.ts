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

    const userSub = await getUserSubscription(session.user.id);

    if (!userSub?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 400 }
      );
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: userSub.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings`,
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
