export function deepMerge<T>(base: T, override: unknown): T {
  if (!override || typeof override !== "object" || Array.isArray(override)) {
    return (override === undefined ? base : override) as T;
  }
  if (!base || typeof base !== "object" || Array.isArray(base)) return override as T;

  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
    const previous = result[key];
    result[key] =
      value && typeof value === "object" && !Array.isArray(value) && previous && typeof previous === "object" && !Array.isArray(previous)
        ? deepMerge(previous, value)
        : value;
  }
  return result as T;
}
