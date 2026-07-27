import { desc } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { apiError, requirePermission } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { adminUsers, auditLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    await requirePermission(request, "audit:read");
    const db = getDb();
    if (!db) throw new Error("DATABASE_URL no está configurada.");
    const events = await db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        resource: auditLogs.resource,
        resourceId: auditLogs.resourceId,
        metadata: auditLogs.metadata,
        createdAt: auditLogs.createdAt,
        userName: adminUsers.name,
        userEmail: adminUsers.email,
      })
      .from(auditLogs)
      .leftJoin(adminUsers, eq(auditLogs.userId, adminUsers.id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(300);
    return NextResponse.json({ events });
  } catch (error) {
    return apiError(error);
  }
}
