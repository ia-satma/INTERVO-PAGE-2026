import { NextResponse, type NextRequest } from "next/server";
import { clearSessionCookies, revokeRequestSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  await revokeRequestSession(request);
  const response = NextResponse.json({ ok: true });
  clearSessionCookies(response);
  return response;
}
