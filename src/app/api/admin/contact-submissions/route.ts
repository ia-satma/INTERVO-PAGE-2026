import { desc } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { apiError, requirePermission } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { contactSubmissions } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  try {
    await requirePermission(request, "submissions:manage");
    const db = getDb();
    if (!db) throw new Error("DATABASE_URL no está configurada.");
    const submissions = await db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt)).limit(250);
    return NextResponse.json({ submissions });
  } catch (error) {
    return apiError(error);
  }
}
