/**
 * Subscription API Route
 *
 * Returns the current user's subscription information.
 */

import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getUserSubscription } from "@/lib/defrag/subscription";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await getUserSubscription(session.user.id);

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
