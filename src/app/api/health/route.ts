import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getDb, hasDatabase } from "@/lib/db";
import { hasSecureSessionSecret } from "@/lib/auth/crypto";

export async function GET() {
  const db = getDb();
  let database = "not_configured";
  if (db) {
    try {
      await db.execute(sql`select 1`);
      database = "ok";
    } catch {
      database = "error";
    }
  }
  const productionReady =
    process.env.NODE_ENV !== "production" ||
    (database === "ok" && hasSecureSessionSecret());
  return NextResponse.json({
    ok: database !== "error" && productionReady,
    service: "intervo-web",
    database,
    storage: process.env.REPLIT_OBJECT_STORAGE_BUCKET_ID ? "configured" : "auto",
    timestamp: new Date().toISOString(),
    mode: hasDatabase() ? "full-stack" : "static-fallback",
  }, { status: database !== "error" && productionReady ? 200 : 503 });
}
