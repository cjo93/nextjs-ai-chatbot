import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Zap, Target, Network } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/defrag" className="flex items-center space-x-2">
            <span className="font-bold text-xl">DEFRAG</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/defrag/pricing">
              <Button variant="ghost">Pricing</Button>
            </Link>
            <Link href="/defrag/start">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-24 md:py-32 lg:py-40">
        <div className="mx-auto max-w-3xl text-center space-y-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Mechanical Clarity for Relational Dynamics
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Transform friction into understanding using Human Design mechanics
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/defrag/start">
              <Button size="lg" className="w-full sm:w-auto">
                Calculate Your Free Chart
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/defrag/pricing">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-24 bg-muted/50">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            How DEFRAG Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Your Blueprint</h3>
                <p className="text-muted-foreground">
                  Create your unique Human Design chart from birth data. We
                  calculate gates, profiles, authorities, and gene keys with
                  precision ephemeris data.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Physics Engine</h3>
                <p className="text-muted-foreground">
                  Your blueprint becomes a 3D vector state with mass,
                  permeability, and elasticity. Track how life events apply
                  forces to your resilience, autonomy, and connectivity.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Network className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Inversion Scripts</h3>
                <p className="text-muted-foreground">
                  Log any challenge or stress. Get personalized guidance based
                  on your gates, lines, and current vector state. High-severity
                  events trigger AI-powered SEDA analysis.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24">
        <Card className="mx-auto max-w-3xl text-center">
          <CardContent className="pt-12 pb-12 space-y-6">
            <h2 className="text-3xl font-bold">Ready to Begin?</h2>
            <p className="text-muted-foreground text-lg">
              Create your blueprint in under 2 minutes. Start with our free tier
              and upgrade as you grow.
            </p>
            <Link href="/defrag/start">
              <Button size="lg">
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 md:py-12">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 DEFRAG. All rights reserved.
          </p>
          <nav className="flex gap-6 text-sm">
            <Link href="/defrag/legal/terms" className="text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="/defrag/legal/privacy" className="text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="/defrag/legal/disclaimer" className="text-muted-foreground hover:text-foreground">
              Disclaimer
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
