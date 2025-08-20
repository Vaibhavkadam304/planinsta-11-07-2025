// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ratelimit } from "@/lib/rate-limit";

export const config = {
  matcher: [
    "/api/generate-plan",
    "/api/generate-plan/:path*",
    "/api/bouncer-probe", // keep this probe for testing
  ],
};

function computeRetryAfter(reset: unknown) {
  const nowMs = Date.now();
  const n = Number(reset);
  // Default 19s if we can't parse
  let retryAfter = 19;
  let resetAt: string | undefined;

  if (Number.isFinite(n)) {
    if (n < 1e6) {
      // Looks like "duration in ms until reset"
      retryAfter = Math.ceil(n / 1000);
    } else if (n > 1e9 && n < 1e12) {
      // Epoch seconds
      retryAfter = Math.ceil(n - nowMs / 1000);
      resetAt = new Date(n * 1000).toISOString();
    } else if (n >= 1e12) {
      // Epoch milliseconds
      retryAfter = Math.ceil((n - nowMs) / 1000);
      resetAt = new Date(n).toISOString();
    }
  }

  // Clamp to something user-friendly
  retryAfter = Math.max(0, Math.min(60, retryAfter));
  return { retryAfter, resetAt };
}

export default async function middleware(req: NextRequest) {
  const h = req.headers;
  const userId = h.get("x-user-id")?.trim();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip")?.trim() ||
    h.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("cf-connecting-ip")?.trim() ||
    req.ip ||
    "127.0.0.1";

  const key = userId ? `user:${userId}` : `ip:${ip}`;

  try {
    const { success, limit, remaining, reset } = await ratelimit.limit(key);
    const { retryAfter, resetAt } = computeRetryAfter(reset);

    if (!success) {
      return NextResponse.json(
        { error: "You’re generating too quickly—try again in a bit." },
        {
          status: 429,
          headers: {
            "X-Bouncer": "limited",
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": String(remaining),
            "X-RateLimit-Reset": String(reset),
            ...(resetAt ? { "X-RateLimit-Reset-At": resetAt } : {}),
            "Retry-After": String(retryAfter),
          },
        }
      );
    }

    return NextResponse.next({
      headers: {
        "X-Bouncer": "hit",
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": String(remaining),
        "X-RateLimit-Reset": String(reset),
        ...(resetAt ? { "X-RateLimit-Reset-At": resetAt } : {}),
      },
    });
  } catch {
    // Degraded mode: don’t block; just tag the request
    return NextResponse.next({ headers: { "X-Bouncer": "degraded" } });
  }
}
