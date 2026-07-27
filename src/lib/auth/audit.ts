import "server-only";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";

export async function writeAudit(
  request: NextRequest,
  event: {
    userId?: string | null;
    action: string;
    resource: string;
    resourceId?: string | null;
    metadata?: Record<string, unknown>;
  },
) {
  const db = getDb();
  if (!db) return;
  try {
    await db.insert(auditLogs).values({
      userId: event.userId,
      action: event.action,
      resource: event.resource,
      resourceId: event.resourceId,
      metadata: event.metadata ?? {},
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      userAgent: request.headers.get("user-agent"),
    });
  } catch (error) {
    console.error("No se pudo escribir audit log", error);
  }
}
