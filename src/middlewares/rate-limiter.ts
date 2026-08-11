import type { Elysia } from "elysia";
import { AppError } from "../middlewares/error-handler";

/**
 * Simple in-memory rate limiter.
 *
 * Limits requests per IP to `max` requests within `windowMs` milliseconds.
 * Default: 5 requests per 60 seconds — suitable for auth endpoints.
 */
interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

// Cleanup expired entries every 60 seconds.
const CLEANUP_INTERVAL = 60_000;
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of store) {
      if (bucket.resetAt <= now) store.delete(key);
    }
  }, CLEANUP_INTERVAL);
  // Allow the process to exit even if the timer is still running.
  if (cleanupTimer && "unref" in cleanupTimer) {
    (cleanupTimer as ReturnType<typeof setInterval> & { unref(): void }).unref();
  }
}

export function rateLimiter(max = 5, windowMs = 60_000) {
  ensureCleanup();

  return (app: Elysia) =>
    app.onRequest(({ request, set }) => {
      const ip =
        (request.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        "unknown";

      const now = Date.now();
      const bucket = store.get(ip);

      if (!bucket || bucket.resetAt <= now) {
        store.set(ip, { count: 1, resetAt: now + windowMs });
        return;
      }

      bucket.count += 1;

      if (bucket.count > max) {
        set.status = 429;
        return {
          success: false as const,
          code: "RATE_LIMITED",
          message: `Too many requests. Try again in ${Math.ceil((bucket.resetAt - now) / 1000)}s.`,
        };
      }
    });
}
