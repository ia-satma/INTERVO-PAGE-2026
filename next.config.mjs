/** @type {import('next').NextConfig} */

// When building for GitHub Pages we produce a static export served from the
// repo subpath (https://<user>.github.io/INTERVO-PAGE-2026/). Toggled by EXPORT=true.
const isExport = process.env.EXPORT === "true";
const repoBase = isExport ? "/INTERVO-PAGE-2026" : "";

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Exposed to server + client so public assets can be prefixed with the base
  // path (next/image with `unoptimized` does NOT auto-prefix public files).
  env: { NEXT_PUBLIC_BASE_PATH: repoBase },
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
