/**
 * Redis Service for Caching
 * Using Upstash Redis for serverless-friendly caching
 */

import { Redis } from '@upstash/redis'

// Check if Redis is configured
const isRedisConfigured = 
  process.env.UPSTASH_REDIS_REST_URL && 
  process.env.UPSTASH_REDIS_REST_TOKEN

// Initialize Redis client (only if configured)
let redis: Redis | null = null

if (isRedisConfigured) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
}

/**
 * Cache service with fallback when Redis is not configured
 */
export const cacheService = {
  /**
   * Get value from cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    if (!redis) {
      console.warn('Redis not configured, skipping cache get')
      return null
    }

    try {
      const value = await redis.get<T>(key)
      return value
    } catch (error) {
      console.error('Redis get error:', error)
      return null
    }
  },

  /**
   * Set value in cache with TTL (time to live in seconds)
   */
  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    if (!redis) {
      console.warn('Redis not configured, skipping cache set')
      return false
    }

    try {
      if (ttl) {
        await redis.setex(key, ttl, JSON.stringify(value))
      } else {
        await redis.set(key, JSON.stringify(value))
      }
      return true
    } catch (error) {
      console.error('Redis set error:', error)
      return false
    }
  },

  /**
   * Delete key from cache
   */
  async del(key: string): Promise<boolean> {
    if (!redis) {
      return false
    }

    try {
      await redis.del(key)
      return true
    } catch (error) {
      console.error('Redis delete error:', error)
      return false
    }
  },

  /**
   * Delete multiple keys matching pattern
   */
  async delPattern(pattern: string): Promise<number> {
    if (!redis) {
      return 0
    }

    try {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
        return keys.length
      }
      return 0
    } catch (error) {
      console.error('Redis delete pattern error:', error)
      return 0
    }
  },

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!redis) {
      return false
    }

    try {
      const result = await redis.exists(key)
      return result === 1
    } catch (error) {
      console.error('Redis exists error:', error)
      return false
    }
  },

  /**
   * Get TTL for key (in seconds)
   */
  async ttl(key: string): Promise<number> {
    if (!redis) {
      return -1
    }

    try {
      return await redis.ttl(key)
    } catch (error) {
      console.error('Redis TTL error:', error)
      return -1
    }
  },

  /**
   * Increment counter
   */
  async incr(key: string): Promise<number> {
    if (!redis) {
      return 0
    }

    try {
      return await redis.incr(key)
    } catch (error) {
      console.error('Redis incr error:', error)
      return 0
    }
  },

  /**
   * Set expiry on existing key
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    if (!redis) {
      return false
    }

    try {
      await redis.expire(key, seconds)
      return true
    } catch (error) {
      console.error('Redis expire error:', error)
      return false
    }
  },
}

// Export Redis client for advanced operations
export { redis }

// Helper to check if Redis is available
export const isRedisAvailable = () => redis !== null
