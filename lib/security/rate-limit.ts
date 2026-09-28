interface RateEntry {
  count: number;
  resetAt: number;
}

const windows = new Map<string, RateEntry>();

function clientAddress(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
  return address.slice(0, 100);
}

export function checkRateLimit(request: Request, scope: string, maximum: number, windowMs: number) {
  const now = Date.now();
  const key = `${scope}:${clientAddress(request)}`;
  let entry = windows.get(key);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + windowMs };
    windows.set(key, entry);
  }
  entry.count += 1;

  if (windows.size > 4000) {
    for (const [storedKey, stored] of windows) if (stored.resetAt <= now) windows.delete(storedKey);
  }

  return {
    allowed: entry.count <= maximum,
    retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
  };
}
