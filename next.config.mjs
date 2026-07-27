/** @type {import('next').NextConfig} */

// When building for GitHub Pages we produce a static export served from the
// repo subpath (https://<user>.github.io/INTERVO-PAGE-2026/). Toggled by EXPORT=true.
const isExport = process.env.EXPORT === "true";
const repoBase = isExport ? "/INTERVO-PAGE-2026" : "";

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
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
                { key: "X-Content-Type-Options", value: "nosniff" },
                { key: "X-Frame-Options", value: "SAMEORIGIN" },
                { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
              ],
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

export default nextConfig;
