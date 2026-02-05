/**
 * DEFRAG Onboarding Page
 *
 * Placeholder for blueprint creation flow.
 * Full implementation would include multi-step form.
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-4 text-3xl font-bold">Create Your Blueprint</h1>
        <p className="mb-8 text-muted-foreground">
          This feature is currently under development. Full birth chart
          calculation and blueprint creation will be available soon.
        </p>

        <div className="rounded-lg border bg-card p-8">
          <h2 className="mb-4 text-xl font-semibold">Coming Soon:</h2>
          <ul className="mb-6 space-y-2 text-muted-foreground">
            <li>• Birth date and time input</li>
            <li>• Birth location search with geocoding</li>
            <li>• Precise astronomical calculations</li>
            <li>• Human Design chart generation</li>
            <li>• Type, Strategy, Authority analysis</li>
            <li>• Gate and center activations</li>
          </ul>

          <Button asChild>
            <Link href="/defrag/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
