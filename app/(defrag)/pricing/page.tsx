"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for trying out DEFRAG",
    features: [
      "1 Birth Chart",
      "Basic Interpretation",
      "✗ Event Tracking",
      "✗ Relationships",
    ],
    priceId: undefined,
  },
  {
    name: "Pro",
    price: "$19/mo",
    description: "For ongoing personal development",
    features: [
      "Unlimited Charts",
      "Full Interpretation",
      "Event Tracking",
      "Relationships",
    ],
    // Note: This is a tier identifier, not a Stripe price ID
    // The backend API resolves "pro" → process.env.STRIPE_PRO_PRICE_ID
    priceId: "pro",
    popular: true,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (tier: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      alert("Failed to start checkout. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/defrag" className="flex items-center space-x-2">
            <span className="font-bold text-xl">DEFRAG</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/defrag/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/defrag/start">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Pricing Content */}
      <div className="container py-24">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Choose Your Plan
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you're ready. All plans include your
              Human Design blueprint and personalized guidance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`border rounded-lg p-8 ${tier.popular ? "border-2 border-primary" : ""}`}
              >
                <h2 className="text-2xl font-bold mb-4">{tier.name}</h2>
                <p className="text-3xl font-bold mb-6">{tier.price}</p>
                <ul className="space-y-2 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                {tier.priceId && (
                  <Button
                    onClick={() => handleSubscribe(tier.priceId!)}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? "Loading..." : "Upgrade Now"}
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Feature Comparison - Removed for MVP */}
        </div>
      </div>

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
