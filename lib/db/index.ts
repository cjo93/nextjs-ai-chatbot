/**
 * Database client export
 * Centralized database instance for DEFRAG operations
 */
import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

if (!process.env.POSTGRES_URL) {
  throw new Error("Missing POSTGRES_URL environment variable");
}

const client = postgres(process.env.POSTGRES_URL);
export const db = drizzle(client);
