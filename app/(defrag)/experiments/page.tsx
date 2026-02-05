/**
 * DEFRAG Experiments List Page
 *
 * Placeholder for experiments tracking.
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ExperimentsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Experiments</h1>

      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="mb-4 text-muted-foreground">
          Experiment tracking is currently under development.
        </p>
        <p className="mb-6 text-sm text-muted-foreground">
          Coming soon: Track hypothesis-driven experiments and discover what
          works for your unique blueprint.
        </p>
        <Button asChild variant="outline">
          <Link href="/defrag/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
