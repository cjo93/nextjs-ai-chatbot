/**
 * DEFRAG Pricing Page
 */

import Link from "next/link";
import { auth } from "@/app/(auth)/auth";
import { TIER_LIMITS } from "@/lib/defrag/types";

export default async function PricingPage() {
  const session = await auth();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-950 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-xl text-zinc-400">
              Choose the plan that fits your journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Tier */}
            <div className="bg-zinc-800/50 p-8 rounded-lg border border-zinc-700">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-zinc-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>{TIER_LIMITS.free.blueprints} Blueprint</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>{TIER_LIMITS.free.eventsPerMonth} Events/month</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-zinc-600">✗</span>
                  <span className="text-zinc-500">Analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-zinc-600">✗</span>
                  <span className="text-zinc-500">Experiments</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-zinc-600">✗</span>
                  <span className="text-zinc-500">Relationships</span>
                </li>
              </ul>
              <Link
                href="/register"
                className="block text-center px-6 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg font-semibold transition-colors"
              >
                Get Started
              </Link>
            </div>
            
            {/* Basic Tier */}
            <div className="bg-zinc-800/50 p-8 rounded-lg border-2 border-blue-500 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 px-4 py-1 rounded-full text-sm font-semibold">
                Popular
              </div>
              <h3 className="text-2xl font-bold mb-2">Basic</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$9.99</span>
                <span className="text-zinc-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>{TIER_LIMITS.basic.blueprints} Blueprints</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>{TIER_LIMITS.basic.eventsPerMonth} Events/month</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Analytics Dashboard</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-zinc-600">✗</span>
                  <span className="text-zinc-500">Experiments</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-zinc-600">✗</span>
                  <span className="text-zinc-500">Relationships</span>
                </li>
              </ul>
              {session?.user ? (
                <button
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                  onClick={() => {
                    // TODO: Integrate with Stripe
                    alert("Stripe integration coming soon!");
                  }}
                >
                  Upgrade to Basic
                </button>
              ) : (
                <Link
                  href="/register"
                  className="block text-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                >
                  Get Started
                </Link>
              )}
            </div>
            
            {/* Pro Tier */}
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-8 rounded-lg border border-purple-500/50">
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$29.99</span>
                <span className="text-zinc-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Unlimited Blueprints</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Unlimited Events</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Advanced Analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Experiments</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Relationship Synastry</span>
                </li>
              </ul>
              {session?.user ? (
                <button
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold transition-colors"
                  onClick={() => {
                    // TODO: Integrate with Stripe
                    alert("Stripe integration coming soon!");
                  }}
                >
                  Upgrade to Pro
                </button>
              ) : (
                <Link
                  href="/register"
                  className="block text-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold transition-colors"
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
          
          {/* FAQ */}
          <div className="mt-16 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">What is Human Design?</h3>
                <p className="text-zinc-400">
                  Human Design is a synthesis of ancient wisdom and modern science that provides a unique blueprint 
                  for understanding your energy, decision-making, and life purpose.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">How accurate is the birth time requirement?</h3>
                <p className="text-zinc-400">
                  Birth time accuracy is important for precise chart calculation. If you don't know your exact birth time, 
                  a general time (within 1-2 hours) will still provide valuable insights.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Can I cancel anytime?</h3>
                <p className="text-zinc-400">
                  Yes! You can cancel your subscription at any time. You'll continue to have access until the end of 
                  your billing period.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
