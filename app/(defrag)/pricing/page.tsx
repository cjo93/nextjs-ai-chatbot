/**
 * DEFRAG Pricing Page
 *
 * Displays pricing tiers and features with Stripe checkout integration.
 */

import { CheckIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with basic features",
    features: [
      "1 blueprint",
      "3 events per month",
      "Severity levels 1-2 only",
      "Basic grounding scripts",
      "Experiment tracking",
    ],
    limitations: [
      "No relationship compatibility",
      "No API access",
      "Limited event types",
    ],
    cta: "Get Started",
    ctaLink: "/defrag/onboarding",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "per month",
    description: "For serious self-development",
    features: [
      "Unlimited blueprints",
      "Unlimited events",
      "All severity levels (1-5)",
      "Advanced grounding protocols",
      "Relationship compatibility",
      "Vector state visualizations",
      "Priority support",
    ],
    limitations: ["No API access"],
    cta: "Upgrade to Pro",
    ctaLink: "/api/stripe/create-checkout",
    priceId: process.env.STRIPE_PRICE_PRO_MONTHLY,
    tier: "pro",
    highlighted: true,
  },
  {
    name: "Lineage",
    price: "$99",
    period: "per month",
    description: "For professionals and families",
    features: [
      "Everything in Pro",
      "API access",
      "Family mapping",
      "Lineage analysis",
      "Custom integrations",
      "Bulk blueprint creation",
      "White-glove support",
    ],
    limitations: [],
    cta: "Upgrade to Lineage",
    ctaLink: "/api/stripe/create-checkout",
    priceId: process.env.STRIPE_PRICE_LINEAGE_MONTHLY,
    tier: "lineage",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <section className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold">Simple, Transparent Pricing</h1>
        <p className="text-lg text-muted-foreground">
          Choose the plan that fits your needs. Cancel anytime.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="mb-16">
        <div className="grid gap-8 md:grid-cols-3">
          {pricingTiers.map((tier) => (
            <div
              className={`relative flex flex-col rounded-lg border p-8 ${
                tier.highlighted ? "border-primary shadow-lg" : "border-border"
              }`}
              key={tier.name}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="mb-2 text-2xl font-bold">{tier.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    / {tier.period}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {tier.description}
                </p>
              </div>

              <div className="mb-6 flex-1">
                <p className="mb-4 text-sm font-semibold">Includes:</p>
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li className="flex items-start gap-2" key={feature}>
                      <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {tier.limitations.length > 0 && (
                  <>
                    <p className="mb-4 mt-6 text-sm font-semibold text-muted-foreground">
                      Not included:
                    </p>
                    <ul className="space-y-3">
                      {tier.limitations.map((limitation) => (
                        <li
                          className="flex items-start gap-2 text-muted-foreground"
                          key={limitation}
                        >
                          <span className="mt-0.5 text-sm">•</span>
                          <span className="text-sm">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              {tier.priceId ? (
                <form action={tier.ctaLink} method="POST">
                  <input name="priceId" type="hidden" value={tier.priceId} />
                  <input name="tier" type="hidden" value={tier.tier} />
                  <Button
                    className="w-full"
                    type="submit"
                    variant={tier.highlighted ? "default" : "outline"}
                  >
                    {tier.cta}
                  </Button>
                </form>
              ) : (
                <Button
                  asChild
                  className="w-full"
                  variant={tier.highlighted ? "default" : "outline"}
                >
                  <Link href={tier.ctaLink}>{tier.cta}</Link>
                </Button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-16">
        <h2 className="mb-8 text-center text-3xl font-bold">
          Frequently Asked Questions
        </h2>
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="rounded-lg border p-6">
            <h3 className="mb-2 text-lg font-semibold">
              What's included in the free tier?
            </h3>
            <p className="text-muted-foreground">
              The free tier includes 1 blueprint and 3 events per month with
              severity levels 1-2 (signal and friction). It's perfect for
              getting started and understanding how DEFRAG works.
            </p>
          </div>

          <div className="rounded-lg border p-6">
            <h3 className="mb-2 text-lg font-semibold">
              Can I cancel anytime?
            </h3>
            <p className="text-muted-foreground">
              Yes! You can cancel your subscription at any time. You'll continue
              to have access until the end of your current billing period, then
              you'll be downgraded to the free tier.
            </p>
          </div>

          <div className="rounded-lg border p-6">
            <h3 className="mb-2 text-lg font-semibold">
              What's the difference between Pro and Lineage?
            </h3>
            <p className="text-muted-foreground">
              Pro is perfect for individuals focused on personal development.
              Lineage adds API access and family mapping features, making it
              ideal for professionals, coaches, or families who want to analyze
              multiple blueprints and build custom integrations.
            </p>
          </div>

          <div className="rounded-lg border p-6">
            <h3 className="mb-2 text-lg font-semibold">
              How accurate is the birth chart calculation?
            </h3>
            <p className="text-muted-foreground">
              We use professional-grade astronomical calculations to determine
              planetary positions at your time of birth. For maximum accuracy,
              provide your exact birth time. If you don't know your birth time,
              we'll use noon as a default and indicate lower fidelity.
            </p>
          </div>

          <div className="rounded-lg border p-6">
            <h3 className="mb-2 text-lg font-semibold">Is my data private?</h3>
            <p className="text-muted-foreground">
              Yes. Your blueprints, events, and experiments are completely
              private. We never share your personal data with third parties. You
              can export or delete your data at any time from settings.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-lg bg-muted p-12 text-center">
        <h2 className="mb-4 text-3xl font-bold">Start Your Journey Today</h2>
        <p className="mb-8 text-lg text-muted-foreground">
          No credit card required for the free tier.
        </p>
        <Button asChild size="lg">
          <Link href="/defrag/onboarding">Get Your Free Blueprint</Link>
        </Button>
      </section>
    </div>
  );
}
