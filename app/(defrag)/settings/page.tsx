import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/utils";
import { subscription as subscriptionTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, CreditCard } from "lucide-react";

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center">
          Loading...
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}

async function SettingsContent() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Fetch subscription
  const [userSubscription] = await db
    .select()
    .from(subscriptionTable)
    .where(eq(subscriptionTable.userId, userId))
    .limit(1);

  const handlePortalRedirect = async () => {
    "use server";
    // This would call the Stripe portal API
  };

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/defrag/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <span className="font-bold text-xl">Settings</span>
          </div>
        </div>
      </header>

      <div className="container py-8 max-w-3xl space-y-8">
        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your DEFRAG account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">
                  {session.user.email || "Not set"}
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="text-sm font-medium">User ID</p>
                <p className="text-sm text-muted-foreground font-mono">
                  {userId.slice(0, 16)}...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        {userSubscription && (
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>
                Manage your billing and subscription
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Current Plan</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold capitalize">
                      {userSubscription.tier}
                    </p>
                    <Badge variant="secondary">{userSubscription.status}</Badge>
                  </div>
                </div>
                <Link href="/defrag/pricing">
                  <Button variant="outline">Change Plan</Button>
                </Link>
              </div>

              {userSubscription.tier !== "free" && (
                <>
                  <div className="grid grid-cols-2 gap-4 py-4 border-y">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Current Period
                      </p>
                      <p className="text-sm font-medium">
                        {userSubscription.currentPeriodStart
                          ? new Date(
                              userSubscription.currentPeriodStart
                            ).toLocaleDateString()
                          : "N/A"}{" "}
                        -{" "}
                        {userSubscription.currentPeriodEnd
                          ? new Date(
                              userSubscription.currentPeriodEnd
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Usage</p>
                      <p className="text-sm font-medium">
                        {userSubscription.eventsThisPeriod} events •{" "}
                        {userSubscription.blueprintsCreated} blueprints
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={async () => {
                      const res = await fetch("/api/stripe/create-portal", {
                        method: "POST",
                      });
                      const data = await res.json();
                      if (data.url) window.location.href = data.url;
                    }}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Manage Billing
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your DEFRAG experience</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Preferences coming soon...
            </p>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions - proceed with caution
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button variant="destructive" disabled>
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
