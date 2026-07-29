import { NextResponse, type NextRequest } from "next/server";
import { writeAudit } from "@/lib/auth/audit";
import { apiError, clearSessionCookies, requirePermission, revokeRequestSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const context = await requirePermission(request, "content:read", { csrf: true });
    await revokeRequestSession(request);
    await writeAudit(request, {
      userId: context.user.id,
      action: "auth.logout",
      resource: "auth",
      metadata: { email: context.user.email },
    });
    const response = NextResponse.json({ ok: true });
    clearSessionCookies(response);
    return response;
  } catch (error) {
    return apiError(error);
  }
}
