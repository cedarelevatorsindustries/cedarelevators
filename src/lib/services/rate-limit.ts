import { redis, isRedisCircuitOpen, tripRedisCircuit } from './redis'

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

const REDIS_TIMEOUT_MS = 1000

async function withFastTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: NodeJS.Timeout | null = null
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Redis timeout')), timeoutMs)
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

/**
 * Durable Upstash Redis rate limiter with fast-fail circuit breaker and automatic in-memory fallback.
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const namespacedKey = `cedar:rl:${key}`

  if (redis && !isRedisCircuitOpen()) {
    try {
      const count = await withFastTimeout(redis.incr(namespacedKey), REDIS_TIMEOUT_MS)
      if (count === 1) {
        await withFastTimeout(redis.expire(namespacedKey, windowSeconds), REDIS_TIMEOUT_MS)
      }
      if (count > maxRequests) {
        const ttl = await withFastTimeout(redis.ttl(namespacedKey), REDIS_TIMEOUT_MS)
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
      tripRedisCircuit()
      console.warn('[RateLimit] Redis unreachable, tripped fallback circuit to memory:', err)
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
