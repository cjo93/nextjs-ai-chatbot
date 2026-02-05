import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/utils";
import { blueprint } from "@/lib/db/schema";
import { calculateSimpleChart } from "@/lib/defrag/simple-calculator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function StartPage() {
  async function createChart(formData: FormData) {
    "use server";

    const session = await auth();
    if (!session?.user?.id) {
      redirect("/login");
    }

    const name = formData.get("name") as string;
    const birthDate = new Date(formData.get("birthDate") as string);
    const birthLocation = formData.get("birthLocation") as string;
    const birthTime = (formData.get("birthTime") as string) || "unknown";

    // Calculate simple chart data
    const chartData = calculateSimpleChart(birthDate);

    // Create blueprint with simplified data structure
    // MVP: Using sentinel value (-999) for coordinates to clearly indicate they're invalid
    // Production TODO: Replace with actual geocoding API to convert birthLocation to lat/long
    // Using -999 will cause obvious failures if accidentally used in calculations
    const [newBlueprint] = await db
      .insert(blueprint)
      .values({
        userId: session.user.id,
        name,
        birthDate,
        birthLatitude: -999.0,
        birthLongitude: -999.0,
        birthTimezone: "UTC",
        birthLocation: { location: birthLocation, time: birthTime },
        humanDesign: chartData,
        ephemeris: { simplified: true },
      })
      .returning();

    redirect(`/defrag/chart/${newBlueprint.id}`);
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">DEFRAG</h1>
        </div>
      </nav>
      <div className="container mx-auto px-4 py-16 max-w-md">
        <h1 className="text-3xl font-bold mb-8">Create Your Chart</h1>
        <form action={createChart} className="space-y-4">
          <div>
            <Label htmlFor="name" className="block mb-2">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <Label htmlFor="birthDate" className="block mb-2">
              Birth Date
            </Label>
            <Input
              id="birthDate"
              name="birthDate"
              type="date"
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <Label htmlFor="birthTime" className="block mb-2">
              Birth Time (optional)
            </Label>
            <Input
              id="birthTime"
              name="birthTime"
              type="time"
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <Label htmlFor="birthLocation" className="block mb-2">
              Birth Location
            </Label>
            <Input
              id="birthLocation"
              name="birthLocation"
              type="text"
              required
              className="w-full border rounded px-3 py-2"
              placeholder="City, Country"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-2 rounded font-semibold"
          >
            Calculate Chart
          </Button>
        </form>
      </div>
    </div>
  );
}
