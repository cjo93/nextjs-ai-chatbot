import "server-only";

import { generateId } from "ai";
import { genSaltSync, hashSync } from "bcrypt-ts";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
export const db = drizzle(client);

export function generateHashedPassword(password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  return hash;
}

export function generateDummyPassword() {
  const password = generateId();
  const hashedPassword = generateHashedPassword(password);

  return hashedPassword;
}

// Lazy evaluation for dummy password
let _dummyPassword: string | null = null;
export function getDummyPassword(): string {
  if (!_dummyPassword) {
    _dummyPassword = generateDummyPassword();
  }
  return _dummyPassword;
}
