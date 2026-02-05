"use client";

import { Suspense, useState } from "react";
import { redirect, notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScriptDisplay } from "@/components/defrag/ScriptDisplay";
import { recordInversionOutcome } from "@/app/(defrag)/actions";
import { ArrowLeft, ThumbsUp, ThumbsDown } from "lucide-react";

// This would normally be a server component fetching data
// For now, using client-side pattern
export default function EventDetailPage({
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
      <EventDetailContent eventId={params.id} />
    </Suspense>
  );
}

function EventDetailContent({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState<number>(5);

  // In a real app, fetch event data here
  // For now, showing structure
  const handleFeedback = async (wasHelpful: boolean) => {
    try {
      await recordInversionOutcome({
        eventId,
        wasHelpful,
        clarityRating: rating,
        feedbackText: feedback.trim() || undefined,
      });
      setFeedbackSubmitted(true);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
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
                Back
              </Button>
            </Link>
            <span className="font-bold text-xl">Event Details</span>
          </div>
        </div>
      </header>

      <div className="container py-8 max-w-4xl space-y-8">
        {/* Event Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Event #{eventId.slice(0, 8)}</CardTitle>
                <CardDescription>Logged on [Date]</CardDescription>
              </div>
              <Badge variant="outline">Severity Level</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Context</Label>
                <p className="text-sm mt-1 text-muted-foreground">
                  [Event context would be loaded here]
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inversion Script */}
        <ScriptDisplay
          script="[Script would be loaded here]"
          scriptSource="deterministic"
          diagnosis={{ gate: "64", line: "3", theme: "Confusion" }}
          severity="friction"
        />

        {/* Feedback Section */}
        {!feedbackSubmitted ? (
          <Card>
            <CardHeader>
              <CardTitle>Was this helpful?</CardTitle>
              <CardDescription>
                Your feedback helps us improve the inversion scripts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleFeedback(true)}
                >
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  Yes, helpful
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleFeedback(false)}
                >
                  <ThumbsDown className="mr-2 h-4 w-4" />
                  Not helpful
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">Clarity Rating (1-10)</Label>
                <input
                  type="range"
                  id="rating"
                  min="1"
                  max="10"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Unclear</span>
                  <span className="font-medium">{rating}</span>
                  <span>Very Clear</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback">Additional Feedback (optional)</Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us what worked or what could be better..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-lg font-medium text-green-600">
                Thank you for your feedback!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Experiments Section */}
        <Card>
          <CardHeader>
            <CardTitle>Experiments</CardTitle>
            <CardDescription>
              Track actions based on this event's guidance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-4">
              No experiments yet. Create one from the dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
