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

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 3600
): Promise<T> {
  if (!redis) {
    return fetcher();
  }

  try {
    const cached = await redis.get(key);

    if (cached) {
      return JSON.parse(cached) as T;
    }

    const data = await fetcher();
    await redis.setEx(key, ttl, JSON.stringify(data));

    return data;
  } catch (error) {
    console.error("Cache operation failed:", error);
    return fetcher();
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  if (!redis) {
    return;
  }

  try {
    // Note: redis.keys() blocks Redis, but is simpler for small datasets
    // For production with large key spaces, consider using SCAN with pagination
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  } catch (error) {
    console.error("Cache invalidation failed:", error);
  }
}

export async function setCached<T>(
  key: string,
  value: T,
  ttl = 3600
): Promise<void> {
  if (!redis) {
    return;
  }

  try {
    await redis.setEx(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.error("Cache set failed:", error);
  }
}

export async function deleteCached(key: string): Promise<void> {
  if (!redis) {
    return;
  }

  try {
    await redis.del(key);
  } catch (error) {
    console.error("Cache delete failed:", error);
  }
}
