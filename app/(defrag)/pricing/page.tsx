"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PricingCard } from "@/components/defrag/PricingCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const pricingTiers = [
  {
    name: "Free",
    price: "Free",
    description: "Perfect for trying out DEFRAG",
    features: [
      "1 blueprint",
      "5 events per month",
      "Basic inversion scripts",
      "Human Design chart",
      "Community support",
    ],
    priceId: undefined,
    tier: "free" as const,
  },
  {
    name: "Pro",
    price: "$19",
    description: "For serious personal development",
    features: [
      "10 blueprints",
      "100 events per month",
      "AI-powered SEDA scripts",
      "Experiment tracking",
      "Vector state visualization",
      "Priority support",
      "Export data",
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    tier: "pro" as const,
    popular: true,
  },
  {
    name: "Lineage",
    price: "$99",
    description: "For families and relationships",
    features: [
      "Unlimited blueprints",
      "Unlimited events",
      "AI-powered SEDA scripts",
      "Relationship synastry",
      "Family dynamics analysis",
      "Advanced experiments",
      "Custom insights",
      "White-glove support",
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_LINEAGE_PRICE_ID,
    tier: "lineage" as const,
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
            <Link href="/defrag/onboarding">
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

          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tierData) => (
              <PricingCard
                key={tierData.name}
                name={tierData.name}
                price={tierData.price}
                description={tierData.description}
                features={tierData.features}
                priceId={tierData.priceId}
                popular={tierData.popular}
                onSubscribe={() => handleSubscribe(tierData.tier)}
                isLoading={isLoading}
              />
            ))}
          </div>

          {/* Feature Comparison */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8">
              Detailed Comparison
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">Feature</th>
                    <th className="text-center p-4 font-semibold">Free</th>
                    <th className="text-center p-4 font-semibold">Pro</th>
                    <th className="text-center p-4 font-semibold">Lineage</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b">
                    <td className="p-4">Blueprints</td>
                    <td className="text-center p-4">1</td>
                    <td className="text-center p-4">10</td>
                    <td className="text-center p-4">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Events per month</td>
                    <td className="text-center p-4">5</td>
                    <td className="text-center p-4">100</td>
                    <td className="text-center p-4">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Inversion scripts</td>
                    <td className="text-center p-4">Basic</td>
                    <td className="text-center p-4">AI-powered</td>
                    <td className="text-center p-4">AI-powered</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Relationship synastry</td>
                    <td className="text-center p-4">-</td>
                    <td className="text-center p-4">-</td>
                    <td className="text-center p-4">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Experiment tracking</td>
                    <td className="text-center p-4">-</td>
                    <td className="text-center p-4">✓</td>
                    <td className="text-center p-4">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Support</td>
                    <td className="text-center p-4">Community</td>
                    <td className="text-center p-4">Priority</td>
                    <td className="text-center p-4">White-glove</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
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
