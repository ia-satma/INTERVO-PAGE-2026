import "server-only";

import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let database: PostgresJsDatabase<typeof schema> | null | undefined;

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL) && process.env.INTERVO_SKIP_DB_DURING_BUILD !== "true";
}

export function getDb(): PostgresJsDatabase<typeof schema> | null {
  if (process.env.INTERVO_SKIP_DB_DURING_BUILD === "true") return null;
  if (database !== undefined) return database;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    database = null;
    return database;
  }

  const client = postgres(connectionString, {
    max: process.env.NODE_ENV === "production" ? 10 : 3,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });
  database = drizzle(client, { schema });
  return database;
}
