import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/utils";
import { blueprint } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import type { SimpleChartData } from "@/lib/defrag/simple-calculator";

export default async function ChartPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  // Require authentication before querying the database
  if (!session?.user?.id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in</h1>
          <Link href="/login" className="text-primary hover:underline">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  const [chart] = await db
    .select()
    .from(blueprint)
    .where(eq(blueprint.id, params.id));

  // Verify chart exists and belongs to the authenticated user
  if (!chart || chart.userId !== session.user.id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Chart not found</h1>
          <Link href="/defrag" className="text-primary hover:underline">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  const data = chart.humanDesign as SimpleChartData;

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">DEFRAG</h1>
        </div>
      </nav>
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">{chart.name}'s Chart</h1>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <h2 className="font-semibold text-lg">Type</h2>
              <p className="text-2xl">{data.type}</p>
            </div>
            <div>
              <h2 className="font-semibold text-lg">Strategy</h2>
              <p>{data.strategy}</p>
            </div>
            <div>
              <h2 className="font-semibold text-lg">Authority</h2>
              <p>{data.authority}</p>
            </div>
            <div>
              <h2 className="font-semibold text-lg">Profile</h2>
              <p>{data.profile}</p>
            </div>
            <div className="pt-4">
              <p className="text-muted-foreground">{data.description}</p>
            </div>
          </CardContent>
        </Card>
        <div className="mt-8">
          <Link
            href="/defrag/pricing"
            className="text-primary hover:underline"
          >
            Upgrade for full analysis and event tracking →
          </Link>
        </div>
      </div>
    </div>
  );
}
