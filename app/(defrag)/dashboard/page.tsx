import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/utils";
import {
  blueprint as blueprintTable,
  event as eventTable,
  subscription as subscriptionTable,
} from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BlueprintCard } from "@/components/defrag/BlueprintCard";
import { Plus, FileText, Settings } from "lucide-react";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center">
          Loading...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Fetch user data
  const [blueprints, recentEvents, userSubscription] = await Promise.all([
    db
      .select({
        blueprint: blueprintTable,
        eventCount: sql<number>`count(${eventTable.id})`,
      })
      .from(blueprintTable)
      .leftJoin(eventTable, eq(eventTable.blueprintId, blueprintTable.id))
      .where(eq(blueprintTable.userId, userId))
      .groupBy(blueprintTable.id)
      .orderBy(desc(blueprintTable.createdAt)),
    db
      .select()
      .from(eventTable)
      .where(eq(eventTable.userId, userId))
      .orderBy(desc(eventTable.createdAt))
      .limit(5),
    db
      .select()
      .from(subscriptionTable)
      .where(eq(subscriptionTable.userId, userId))
      .limit(1),
  ]);

  const subscription = userSubscription[0];

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/defrag/dashboard" className="flex items-center space-x-2">
            <span className="font-bold text-xl">DEFRAG</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/defrag/events/new">
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Log Event
              </Button>
            </Link>
            <Link href="/defrag/settings">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <div className="container py-8 space-y-8">
        {/* Subscription Status */}
        {subscription && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Current Plan
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold capitalize">
                      {subscription.tier}
                    </p>
                    <Badge variant="secondary">{subscription.status}</Badge>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm text-muted-foreground">Usage</p>
                  <p className="text-lg font-medium">
                    {subscription.eventsThisPeriod} events
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {subscription.blueprintsCreated} blueprints
                  </p>
                </div>
                <Link href="/defrag/pricing">
                  <Button>Upgrade</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Blueprints Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Your Blueprints</h2>
            <Link href="/defrag/onboarding">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Blueprint
              </Button>
            </Link>
          </div>

          {blueprints.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No blueprints yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Create your first blueprint to get started
                </p>
                <Link href="/defrag/onboarding">
                  <Button>Create Blueprint</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {blueprints.map(({ blueprint, eventCount }) => (
                <BlueprintCard
                  key={blueprint.id}
                  id={blueprint.id}
                  name={blueprint.name}
                  birthDate={blueprint.birthDate}
                  humanDesign={
                    blueprint.humanDesign as {
                      type?: string;
                      profile?: string;
                      authority?: string;
                    }
                  }
                  fidelityScore={blueprint.fidelityScore}
                  eventCount={eventCount}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recent Events */}
        {recentEvents.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Recent Events</h2>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {recentEvents.map((event) => (
                    <Link
                      key={event.id}
                      href={`/defrag/events/${event.id}`}
                      className="block p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.createdAt).toLocaleDateString()}
                          </p>
                          <p className="line-clamp-2">{event.context}</p>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {event.severity}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <Link href="/defrag/events/new">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Log New Event
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Track a challenge or significant life event
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <Link href="/defrag/settings">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage subscription and preferences
                </p>
              </CardContent>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
