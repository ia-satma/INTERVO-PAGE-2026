import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { verifySync } from "otplib";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { clearRateLimit, rateLimit } from "@/lib/auth/rate-limit";
import { createSession, setSessionCookies } from "@/lib/auth/session";
import { decryptSecret, hasSecureSessionSecret } from "@/lib/auth/crypto";
import { writeAudit } from "@/lib/auth/audit";
import { getClientIp, PayloadTooLargeError, readLimitedJson } from "@/lib/auth/request";
import { getDb } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";

const inputSchema = z.object({
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1).max(256),
  code: z.string().regex(/^\d{6}$/).optional(),
});

// Keeps invalid-account and invalid-password checks on the same expensive
// bcrypt path, reducing account-enumeration timing differences.
const DUMMY_PASSWORD_HASH = "$2b$12$FpExF/VvAB09FST7yUvJe.BxhoApt52Z8p420/X5FoyBm5Bc5HKV2";

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production" && !hasSecureSessionSecret()) {
    return NextResponse.json({ error: "El panel no tiene completa su configuración segura." }, { status: 503 });
  }
  const ip = getClientIp(request);
  const limit = await rateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
  if (!limit.allowed) {
    await writeAudit(request, {
      action: "auth.login_blocked",
      resource: "auth",
      metadata: { reason: "rate_limit" },
    });
    return NextResponse.json(
      { error: "Demasiados intentos. Intenta nuevamente más tarde." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }
  let body: unknown;
  try {
    body = await readLimitedJson(request, 4 * 1024);
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      return NextResponse.json({ error: "La solicitud es demasiado grande." }, { status: 413 });
    }
    throw error;
  }
  const parsed = inputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos de acceso inválidos." }, { status: 400 });
  const accountLimit = await rateLimit(`login-account:${parsed.data.email}`, 12, 60 * 60 * 1000);
  if (!accountLimit.allowed) {
    await writeAudit(request, {
      action: "auth.login_blocked",
      resource: "auth",
      metadata: { email: parsed.data.email, reason: "account_rate_limit" },
    });
    return NextResponse.json(
      { error: "Demasiados intentos para esta cuenta. Intenta nuevamente más tarde." },
      { status: 429, headers: { "Retry-After": String(accountLimit.retryAfter) } },
    );
  }

  const db = getDb();
  if (!db) return NextResponse.json({ error: "El panel aún no tiene base de datos configurada." }, { status: 503 });

  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, parsed.data.email)).limit(1);
  const passwordMatches = await bcrypt.compare(parsed.data.password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);
  if (!user || !user.isActive || !passwordMatches) {
    await writeAudit(request, {
      action: "auth.login_failed",
      resource: "auth",
      metadata: { email: parsed.data.email, reason: "invalid_credentials" },
    });
    return NextResponse.json({ error: "Correo o contraseña incorrectos." }, { status: 401 });
  }

  const elevated = user.role === "owner" || user.role === "admin";
  let mfaVerified = !elevated;
  if (elevated && user.mfaEnabled && user.mfaSecret) {
    if (!parsed.data.code) {
      await writeAudit(request, {
        userId: user.id,
        action: "auth.mfa_challenge",
        resource: "auth",
        metadata: { email: user.email },
      });
      return NextResponse.json({ requiresMfa: true }, { status: 428 });
    }
    const result = verifySync({ secret: decryptSecret(user.mfaSecret), token: parsed.data.code });
    if (!result.valid) {
      await writeAudit(request, {
        userId: user.id,
        action: "auth.login_failed",
        resource: "auth",
        metadata: { email: user.email, reason: "invalid_mfa" },
      });
      return NextResponse.json({ error: "El código de verificación no es válido." }, { status: 401 });
    }
    mfaVerified = true;
  }

  const session = await createSession(user, request, mfaVerified);
  const response = NextResponse.json({
    ok: true,
    requiresEnrollment: elevated && !user.mfaEnabled,
  });
  setSessionCookies(response, session);
  await clearRateLimit(`login:${ip}`);
  await clearRateLimit(`login-account:${user.email}`);
  await writeAudit(request, {
    userId: user.id,
    action: "auth.login",
    resource: "auth",
    metadata: { email: user.email, mfaVerified },
  });
  return response;
}
