import "server-only";

import { eq, lt, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { rateLimitCounters } from "@/lib/db/schema";
import { sha256 } from "./crypto";

type Counter = { count: number; resetAt: number };
type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
};

// Development/static fallback only. Production uses PostgreSQL so limits are
// shared by every Replit Autoscale instance.
const fallbackCounters = new Map<string, Counter>();

function memoryRateLimit(key: string, max: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const current = fallbackCounters.get(key);
  if (!current || current.resetAt <= now) {
    fallbackCounters.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, retryAfter: 0 };
  }
  current.count += 1;
  fallbackCounters.set(key, current);
  return {
    allowed: current.count <= max,
    remaining: Math.max(0, max - current.count),
    retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}

export async function rateLimit(key: string, max: number, windowMs: number): Promise<RateLimitResult> {
  const db = getDb();
  const keyHash = sha256(key);
  if (!db) return memoryRateLimit(keyHash, max, windowMs);

  // Keeps the table bounded even under high-cardinality public traffic.
  await db.delete(rateLimitCounters).where(lt(rateLimitCounters.resetAt, new Date()));

  return db.transaction(async (tx) => {
    // Serializes concurrent attempts for this particular key across instances.
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${keyHash}, 0))`);
    const now = new Date();
    const [current] = await tx
      .select()
      .from(rateLimitCounters)
      .where(eq(rateLimitCounters.keyHash, keyHash))
      .limit(1);

    if (!current || current.resetAt.getTime() <= now.getTime()) {
      const resetAt = new Date(now.getTime() + windowMs);
      await tx
        .insert(rateLimitCounters)
        .values({ keyHash, count: 1, resetAt, updatedAt: now })
        .onConflictDoUpdate({
          target: rateLimitCounters.keyHash,
          set: { count: 1, resetAt, updatedAt: now },
        });
      return { allowed: true, remaining: Math.max(0, max - 1), retryAfter: 0 };
    }

    const count = current.count + 1;
    await tx
      .update(rateLimitCounters)
      .set({ count, updatedAt: now })
      .where(eq(rateLimitCounters.keyHash, keyHash));
    return {
      allowed: count <= max,
      remaining: Math.max(0, max - count),
      retryAfter: Math.max(1, Math.ceil((current.resetAt.getTime() - now.getTime()) / 1000)),
    };
  });
}

export async function clearRateLimit(key: string) {
  const db = getDb();
  const keyHash = sha256(key);
  fallbackCounters.delete(keyHash);
  if (db) await db.delete(rateLimitCounters).where(eq(rateLimitCounters.keyHash, keyHash));
}
