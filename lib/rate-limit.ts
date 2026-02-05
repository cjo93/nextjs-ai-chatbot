import { createClient } from 'redis'

const redis = process.env.REDIS_URL
  ? createClient({
      url: process.env.REDIS_URL,
    })
  : null

if (redis) {
  redis.on('error', (err) => console.error('Redis Client Error', err))
  redis.connect().catch(console.error)
}

export async function checkRateLimit(
  key: string,
  limit: number,
  window: number
): Promise<{ success: boolean; remaining: number }> {
  if (!redis) {
    return { success: true, remaining: limit }
  }

  try {
    const current = await redis.incr(key)
    
    if (current === 1) {
      await redis.expire(key, window)
    }
    
    const remaining = Math.max(0, limit - current)
    
    return {
      success: current <= limit,
      remaining,
    }
  } catch (error) {
    console.error('Rate limit check failed:', error)
    return { success: true, remaining: limit }
  }
}

export const ratelimit = {
  api: async (identifier: string) => {
    return checkRateLimit(`ratelimit:api:${identifier}`, 10, 10)
  },
  checkout: async (identifier: string) => {
    return checkRateLimit(`ratelimit:checkout:${identifier}`, 3, 3600)
  },
  events: async (identifier: string) => {
    return checkRateLimit(`ratelimit:events:${identifier}`, 20, 60)
  },
}
