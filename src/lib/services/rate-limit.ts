import { redis } from './redis'

interface MemoryBucket {
  count: number
  resetAt: number
}

const memoryBuckets = new Map<string, MemoryBucket>()

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

/**
 * Durable Upstash Redis rate limiter with automatic in-memory fallback for local dev.
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const namespacedKey = `cedar:rl:${key}`

  if (redis) {
    try {
      const count = await redis.incr(namespacedKey)
      if (count === 1) {
        await redis.expire(namespacedKey, windowSeconds)
      }
      if (count > maxRequests) {
        const ttl = await redis.ttl(namespacedKey)
        return {
          allowed: false,
          remaining: 0,
          retryAfterSeconds: ttl > 0 ? ttl : windowSeconds,
        }
      }
      return {
        allowed: true,
        remaining: Math.max(0, maxRequests - count),
        retryAfterSeconds: 0,
      }
    } catch (err) {
      console.warn('[RateLimit] Redis error, falling back to memory:', err)
    }
  }

  // In-memory fallback
  const now = Date.now()
  const existing = memoryBuckets.get(namespacedKey)
  if (!existing || existing.resetAt <= now) {
    memoryBuckets.set(namespacedKey, {
      count: 1,
      resetAt: now + windowSeconds * 1000,
    })
    return {
      allowed: true,
      remaining: Math.max(0, maxRequests - 1),
      retryAfterSeconds: 0,
    }
  }

  existing.count += 1
  if (existing.count > maxRequests) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000))
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    }
  }

  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - existing.count),
    retryAfterSeconds: 0,
  }
}
