import { createClient } from "redis";

const redis = process.env.REDIS_URL
  ? createClient({
      url: process.env.REDIS_URL,
    })
  : null;

if (redis) {
  redis.on("error", (err) => console.error("Redis Client Error", err));
  redis.connect().catch(console.error);
}

// Rate limit configuration constants
const RATE_LIMITS = {
  API: {
    LIMIT: 10,
    WINDOW_SECONDS: 10,
  },
  CHECKOUT: {
    LIMIT: 3,
    WINDOW_SECONDS: 3600, // 1 hour
  },
  EVENTS: {
    LIMIT: 20,
    WINDOW_SECONDS: 60, // 1 minute
  },
};

export async function checkRateLimit(
  key: string,
  limit: number,
  window: number
): Promise<{ success: boolean; remaining: number }> {
  if (!redis) {
    return { success: true, remaining: limit };
  }

  try {
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, window);
    }

    const remaining = Math.max(0, limit - current);

    return {
      success: current <= limit,
      remaining,
    };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    return { success: true, remaining: limit };
  }
}

export const ratelimit = {
  api: (identifier: string) => {
    return checkRateLimit(
      `ratelimit:api:${identifier}`,
      RATE_LIMITS.API.LIMIT,
      RATE_LIMITS.API.WINDOW_SECONDS
    );
  },
  checkout: (identifier: string) => {
    return checkRateLimit(
      `ratelimit:checkout:${identifier}`,
      RATE_LIMITS.CHECKOUT.LIMIT,
      RATE_LIMITS.CHECKOUT.WINDOW_SECONDS
    );
  },
  events: (identifier: string) => {
    return checkRateLimit(
      `ratelimit:events:${identifier}`,
      RATE_LIMITS.EVENTS.LIMIT,
      RATE_LIMITS.EVENTS.WINDOW_SECONDS
    );
  },
};
