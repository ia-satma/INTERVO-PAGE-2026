import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { writeAudit } from "@/lib/auth/audit";
import { apiError, requirePermission } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { contactSubmissions } from "@/lib/db/schema";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await requirePermission(request, "submissions:manage", { csrf: true });
    const { id } = await params;
    const input = z
      .object({ status: z.enum(["new", "in_progress", "closed"]).optional(), notes: z.string().max(5000).optional() })
      .parse(await request.json());
    const db = getDb();
    if (!db) throw new Error("DATABASE_URL no está configurada.");
    const [submission] = await db
      .update(contactSubmissions)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(contactSubmissions.id, id))
      .returning();
    await writeAudit(request, {
      userId: context.user.id,
      action: "submission.updated",
      resource: "contact_submission",
      resourceId: id,
      metadata: input,
    });
    return NextResponse.json({ submission });
  } catch (error) {
    return apiError(error);
  }
}
