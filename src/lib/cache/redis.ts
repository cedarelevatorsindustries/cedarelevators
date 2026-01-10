import { Redis } from '@upstash/redis'

// Initialize Redis client only if environment variables are present
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : null

/**
 * Get or set cached data with automatic expiration
 * @param key Cache key
 * @param fetcher Function to fetch data if cache miss
 * @param ttl Time to live in seconds (default: 3600 = 1 hour)
 */
export async function getCached<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 3600
): Promise<T> {
    // If Redis is not configured, just fetch the data
    if (!redis) {
        console.warn('Redis not configured, fetching data directly')
        return fetcher()
    }

    try {
        // Try to get from cache
        const cached = await redis.get(key)

        if (cached) {
            console.log(`Cache HIT for key: ${key}`)
            return cached as T
        }

        console.log(`Cache MISS for key: ${key}`)

        // Fetch fresh data
        const data = await fetcher()

        // Store in cache with TTL
        await redis.setex(key, ttl, JSON.stringify(data))

        return data
    } catch (error) {
        console.error('Redis error, falling back to direct fetch:', error)
        return fetcher()
    }
}

/**
 * Invalidate cache for a specific key or pattern
 */
export async function invalidateCache(key: string): Promise<void> {
    if (!redis) return

    try {
        await redis.del(key)
        console.log(`Cache invalidated for key: ${key}`)
    } catch (error) {
        console.error('Error invalidating cache:', error)
    }
}

/**
 * Clear all cache (use with caution)
 */
export async function clearAllCache(): Promise<void> {
    if (!redis) return

    try {
        await redis.flushdb()
        console.log('All cache cleared')
    } catch (error) {
        console.error('Error clearing cache:', error)
    }
}
