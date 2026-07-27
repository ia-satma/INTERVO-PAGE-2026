type Counter = { count: number; resetAt: number };

const counters = new Map<string, Counter>();

export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const current = counters.get(key);
  if (!current || current.resetAt <= now) {
    counters.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, retryAfter: 0 };
  }
  current.count += 1;
  counters.set(key, current);
  return {
    allowed: current.count <= max,
    remaining: Math.max(0, max - current.count),
    retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}

export function clearRateLimit(key: string) {
  counters.delete(key);
}
