/**
 * Database Client Export
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
export const db = drizzle(client);

// Re-export everything from queries and schema for convenience
export * from "./queries";
export * from "./schema";
