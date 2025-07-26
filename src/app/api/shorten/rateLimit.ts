import { NextRequest } from "next/server";
import { redis } from "../../../utils/redis";

const WINDOW_SECONDS = 60; // 1 minute
const MAX_REQUESTS_ANONYMOUS = 5; // 5 per minute for anonymous users
const MAX_REQUESTS_AUTHENTICATED = 15; // 15 per minute for authenticated users

export async function rateLimit(
  req: NextRequest,
  userId?: string
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  // Get IP address (works for Vercel/Next.js API routes)
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  // Use different limits based on authentication status
  const maxRequests = userId
    ? MAX_REQUESTS_AUTHENTICATED
    : MAX_REQUESTS_ANONYMOUS;
  const key = `ratelimit:${ip}:${userId || "anonymous"}`;
  const now = Math.floor(Date.now() / 1000);

  // Use Redis INCR and EXPIRE for atomic rate limiting
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, WINDOW_SECONDS);
  }
  const ttl = await redis.ttl(key);
  return {
    allowed: count <= maxRequests,
    remaining: Math.max(0, maxRequests - count),
    reset: now + (ttl > 0 ? ttl : WINDOW_SECONDS),
  };
}
