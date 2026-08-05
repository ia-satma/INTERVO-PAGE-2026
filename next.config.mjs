/** @type {import('next').NextConfig} */
import { PHASE_PRODUCTION_BUILD } from "next/constants.js";

// When building for GitHub Pages we produce a static export served from the
// repo subpath (https://<user>.github.io/INTERVO-PAGE-2026/). Toggled by EXPORT=true.
const isExport = process.env.EXPORT === "true";
const repoBase = isExport ? "/INTERVO-PAGE-2026" : "";
const isProduction = process.env.NODE_ENV === "production";
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  ...(isProduction ? ["upgrade-insecure-requests"] : []),
].join("; ");

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  allowedDevOrigins: ["127.0.0.1", "localhost", "*.replit.dev"],
  experimental: {
    globalNotFound: true,
  },
  // Exposed to server + client so public assets can be prefixed with the base
  // path (next/image with `unoptimized` does NOT auto-prefix public files).
  env: { NEXT_PUBLIC_BASE_PATH: repoBase },
  ...(!isExport
    ? {
        async headers() {
          return [
            {
              source: "/:path*",
              headers: [
                { key: "Content-Security-Policy", value: contentSecurityPolicy },
                { key: "X-Content-Type-Options", value: "nosniff" },
                { key: "X-Frame-Options", value: "SAMEORIGIN" },
                { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
                { key: "X-DNS-Prefetch-Control", value: "off" },
                ...(isProduction
                  ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }]
                  : []),
              ],
            },
            {
              source: "/admin/:path*",
              headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }],
            },
            {
              source: "/api/admin/:path*",
              headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }],
            },
            {
              source: "/api/auth/:path*",
              headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }],
            },
          ];
        },
      }
    : {}),
  ...(isExport
    ? {
        output: "export",
        basePath: repoBase,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {
        images: { formats: ["image/avif", "image/webp"] },
      }),
};

export default function configureNext(phase) {
  if (phase === PHASE_PRODUCTION_BUILD) {
    process.env.INTERVO_SKIP_DB_DURING_BUILD = "true";
  }
  return nextConfig;
}
