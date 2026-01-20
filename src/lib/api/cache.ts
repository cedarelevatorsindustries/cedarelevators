/**
 * API Response Cache Utility
 * Cedar Elevator Industries
 * 
 * Provides in-memory caching for API responses to reduce database queries
 * and improve mobile performance.
 */

interface CacheEntry<T> {
    data: T
    timestamp: number
    ttl: number
}

class ResponseCache {
    private cache: Map<string, CacheEntry<unknown>> = new Map()
    private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes
    private readonly MAX_ENTRIES = 1000 // Prevent memory bloat

    /**
     * Get cached data if available and not expired
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key)
        if (!entry) return null

        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key)
            return null
        }

        return entry.data as T
    }

    /**
     * Set data in cache with optional TTL
     */
    set<T>(key: string, data: T, ttl?: number): void {
        // Evict oldest entries if at capacity
        if (this.cache.size >= this.MAX_ENTRIES) {
            const oldestKey = this.cache.keys().next().value
            if (oldestKey) this.cache.delete(oldestKey)
        }

        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl: ttl || this.DEFAULT_TTL,
        })
    }

    /**
     * Check if key exists and is valid
     */
    has(key: string): boolean {
        return this.get(key) !== null
    }

    /**
     * Invalidate a specific cache entry
     */
    invalidate(key: string): void {
        this.cache.delete(key)
    }

    /**
     * Invalidate entries matching a pattern
     */
    invalidatePattern(pattern: string): void {
        const regex = new RegExp(pattern)
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key)
            }
        }
    }

    /**
     * Clear all cached data
     */
    clear(): void {
        this.cache.clear()
    }

    /**
     * Get cache statistics
     */
    getStats(): { size: number; maxSize: number } {
        return {
            size: this.cache.size,
            maxSize: this.MAX_ENTRIES,
        }
    }
}

// Singleton instance
export const responseCache = new ResponseCache()

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
    SHORT: 30 * 1000,      // 30 seconds - for frequently changing data
    MEDIUM: 5 * 60 * 1000, // 5 minutes - default
    LONG: 30 * 60 * 1000,  // 30 minutes - for stable data
    STATIC: 24 * 60 * 60 * 1000, // 24 hours - for static content
} as const

// Helper function for cache-through pattern
export async function getCachedOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
): Promise<T> {
    const cached = responseCache.get<T>(key)
    if (cached) {
        return cached
    }

    const data = await fetchFn()
    responseCache.set(key, data, ttl)
    return data
}

// Request deduplication for concurrent requests
const pendingRequests = new Map<string, Promise<unknown>>()

export async function deduplicatedFetch<T>(
    key: string,
    fetchFn: () => Promise<T>
): Promise<T> {
    // Return existing pending request if one exists
    const pending = pendingRequests.get(key)
    if (pending) {
        return pending as Promise<T>
    }

    // Create new request and store it
    const request = fetchFn().finally(() => {
        pendingRequests.delete(key)
    })

    pendingRequests.set(key, request)
    return request
}
