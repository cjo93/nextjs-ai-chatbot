import { Suspense } from "react";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/utils";
import {
  blueprint as blueprintTable,
  vectorState as vectorStateTable,
  event as eventTable,
} from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus } from "lucide-react";

export default function BlueprintDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center">
          Loading...
        </div>
      }
    >
      <BlueprintDetailContent blueprintId={params.id} />
    </Suspense>
  );
}

async function BlueprintDetailContent({ blueprintId }: { blueprintId: string }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Fetch blueprint with related data
  const [blueprintData] = await db
    .select()
    .from(blueprintTable)
    .where(
      and(eq(blueprintTable.id, blueprintId), eq(blueprintTable.userId, userId))
    )
    .limit(1);

  if (!blueprintData) {
    notFound();
  }

  // Fetch latest vector state
  const [latestVectorState] = await db
    .select()
    .from(vectorStateTable)
    .where(eq(vectorStateTable.blueprintId, blueprintId))
    .orderBy(desc(vectorStateTable.timestamp))
    .limit(1);

  // Fetch recent events
  const recentEvents = await db
    .select()
    .from(eventTable)
    .where(eq(eventTable.blueprintId, blueprintId))
    .orderBy(desc(eventTable.createdAt))
    .limit(10);

  const humanDesign = blueprintData.humanDesign as {
    type?: string;
    profile?: string;
    authority?: string;
    definition?: string;
    incarnationCross?: string;
    centers?: Record<string, { defined: boolean }>;
    gates?: Array<{ gate: number; line: number; planet: string }>;
  };

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <span className="font-bold text-xl">{blueprintData.name}</span>
          </div>
          <Link href={`/events/new?blueprintId=${blueprintId}`}>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Log Event
            </Button>
          </Link>
        </div>
      </header>

      <div className="container py-8 space-y-8">
        {/* Blueprint Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{blueprintData.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Born {new Date(blueprintData.birthDate).toLocaleDateString()} at{" "}
                  {new Date(blueprintData.birthDate).toLocaleTimeString()}
                </p>
              </div>
              <Badge
                variant="secondary"
                className={
                  blueprintData.fidelityScore === "HIGH"
                    ? "bg-green-500/10 text-green-700"
                    : blueprintData.fidelityScore === "MEDIUM"
                    ? "bg-yellow-500/10 text-yellow-700"
                    : "bg-red-500/10 text-red-700"
                }
              >
                {blueprintData.fidelityScore} Fidelity
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Human Design Chart */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Human Design</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {humanDesign.type && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{humanDesign.type}</span>
                </div>
              )}
              {humanDesign.profile && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Profile:</span>
                  <span className="font-medium">{humanDesign.profile}</span>
                </div>
              )}
              {humanDesign.authority && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Authority:</span>
                  <span className="font-medium">{humanDesign.authority}</span>
                </div>
              )}
              {humanDesign.definition && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Definition:</span>
                  <span className="font-medium">{humanDesign.definition}</span>
                </div>
              )}
              {humanDesign.incarnationCross && (
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">
                    Incarnation Cross:
                  </span>
                  <span className="font-medium text-sm">
                    {humanDesign.incarnationCross}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vector State */}
          {latestVectorState && (
            <Card>
              <CardHeader>
                <CardTitle>Vector State</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Resilience (X):</span>
                    <span className="font-medium">
                      {latestVectorState.xResilience.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${(latestVectorState.xResilience / 10) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Autonomy (Y):</span>
                    <span className="font-medium">
                      {latestVectorState.yAutonomy.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{
                        width: `${(latestVectorState.yAutonomy / 10) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Connectivity (Z):
                    </span>
                    <span className="font-medium">
                      {latestVectorState.zConnectivity.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500"
                      style={{
                        width: `${(latestVectorState.zConnectivity / 10) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="pt-3 border-t grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <p className="text-muted-foreground">Mass</p>
                    <p className="font-medium">
                      {latestVectorState.mass.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">Permeability</p>
                    <p className="font-medium">
                      {latestVectorState.permeability.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">Elasticity</p>
                    <p className="font-medium">
                      {latestVectorState.elasticity.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Gates & Channels */}
        {humanDesign.gates && humanDesign.gates.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Active Gates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {humanDesign.gates.slice(0, 12).map((gate, index) => (
                  <div
                    key={index}
                    className="p-2 rounded-lg bg-muted text-center"
                  >
                    <p className="font-semibold">
                      Gate {gate.gate}.{gate.line}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {gate.planet}
                    </p>
                  </div>
                ))}
              </div>
              {humanDesign.gates.length > 12 && (
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  +{humanDesign.gates.length - 12} more gates
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Events</CardTitle>
              <Link href={`/events/new?blueprintId=${blueprintId}`}>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Event
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentEvents.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No events logged yet
              </p>
            ) : (
              <div className="divide-y">
                {recentEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="block py-3 hover:bg-muted/50 -mx-6 px-6 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.createdAt).toLocaleDateString()}
                        </p>
                        <p className="line-clamp-1">{event.context}</p>
                      </div>
                      <Badge variant="outline" className="capitalize ml-4">
                        {event.severity}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
