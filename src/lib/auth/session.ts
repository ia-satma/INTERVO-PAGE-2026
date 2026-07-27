import "server-only";

import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { adminSessions, adminUsers } from "@/lib/db/schema";
import type { AdminSessionUser, Permission } from "@/lib/cms/types";
import { permissionsForRole } from "./rbac";
import { randomToken, sha256 } from "./crypto";

export const SESSION_COOKIE = "intervo_admin_session";
export const CSRF_COOKIE = "intervo_csrf";
const ABSOLUTE_SESSION_MS = 8 * 60 * 60 * 1000;
const IDLE_SESSION_MS = 30 * 60 * 1000;

export class AuthError extends Error {
  constructor(
    message: string,
    public status = 401,
  ) {
    super(message);
  }
}

export async function createSession(
  user: typeof adminUsers.$inferSelect,
  request: NextRequest,
  mfaVerified: boolean,
) {
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL no está configurada.");
  const token = randomToken();
  const csrf = randomToken(24);
  const expiresAt = new Date(Date.now() + ABSOLUTE_SESSION_MS);
  const forwarded = request.headers.get("x-forwarded-for");
  await db.insert(adminSessions).values({
    userId: user.id,
    tokenHash: sha256(token),
    csrfHash: sha256(csrf),
    mfaVerified,
    ip: forwarded?.split(",")[0]?.trim() || null,
    userAgent: request.headers.get("user-agent"),
    expiresAt,
  });
  return { token, csrf, expiresAt };
}

export function setSessionCookies(
  response: NextResponse,
  session: { token: string; csrf: string; expiresAt: Date },
) {
  const secure = process.env.NODE_ENV === "production";
  response.cookies.set(SESSION_COOKIE, session.token, {
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/",
    expires: session.expiresAt,
  });
  response.cookies.set(CSRF_COOKIE, session.csrf, {
    httpOnly: false,
    secure,
    sameSite: "strict",
    path: "/",
    expires: session.expiresAt,
  });
}

export function clearSessionCookies(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  response.cookies.set(CSRF_COOKIE, "", { httpOnly: false, path: "/", maxAge: 0 });
}

async function resolveSession(token: string | undefined | null) {
  const db = getDb();
  if (!db || !token) return null;
  const now = new Date();
  const [row] = await db
    .select({ session: adminSessions, user: adminUsers })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminSessions.userId, adminUsers.id))
    .where(
      and(
        eq(adminSessions.tokenHash, sha256(token)),
        gt(adminSessions.expiresAt, now),
        eq(adminUsers.isActive, true),
      ),
    )
    .limit(1);
  if (!row) return null;
  if (Date.now() - row.session.lastSeenAt.getTime() > IDLE_SESSION_MS) {
    await db.delete(adminSessions).where(eq(adminSessions.id, row.session.id));
    return null;
  }
  await db.update(adminSessions).set({ lastSeenAt: now }).where(eq(adminSessions.id, row.session.id));
  const elevated = row.user.role === "owner" || row.user.role === "admin";
  const user: AdminSessionUser = {
    id: row.user.id,
    email: row.user.email,
    name: row.user.name,
    role: row.user.role,
    permissions: permissionsForRole(row.user.role),
    mfaEnabled: row.user.mfaEnabled,
    mfaVerified: elevated ? row.user.mfaEnabled && row.session.mfaVerified : true,
  };
  return { ...row, user };
}

export async function getRequestSession(request: NextRequest) {
  return resolveSession(request.cookies.get(SESSION_COOKIE)?.value);
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  return resolveSession(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function requirePermission(
  request: NextRequest,
  permission: Permission,
  options: { csrf?: boolean; mfa?: boolean } = {},
) {
  const context = await getRequestSession(request);
  if (!context) throw new AuthError("Sesión no válida.", 401);
  if (!context.user.permissions.includes(permission)) throw new AuthError("No tienes permiso para esta acción.", 403);
  if (options.mfa !== false && ["owner", "admin"].includes(context.user.role) && !context.user.mfaVerified) {
    throw new AuthError("Debes completar la verificación de dos pasos.", 403);
  }
  if (options.csrf) {
    const csrf = request.headers.get("x-csrf-token");
    if (!csrf || sha256(csrf) !== context.session.csrfHash) throw new AuthError("Token CSRF inválido.", 403);
  }
  return context;
}

export async function revokeRequestSession(request: NextRequest) {
  const db = getDb();
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (db && token) await db.delete(adminSessions).where(eq(adminSessions.tokenHash, sha256(token)));
}

export function apiError(error: unknown) {
  if (error instanceof AuthError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error(error);
  return Response.json({ error: error instanceof Error ? error.message : "Error interno." }, { status: 500 });
}
