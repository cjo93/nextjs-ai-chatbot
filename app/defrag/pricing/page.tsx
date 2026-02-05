import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function PricingPage() {
  const tiers = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for exploring DEFRAG",
      features: [
        "1 Blueprint",
        "10 Events per month",
        "Basic inversion protocols",
        "Community support",
      ],
      cta: "Get Started",
      href: "/register",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$29",
      period: "per month",
      description: "For serious personal development",
      features: [
        "5 Blueprints",
        "100 Events per month",
        "Advanced protocols",
        "5 Relationships",
        "Experiment tracking",
        "Priority support",
        "Analytics dashboard",
      ],
      cta: "Start Pro Trial",
      href: "/register?tier=pro",
      highlighted: true,
    },
    {
      name: "Lineage",
      price: "$99",
      period: "per month",
      description: "For families and practitioners",
      features: [
        "Unlimited Blueprints",
        "Unlimited Events",
        "All protocols",
        "Unlimited Relationships",
        "Advanced synastry",
        "White-glove support",
        "Custom integrations",
        "API access",
      ],
      cta: "Contact Sales",
      href: "/register?tier=lineage",
      highlighted: false,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">DEFRAG</h1>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium hover:underline">
              Home
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium hover:underline"
            >
              Log In
            </Link>
          </nav>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="flex-1 py-24">
        <div className="container px-4">
          <div className="mx-auto max-w-5xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold">
                Choose Your Path to Alignment
              </h2>
              <p className="text-lg text-muted-foreground">
                Start free. Upgrade anytime. Cancel anytime.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {tiers.map((tier) => (
                <div
                  key={tier.name}
                  className={`flex flex-col rounded-lg border p-8 ${
                    tier.highlighted
                      ? "border-primary shadow-lg ring-2 ring-primary"
                      : ""
                  }`}
                >
                  {tier.highlighted && (
                    <div className="mb-4 inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      MOST POPULAR
                    </div>
                  )}
                  <h3 className="mb-2 text-2xl font-bold">{tier.name}</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {tier.description}
                  </p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      / {tier.period}
                    </span>
                  </div>
                  <ul className="mb-8 flex-1 space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={tier.href}>
                    <Button
                      className="w-full"
                      variant={tier.highlighted ? "default" : "outline"}
                      size="lg"
                    >
                      {tier.cta}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>

            {/* FAQ */}
            <div className="mt-24">
              <h3 className="mb-12 text-center text-3xl font-bold">
                Frequently Asked Questions
              </h3>
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <h4 className="mb-2 font-semibold">
                    What's a Blueprint?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Your Blueprint is your Human Design chart—a unique map of
                    your energetic makeup calculated from your birth data. It
                    includes your Type, Strategy, Authority, and all gates.
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">
                    What happens when I hit my event limit?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    You'll be prompted to upgrade. Your existing data remains
                    intact, you just won't be able to log new events until the
                    next billing period or upgrade.
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">
                    Can I cancel anytime?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Yes. Cancel anytime from your settings. You'll keep access
                    until the end of your billing period, then revert to the
                    Free tier.
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">
                    Is my data secure?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Absolutely. We use bank-level encryption for all data at
                    rest and in transit. We never sell or share your personal
                    information.
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">
                    What's the SEDA protocol?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Somatic Emergency De-escalation Algorithm. If DEFRAG detects
                    crisis language in your events, it immediately activates a
                    4-phase grounding protocol.
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">
                    Do you offer refunds?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    We offer a 30-day money-back guarantee on your first payment.
                    Just email support@defrag.app and we'll process it
                    immediately.
                  </p>
                </div>
              </div>
            </div>
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
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
