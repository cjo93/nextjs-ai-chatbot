/**
 * DEFRAG Dashboard - Main user dashboard
 */

import { auth } from "@/app/(auth)/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getBlueprints } from "@/lib/defrag/actions/blueprints";
import { getUsageStats } from "@/lib/defrag/actions/events";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }
  
  const blueprintsResult = await getBlueprints();
  const usageResult = await getUsageStats();
  
  const blueprints = blueprintsResult.success ? blueprintsResult.blueprints : [];
  const usage = usageResult.success ? usageResult.usage : null;
  const limits = usageResult.success ? usageResult.limits : null;
  const tier = usageResult.success ? usageResult.tier : "free";
  
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-zinc-400">Welcome back, {session.user.email}</p>
        </div>
        
        {/* Subscription Tier */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-1">
                Current Plan: <span className="text-blue-400 capitalize">{tier}</span>
              </h2>
              {limits && usage && (
                <p className="text-zinc-400">
                  {usage.eventsLogged || 0} / {limits.eventsPerMonth} events this month
                </p>
              )}
            </div>
            {tier === "free" && (
              <Link
                href="/defrag/pricing"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
              >
                Upgrade
              </Link>
            )}
          </div>
        </div>
        
        {/* Blueprints Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Your Blueprints</h2>
            {(!limits || blueprints.length < limits.blueprints) && (
              <Link
                href="/defrag/onboarding"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
              >
                + Create Blueprint
              </Link>
            )}
          </div>
          
          {blueprints.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
              <p className="text-zinc-400 mb-4">You haven't created a blueprint yet.</p>
              <Link
                href="/defrag/onboarding"
                className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
              >
                Create Your First Blueprint
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {blueprints.map((blueprint: any) => (
                <Link
                  key={blueprint.id}
                  href={`/defrag/blueprint/${blueprint.id}`}
                  className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg p-6 transition-colors"
                >
                  <h3 className="text-xl font-semibold mb-2">{blueprint.name}</h3>
                  <p className="text-zinc-400 text-sm mb-1">
                    {new Date(blueprint.birthDate).toLocaleDateString()}
                  </p>
                  <p className="text-zinc-400 text-sm">{blueprint.birthLocation}</p>
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <p className="text-sm text-zinc-500">
                      Type: {(blueprint.chartData as any)?.type || "Calculating..."}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        
        {/* Quick Actions */}
        {blueprints.length > 0 && (
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/defrag/events/new"
              className="bg-zinc-900 border border-zinc-800 hover:border-blue-600 rounded-lg p-6 transition-colors"
            >
              <div className="text-3xl mb-2">📝</div>
              <h3 className="font-semibold mb-1">Log Event</h3>
              <p className="text-zinc-400 text-sm">Record a stress event</p>
            </Link>
            
            <Link
              href="/defrag/events"
              className="bg-zinc-900 border border-zinc-800 hover:border-purple-600 rounded-lg p-6 transition-colors"
            >
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-semibold mb-1">View Events</h3>
              <p className="text-zinc-400 text-sm">See your event history</p>
            </Link>
            
            <Link
              href="/defrag/pricing"
              className="bg-zinc-900 border border-zinc-800 hover:border-green-600 rounded-lg p-6 transition-colors"
            >
              <div className="text-3xl mb-2">⭐</div>
              <h3 className="font-semibold mb-1">Upgrade</h3>
              <p className="text-zinc-400 text-sm">Unlock more features</p>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
