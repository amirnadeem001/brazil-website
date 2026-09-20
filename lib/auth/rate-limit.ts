/**
 * Best-effort in-memory login throttle.
 *
 * This does not use Redis, a database, or another external store.
 * On Vercel/Netlify serverless it is NOT a robust brute-force control:
 * each isolate has its own memory, and cold starts reset the counters.
 * It still helps on a long-lived Node process (local `next start` / a
 * single server instance).
 */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

type Bucket = {
  count: number;
  windowStart: number;
};

const buckets = new Map<string, Bucket>();

function getBucket(key: string, now: number): Bucket {
  const existing = buckets.get(key);
  if (!existing || now - existing.windowStart >= WINDOW_MS) {
    const fresh = { count: 0, windowStart: now };
    buckets.set(key, fresh);
    return fresh;
  }
  return existing;
}

export function isLoginRateLimited(key: string): boolean {
  const bucket = getBucket(key, Date.now());
  return bucket.count >= MAX_ATTEMPTS;
}

export function recordLoginFailure(key: string): void {
  const now = Date.now();
  const bucket = getBucket(key, now);
  bucket.count += 1;
}

export function resetLoginFailures(key: string): void {
  buckets.delete(key);
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return "unknown";
}
