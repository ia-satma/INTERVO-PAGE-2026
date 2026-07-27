import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { verifySync } from "otplib";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { clearRateLimit, rateLimit } from "@/lib/auth/rate-limit";
import { createSession, setSessionCookies } from "@/lib/auth/session";
import { decryptSecret } from "@/lib/auth/crypto";
import { writeAudit } from "@/lib/auth/audit";
import { getDb } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";

const inputSchema = z.object({
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1).max(256),
  code: z.string().regex(/^\d{6}$/).optional(),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const limit = rateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos. Intenta nuevamente más tarde." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Datos de acceso inválidos." }, { status: 400 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "El panel aún no tiene base de datos configurada." }, { status: 503 });

  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, parsed.data.email)).limit(1);
  const passwordOk = user?.isActive && (await bcrypt.compare(parsed.data.password, user.passwordHash));
  if (!passwordOk) {
    await writeAudit(request, {
      action: "auth.login_failed",
      resource: "auth",
      metadata: { email: parsed.data.email },
    });
    return NextResponse.json({ error: "Correo o contraseña incorrectos." }, { status: 401 });
  }

  const elevated = user.role === "owner" || user.role === "admin";
  let mfaVerified = !elevated;
  if (elevated && user.mfaEnabled && user.mfaSecret) {
    if (!parsed.data.code) return NextResponse.json({ requiresMfa: true }, { status: 428 });
    const result = verifySync({ secret: decryptSecret(user.mfaSecret), token: parsed.data.code });
    if (!result.valid) return NextResponse.json({ error: "El código de verificación no es válido." }, { status: 401 });
    mfaVerified = true;
  }

  const session = await createSession(user, request, mfaVerified);
  const response = NextResponse.json({
    ok: true,
    requiresEnrollment: elevated && !user.mfaEnabled,
  });
  setSessionCookies(response, session);
  clearRateLimit(`login:${ip}`);
  await writeAudit(request, { userId: user.id, action: "auth.login", resource: "auth" });
  return response;
}
