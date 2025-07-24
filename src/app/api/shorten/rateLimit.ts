import { NextRequest } from "next/server";
import { redis } from "../../../utils/redis";

const WINDOW_SECONDS = 60; // 1 minute
const MAX_REQUESTS = 3;

export async function rateLimit(
  req: NextRequest
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  // Get IP address (works for Vercel/Next.js API routes)
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const key = `ratelimit:${ip}`;
  const now = Math.floor(Date.now() / 1000);

  // Use Redis INCR and EXPIRE for atomic rate limiting
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, WINDOW_SECONDS);
  }
  const ttl = await redis.ttl(key);
  return {
    allowed: count <= MAX_REQUESTS,
    remaining: Math.max(0, MAX_REQUESTS - count),
    reset: now + (ttl > 0 ? ttl : WINDOW_SECONDS),
  };
}
