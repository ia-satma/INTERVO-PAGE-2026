import { eq } from "drizzle-orm";
import { generateSecret, generateURI, verifySync } from "otplib";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { writeAudit } from "@/lib/auth/audit";
import { clearRateLimit, rateLimit } from "@/lib/auth/rate-limit";
import { encryptSecret, decryptSecret } from "@/lib/auth/crypto";
import { apiError, requirePermission } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { adminSessions, adminUsers } from "@/lib/db/schema";

export async function PUT(request: NextRequest) {
  try {
    const context = await requirePermission(request, "content:read", { csrf: true, mfa: false });
    const limit = await rateLimit(`mfa-setup:${context.user.id}`, 3, 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Demasiados intentos de configuración. Intenta más tarde." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
      );
    }
    const db = getDb();
    if (!db) throw new Error("DATABASE_URL no está configurada.");
    const secret = generateSecret();
    await db.update(adminUsers).set({ mfaSecret: encryptSecret(secret), mfaEnabled: false }).where(eq(adminUsers.id, context.user.id));
    await writeAudit(request, {
      userId: context.user.id,
      action: "auth.mfa_setup_started",
      resource: "auth",
    });
    return NextResponse.json({
      secret,
      uri: generateURI({ issuer: "Intervo Admin", label: context.user.email, secret }),
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await requirePermission(request, "content:read", { csrf: true, mfa: false });
    const input = z.object({ code: z.string().regex(/^\d{6}$/) }).parse(await request.json());
    const limit = await rateLimit(`mfa-verify:${context.user.id}`, 10, 10 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Demasiados códigos incorrectos. Intenta más tarde." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
      );
    }
    const db = getDb();
    if (!db) throw new Error("DATABASE_URL no está configurada.");
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, context.user.id)).limit(1);
    if (!user?.mfaSecret) return NextResponse.json({ error: "Primero genera una clave." }, { status: 400 });
    const valid = verifySync({ secret: decryptSecret(user.mfaSecret), token: input.code }).valid;
    if (!valid) return NextResponse.json({ error: "Código inválido." }, { status: 400 });
    await db.transaction(async (tx) => {
      await tx.update(adminUsers).set({ mfaEnabled: true, updatedAt: new Date() }).where(eq(adminUsers.id, user.id));
      await tx.update(adminSessions).set({ mfaVerified: true }).where(eq(adminSessions.id, context.session.id));
    });
    await clearRateLimit(`mfa-verify:${context.user.id}`);
    await writeAudit(request, {
      userId: context.user.id,
      action: "auth.mfa_enabled",
      resource: "auth",
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
