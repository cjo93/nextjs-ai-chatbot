/**
 * DEFRAG Events List Page
 *
 * Placeholder for events listing.
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function EventsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Events</h1>
        <Button asChild>
          <Link href="/defrag/events/new">Log New Event</Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="mb-4 text-muted-foreground">
          Event logging and tracking is currently under development.
        </p>
        <p className="mb-6 text-sm text-muted-foreground">
          Coming soon: Log friction, breakpoints, and distortions with
          personalized grounding protocols.
        </p>
        <Button asChild variant="outline">
          <Link href="/defrag/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
