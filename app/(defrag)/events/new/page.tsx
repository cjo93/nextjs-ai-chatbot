/**
 * DEFRAG New Event Page
 *
 * Placeholder for event logging form.
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewEventPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-4 text-3xl font-bold">Log New Event</h1>
        <p className="mb-8 text-muted-foreground">
          Event logging with inversion protocols is currently under development.
        </p>

        <div className="rounded-lg border bg-card p-8">
          <h2 className="mb-4 text-xl font-semibold">Coming Soon:</h2>
          <ul className="mb-6 space-y-2 text-muted-foreground">
            <li>• Severity level selection (1-5)</li>
            <li>• Context description input</li>
            <li>• Real-time blueprint analysis</li>
            <li>• Personalized grounding scripts</li>
            <li>• Testable experiments generation</li>
            <li>• Vector state tracking</li>
            <li>• SEDA protocol activation</li>
          </ul>

          <Button asChild>
            <Link href="/defrag/events">Back to Events</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
