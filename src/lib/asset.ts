/**
 * Prefix a public asset path with the deployment base path.
 * Needed for GitHub Pages (served from /INTERVO-PAGE-2026/), where next/image
 * with `unoptimized` does not auto-prefix files from /public.
 * Resolves to "" for normal builds, so paths are unchanged there.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string): string {
  return `${BASE_PATH}${path}`;
}
