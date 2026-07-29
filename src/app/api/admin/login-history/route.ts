import { desc, eq, inArray } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { apiError, requirePermission } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { adminUsers, auditLogs } from "@/lib/db/schema";

const loginActions = [
  "auth.login",
  "auth.login_failed",
  "auth.login_blocked",
  "auth.logout",
];

export async function GET(request: NextRequest) {
  try {
    await requirePermission(request, "audit:read");
    const db = getDb();
    if (!db) throw new Error("DATABASE_URL no está configurada.");
    const requestedLimit = Number(new URL(request.url).searchParams.get("limit") || 250);
    const limit = Number.isFinite(requestedLimit) ? Math.min(500, Math.max(25, requestedLimit)) : 250;
    const events = await db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        metadata: auditLogs.metadata,
        ip: auditLogs.ip,
        userAgent: auditLogs.userAgent,
        createdAt: auditLogs.createdAt,
        userName: adminUsers.name,
        userEmail: adminUsers.email,
      })
      .from(auditLogs)
      .leftJoin(adminUsers, eq(auditLogs.userId, adminUsers.id))
      .where(inArray(auditLogs.action, loginActions))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
    return NextResponse.json({ events, limit });
  } catch (error) {
    return apiError(error);
  }
}
