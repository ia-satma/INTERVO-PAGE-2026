import localFont from "next/font/local";

/**
 * Keep the existing brand typefaces, but let Next.js emit early preload hints
 * and stable fallback metrics. The files remain supplied by the versioned
 * Fontsource packages, so builds never depend on Google Fonts.
 */
export const inter = localFont({
  src: "../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: ["Arial", "sans-serif"],
  weight: "100 900",
  style: "normal",
});

export const bricolage = localFont({
  src: "../../node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2",
  variable: "--font-bricolage",
  display: "swap",
  preload: true,
  fallback: ["Arial", "sans-serif"],
  weight: "200 800",
  style: "normal",
});
