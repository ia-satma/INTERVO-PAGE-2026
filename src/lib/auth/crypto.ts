import "server-only";

import { createHash, randomBytes } from "node:crypto";

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function hasSecureSessionSecret() {
  return Boolean(process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32);
}
