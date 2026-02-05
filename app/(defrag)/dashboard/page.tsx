/**
 * DEFRAG Dashboard
 *
 * Main dashboard showing overview of user's DEFRAG data.
 */

import { and, desc, eq, gte } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { blueprint, event, experiment } from "@/lib/db/schema";
import { getUserSubscription } from "@/lib/defrag/subscription";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch user data
  const [userSubscription, userBlueprints, recentEvents, activeExperiments] =
    await Promise.all([
      getUserSubscription(session.user.id),
      db
        .select()
        .from(blueprint)
        .where(eq(blueprint.userId, session.user.id))
        .orderBy(desc(blueprint.createdAt))
        .limit(5),
      db
        .select()
        .from(event)
        .where(eq(event.userId, session.user.id))
        .orderBy(desc(event.createdAt))
        .limit(5),
      db
        .select()
        .from(experiment)
        .where(
          and(
            eq(experiment.status, "active")
            // Note: We need to join with blueprint to filter by userId
          )
        )
        .orderBy(desc(experiment.startedAt))
        .limit(5),
    ]);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const eventsThisMonth = await db
    .select()
    .from(event)
    .where(
      and(
        eq(event.userId, session.user.id),
        gte(event.createdAt, thirtyDaysAgo)
      )
    );

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <section className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's your DEFRAG overview.
        </p>
      </section>

      {/* Subscription Status */}
      <section className="mb-8">
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Current Plan: {userSubscription.tier.toUpperCase()}
              </h2>
              <p className="text-sm text-muted-foreground">
                {userSubscription.tier === "free" && (
                  <>
                    {userSubscription.eventsThisPeriod} / 3 events used this
                    month
                  </>
                )}
                {userSubscription.tier !== "free" && (
                  <>Unlimited events and blueprints</>
                )}
              </p>
            </div>
            {userSubscription.tier === "free" && (
              <Button asChild>
                <Link href="/defrag/pricing">Upgrade</Link>
              </Button>
            )}
            {userSubscription.tier !== "free" && (
              <Button asChild variant="outline">
                <Link href="/defrag/settings">Manage Subscription</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="mb-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-6">
            <div className="mb-2 text-sm font-medium text-muted-foreground">
              Blueprints
            </div>
            <div className="text-3xl font-bold">{userBlueprints.length}</div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="mb-2 text-sm font-medium text-muted-foreground">
              Events This Month
            </div>
            <div className="text-3xl font-bold">{eventsThisMonth.length}</div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="mb-2 text-sm font-medium text-muted-foreground">
              Active Experiments
            </div>
            <div className="text-3xl font-bold">{activeExperiments.length}</div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          {userBlueprints.length === 0 ? (
            <Button asChild>
              <Link href="/defrag/onboarding">Create Your First Blueprint</Link>
            </Button>
          ) : (
            <>
              <Button asChild>
                <Link href="/defrag/events/new">Log New Event</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/defrag/onboarding">Create Another Blueprint</Link>
              </Button>
              {userSubscription.tier !== "free" && (
                <Button asChild variant="outline">
                  <Link href="/defrag/relationships/new">
                    Analyze Relationship
                  </Link>
                </Button>
              )}
            </>
          )}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Blueprints */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="mb-4 font-semibold">Your Blueprints</h3>
            {userBlueprints.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No blueprints yet. Create your first one to get started!
              </p>
            ) : (
              <div className="space-y-3">
                {userBlueprints.map((bp) => (
                  <Link
                    className="block rounded-md border p-3 hover:bg-muted"
                    href={`/defrag/blueprint/${bp.id}`}
                    key={bp.id}
                  >
                    <div className="font-medium">{bp.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Created {new Date(bp.createdAt).toLocaleDateString()}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Events */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="mb-4 font-semibold">Recent Events</h3>
            {recentEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No events logged yet. Log your first event to begin tracking.
              </p>
            ) : (
              <div className="space-y-3">
                {recentEvents.map((evt) => (
                  <Link
                    className="block rounded-md border p-3 hover:bg-muted"
                    href={`/defrag/events/${evt.id}`}
                    key={evt.id}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{evt.severity}</span>
                      <span className="text-xs text-muted-foreground">
                        Level {evt.severityNumeric}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {new Date(evt.createdAt).toLocaleDateString()}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Active Experiments */}
      {activeExperiments.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Active Experiments</h2>
          <div className="space-y-4">
            {activeExperiments.map((exp) => (
              <Link
                className="block rounded-lg border bg-card p-6 hover:bg-muted"
                href={`/defrag/experiments/${exp.id}`}
                key={exp.id}
              >
                <div className="mb-2 font-semibold">{exp.hypothesis}</div>
                <div className="text-sm text-muted-foreground">
                  Started {new Date(exp.startedAt).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
