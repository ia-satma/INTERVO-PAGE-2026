import bcrypt from "bcryptjs";
import { asc, eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { writeAudit } from "@/lib/auth/audit";
import { apiError, requirePermission } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  try {
    await requirePermission(request, "users:manage");
    const db = getDb();
    if (!db) throw new Error("DATABASE_URL no está configurada.");
    const users = await db
      .select({
        id: adminUsers.id,
        email: adminUsers.email,
        name: adminUsers.name,
        role: adminUsers.role,
        isActive: adminUsers.isActive,
        mfaEnabled: adminUsers.mfaEnabled,
        createdAt: adminUsers.createdAt,
      })
      .from(adminUsers)
      .orderBy(asc(adminUsers.name));
    return NextResponse.json({ users });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await requirePermission(request, "users:manage", { csrf: true });
    const input = z
      .object({
        name: z.string().trim().min(2).max(120),
        email: z.string().email().transform((value) => value.trim().toLowerCase()),
        password: z.string().min(16).max(256),
        role: z.enum(["owner", "admin", "editor"]),
      })
      .parse(await request.json());
    const db = getDb();
    if (!db) throw new Error("DATABASE_URL no está configurada.");
    const [existing] = await db.select({ id: adminUsers.id }).from(adminUsers).where(eq(adminUsers.email, input.email)).limit(1);
    if (existing) return NextResponse.json({ error: "Ese correo ya está registrado." }, { status: 409 });
    const [user] = await db
      .insert(adminUsers)
      .values({ ...input, passwordHash: await bcrypt.hash(input.password, 12) })
      .returning({ id: adminUsers.id, email: adminUsers.email, name: adminUsers.name, role: adminUsers.role });
    await writeAudit(request, { userId: context.user.id, action: "user.created", resource: "admin_user", resourceId: user.id });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
