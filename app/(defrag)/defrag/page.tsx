/**
 * DEFRAG Landing Page
 *
 * Introduction to the DEFRAG platform with CTA to get started.
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DefragPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="mb-16 text-center">
        <h1 className="mb-4 text-5xl font-bold">Welcome to DEFRAG</h1>
        <p className="mb-8 text-xl text-muted-foreground">
          Deterministic Emotional/Friction Analysis & Grounding
        </p>
        <p className="mx-auto mb-8 max-w-2xl text-lg">
          Transform emotional friction into actionable insights using your
          unique Human Design blueprint. DEFRAG provides personalized grounding
          protocols and experiments tailored to your authentic self.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/defrag/onboarding">Get Your Free Blueprint</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/defrag/pricing">View Pricing</Link>
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-16">
        <h2 className="mb-8 text-center text-3xl font-bold">
          How DEFRAG Works
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-lg border p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              1
            </div>
            <h3 className="mb-2 text-xl font-semibold">
              Create Your Blueprint
            </h3>
            <p className="text-muted-foreground">
              Enter your birth data to generate your unique Human Design chart.
              We calculate your Type, Strategy, Authority, and active gates.
            </p>
          </div>

          <div className="rounded-lg border p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              2
            </div>
            <h3 className="mb-2 text-xl font-semibold">Log Emotional Events</h3>
            <p className="text-muted-foreground">
              Track friction, breakpoints, or distortions as they happen. DEFRAG
              analyzes your events through the lens of your blueprint.
            </p>
          </div>

          <div className="rounded-lg border p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              3
            </div>
            <h3 className="mb-2 text-xl font-semibold">Ground & Experiment</h3>
            <p className="text-muted-foreground">
              Receive personalized grounding scripts and testable experiments.
              Track what works and build your recovery toolkit.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mb-16">
        <h2 className="mb-8 text-center text-3xl font-bold">Core Features</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border p-6">
            <h3 className="mb-2 text-lg font-semibold">
              🧬 Human Design Integration
            </h3>
            <p className="text-muted-foreground">
              Precise birth chart calculations with planetary positions, gates,
              centers, and profile analysis.
            </p>
          </div>

          <div className="rounded-lg border p-6">
            <h3 className="mb-2 text-lg font-semibold">
              📊 Physics-Based Modeling
            </h3>
            <p className="text-muted-foreground">
              Track emotional states in 3D vector space (Resilience, Autonomy,
              Connectivity) with deterministic physics.
            </p>
          </div>

          <div className="rounded-lg border p-6">
            <h3 className="mb-2 text-lg font-semibold">
              💬 Inversion Protocols
            </h3>
            <p className="text-muted-foreground">
              Get context-aware grounding scripts based on your gates and
              current severity level.
            </p>
          </div>

          <div className="rounded-lg border p-6">
            <h3 className="mb-2 text-lg font-semibold">
              🧪 Testable Experiments
            </h3>
            <p className="text-muted-foreground">
              Every event generates hypothesis-driven experiments to help you
              discover what actually works for you.
            </p>
          </div>

          <div className="rounded-lg border p-6">
            <h3 className="mb-2 text-lg font-semibold">🚨 SEDA Protocol</h3>
            <p className="text-muted-foreground">
              Automatic crisis detection triggers structured grounding when you
              need it most.
            </p>
          </div>

          <div className="rounded-lg border p-6">
            <h3 className="mb-2 text-lg font-semibold">
              💑 Relationship Synastry <span className="text-xs">(Pro+)</span>
            </h3>
            <p className="text-muted-foreground">
              Analyze compatibility between two blueprints to understand
              relationship dynamics.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="rounded-lg bg-muted p-12 text-center">
        <h2 className="mb-4 text-3xl font-bold">Ready to Start?</h2>
        <p className="mb-8 text-lg text-muted-foreground">
          Create your free blueprint and log your first 3 events at no cost.
        </p>
        <Button asChild size="lg">
          <Link href="/defrag/onboarding">Get Started Free</Link>
        </Button>
      </section>
    </div>
  );
}
