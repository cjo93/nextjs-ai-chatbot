"use client";

import { Suspense, useEffect, useState } from "react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventForm } from "@/components/defrag/EventForm";
import { ScriptDisplay } from "@/components/defrag/ScriptDisplay";
import { logEvent } from "@/app/(defrag)/actions";
import { ArrowLeft } from "lucide-react";

export default function NewEventPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center">
          Loading...
        </div>
      }
    >
      <NewEventContent />
    </Suspense>
  );
}

function NewEventContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const blueprintId = searchParams.get("blueprintId");

  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string | null>(
    blueprintId
  );
  const [generatedEvent, setGeneratedEvent] = useState<{
    eventId: string;
    script: string;
  } | null>(null);

  if (!blueprintId) {
    // In a real implementation, you'd fetch user's blueprints and show a selector
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Blueprint Selected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Please select a blueprint from your dashboard first.
            </p>
            <Link href="/defrag/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (data: {
    blueprintId: string;
    severity: "signal" | "friction" | "breakpoint" | "distortion" | "anomaly";
    severityNumeric: number;
    context: string;
    keywords?: string[];
  }) => {
    const result = await logEvent(data);

    if (result.success && result.eventId && result.script) {
      setGeneratedEvent({
        eventId: result.eventId,
        script: result.script,
      });
    } else {
      throw new Error("Failed to log event");
    }
  };

  const handleSuccess = () => {
    // Form was reset, scroll to top to see the generated script
    window.scrollTo({ top: 0, behavior: "smooth" });
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
            <span className="font-bold text-xl">Log Event</span>
          </div>
        </div>
      </header>

      <div className="container py-8 max-w-3xl space-y-8">
        {/* Generated Script Display */}
        {generatedEvent && (
          <div className="space-y-4">
            <ScriptDisplay
              script={generatedEvent.script}
            />
            <div className="flex gap-4">
              <Link href={`/events/${generatedEvent.eventId}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  View Event Details
                </Button>
              </Link>
              <Button
                variant="ghost"
                onClick={() => setGeneratedEvent(null)}
                className="flex-1"
              >
                Log Another Event
              </Button>
            </div>
          </div>
        )}

        {/* Event Form */}
        <EventForm
          blueprintId={blueprintId}
          onSubmit={handleSubmit}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}
