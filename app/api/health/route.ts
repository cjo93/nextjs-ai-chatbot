import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { NextResponse } from "next/server";
import postgres from "postgres";

export async function GET() {
  try {
    if (!process.env.POSTGRES_URL) {
      return NextResponse.json(
        {
          status: "unhealthy",
          error: "Database not configured",
        },
        { status: 503 }
      );
    }

    const client = postgres(process.env.POSTGRES_URL);
    const db = drizzle(client);

    await db.execute(sql`SELECT 1`);
    await client.end();

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "3.1.0",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
