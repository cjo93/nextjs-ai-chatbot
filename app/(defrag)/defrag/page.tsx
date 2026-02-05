/**
 * DEFRAG Landing Page
 */

import Link from "next/link";
import { auth } from "@/app/(auth)/auth";
import { redirect } from "next/navigation";

export default async function DefragPage() {
  const session = await auth();
  
  // If user is logged in, redirect to dashboard
  if (session?.user) {
    redirect("/defrag/dashboard");
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-950 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            DEFRAG
          </h1>
          <p className="text-2xl text-zinc-300 mb-8">
            Discover Your Human Design. Transform Your Stress.
          </p>
          <p className="text-lg text-zinc-400 mb-12">
            DEFRAG combines ancient Human Design wisdom with modern physics to help you understand 
            and transform life's challenges into opportunities for growth.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-lg transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/defrag/pricing"
              className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-semibold text-lg transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
        
        {/* Features */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700">
            <h3 className="text-xl font-semibold mb-3">📊 Your Blueprint</h3>
            <p className="text-zinc-400">
              Get your complete Human Design chart calculated from your birth data. 
              Discover your type, authority, and unique configuration.
            </p>
          </div>
          
          <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700">
            <h3 className="text-xl font-semibold mb-3">⚡ Event Physics</h3>
            <p className="text-zinc-400">
              Log life events and see how they create stress vectors in your design. 
              Track patterns and understand your responses.
            </p>
          </div>
          
          <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700">
            <h3 className="text-xl font-semibold mb-3">🔮 Wisdom Scripts</h3>
            <p className="text-zinc-400">
              Receive personalized guidance based on your chart and stress patterns. 
              Transform challenges into growth opportunities.
            </p>
          </div>
        </div>
        
        {/* How It Works */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Create Your Blueprint</h3>
                <p className="text-zinc-400">
                  Enter your birth date, time, and location. We'll calculate your complete Human Design chart.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Log Your Events</h3>
                <p className="text-zinc-400">
                  When stress happens, log it. Describe the event, rate its severity, and categorize it.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Receive Wisdom</h3>
                <p className="text-zinc-400">
                  Get instant, personalized guidance based on your unique design and the specific stress pattern.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Track & Transform</h3>
                <p className="text-zinc-400">
                  See patterns emerge over time. Understand your conditioning and return to your authentic self.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA */}
        <div className="max-w-2xl mx-auto text-center bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-8 rounded-lg border border-blue-500/30">
          <h2 className="text-3xl font-bold mb-4">Ready to Begin?</h2>
          <p className="text-zinc-300 mb-6">
            Start with a free account. Create your first blueprint and log up to 5 events per month.
          </p>
          <Link
            href="/register"
            className="inline-block px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold text-lg transition-all transform hover:scale-105"
          >
            Create Free Account
          </Link>
        </div>
      </div>
    </div>
  );
}
