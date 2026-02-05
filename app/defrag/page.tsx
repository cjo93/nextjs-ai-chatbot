import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DefragLandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">DEFRAG</h1>
            <span className="text-sm text-muted-foreground">
              Physics of Personal Development
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium hover:underline"
            >
              Log In
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1">
        <div className="container px-4 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Your Blueprint for
              <br />
              <span className="text-primary">Breaking Through Distortion</span>
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              DEFRAG uses Human Design and physics-based modeling to help you
              understand stress, identify patterns, and find your way back to
              alignment—one inversion at a time.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg">Create Your Blueprint</Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t bg-muted/50">
        <div className="container px-4 py-24">
          <h3 className="mb-12 text-center text-3xl font-bold">How It Works</h3>
          <div className="grid gap-12 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                1
              </div>
              <h4 className="mb-2 text-xl font-semibold">
                Calculate Your Blueprint
              </h4>
              <p className="text-muted-foreground">
                Enter your birth data to generate your Human Design chart with
                personalized physics constants.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                2
              </div>
              <h4 className="mb-2 text-xl font-semibold">Log Your Events</h4>
              <p className="text-muted-foreground">
                Track stress events and distortions. DEFRAG maps them to your
                unique vector state and provides instant analysis.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                3
              </div>
              <h4 className="mb-2 text-xl font-semibold">
                Follow Inversion Protocols
              </h4>
              <p className="text-muted-foreground">
                Receive personalized scripts and experiments based on your type,
                authority, and current state.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t">
        <div className="container px-4 py-24">
          <h3 className="mb-12 text-center text-3xl font-bold">
            Powered by Science & Design
          </h3>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-lg border p-6">
              <h4 className="mb-2 text-xl font-semibold">
                Physics-Based Modeling
              </h4>
              <p className="text-muted-foreground">
                Your state is modeled as a physical system with mass,
                permeability, and elasticity. Stress applies force vectors that
                we track in real-time.
              </p>
            </div>
            <div className="rounded-lg border p-6">
              <h4 className="mb-2 text-xl font-semibold">Human Design</h4>
              <p className="text-muted-foreground">
                Built on 35+ years of Human Design wisdom. Your Type, Strategy,
                Authority, and Profile inform every protocol.
              </p>
            </div>
            <div className="rounded-lg border p-6">
              <h4 className="mb-2 text-xl font-semibold">SEDA Protocol</h4>
              <p className="text-muted-foreground">
                Somatic Emergency De-escalation Algorithm activates
                automatically in crisis situations, providing immediate support.
              </p>
            </div>
            <div className="rounded-lg border p-6">
              <h4 className="mb-2 text-xl font-semibold">
                Experiment Framework
              </h4>
              <p className="text-muted-foreground">
                Every inversion includes testable experiments. Track what works
                for you and build your personal playbook.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary text-primary-foreground">
        <div className="container px-4 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="mb-4 text-3xl font-bold">
              Ready to Break Through?
            </h3>
            <p className="mb-8 text-lg opacity-90">
              Join thousands using DEFRAG to understand their patterns, reduce
              distortion, and live in alignment.
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © 2026 DEFRAG. All rights reserved.
            </p>
            <nav className="flex gap-4">
              <Link
                href="/legal/terms"
                className="text-sm text-muted-foreground hover:underline"
              >
                Terms
              </Link>
              <Link
                href="/legal/privacy"
                className="text-sm text-muted-foreground hover:underline"
              >
                Privacy
              </Link>
              <Link
                href="/legal/disclaimer"
                className="text-sm text-muted-foreground hover:underline"
              >
                Disclaimer
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
