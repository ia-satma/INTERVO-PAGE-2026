import type { NextRequest } from "next/server";

function normalizeAddress(value: string | null | undefined) {
  const address = value?.trim();
  if (!address || address.length > 64 || /[\r\n]/.test(address)) return null;
  return address;
}

export function getClientIp(request: NextRequest) {
  // Replit terminates traffic at a reverse proxy. Prefer its single-value
  // address header; otherwise use the last hop appended to X-Forwarded-For so
  // a client-supplied first value cannot create unlimited limiter buckets.
  const realIp = normalizeAddress(request.headers.get("x-real-ip"));
  if (realIp) return realIp;
  const forwarded = request.headers.get("x-forwarded-for");
  const lastForwarded = forwarded?.split(",").at(-1);
  return normalizeAddress(lastForwarded) ?? "unknown";
}

export function getUserAgent(request: NextRequest) {
  return request.headers.get("user-agent")?.slice(0, 512) ?? null;
}

export class PayloadTooLargeError extends Error {}

export async function readLimitedJson(request: NextRequest, maxBytes: number): Promise<unknown> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new PayloadTooLargeError("Solicitud demasiado grande.");
  }

  if (!request.body) return null;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new PayloadTooLargeError("Solicitud demasiado grande.");
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}
