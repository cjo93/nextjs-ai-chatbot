/**
 * DEFRAG Settings Page
 *
 * User settings and subscription management.
 */

import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { Button } from "@/components/ui/button";
import { getUserSubscription } from "@/lib/defrag/subscription";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userSubscription = await getUserSubscription(session.user.id);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Settings</h1>

      <div className="space-y-6">
        {/* Account Information */}
        <section className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Account Information</h2>
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium">Email:</span>{" "}
              <span className="text-sm text-muted-foreground">
                {session.user.email}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium">User ID:</span>{" "}
              <span className="text-sm font-mono text-muted-foreground">
                {session.user.id}
              </span>
            </div>
          </div>
        </section>

        {/* Subscription Management */}
        <section className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Subscription</h2>
          <div className="mb-4 space-y-2">
            <div>
              <span className="text-sm font-medium">Current Plan:</span>{" "}
              <span className="text-sm font-semibold">
                {userSubscription.tier.toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium">Status:</span>{" "}
              <span className="text-sm text-muted-foreground">
                {userSubscription.status}
              </span>
            </div>
            {userSubscription.tier !== "free" &&
              userSubscription.currentPeriodEnd && (
                <div>
                  <span className="text-sm font-medium">Next billing:</span>{" "}
                  <span className="text-sm text-muted-foreground">
                    {new Date(
                      userSubscription.currentPeriodEnd
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}
          </div>

          {userSubscription.tier === "free" && <Button>Upgrade to Pro</Button>}

          {userSubscription.tier !== "free" &&
            userSubscription.stripeCustomerId && (
              <form action="/api/stripe/create-portal" method="POST">
                <Button type="submit">Manage Billing</Button>
              </form>
            )}
        </section>

        {/* Data Management */}
        <section className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Data Management</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Export or delete your DEFRAG data. These features are currently
            under development.
          </p>
          <div className="flex gap-4">
            <Button disabled variant="outline">
              Export Data
            </Button>
            <Button disabled variant="destructive">
              Delete Account
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
