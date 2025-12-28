/**
 * Cache Middleware
 * Provides caching functionality for API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { cacheService } from '@/lib/services/redis'

export interface CacheOptions {
  key: string
  ttl?: number
  revalidate?: boolean
}

/**
 * Wrapper for caching API responses
 */
export async function withCache<T>(
  options: CacheOptions,
  fetcher: () => Promise<T>
): Promise<T> {
  const { key, ttl, revalidate = false } = options

  // Try to get from cache first
  if (!revalidate) {
    const cached = await cacheService.get<T>(key)
    if (cached) {
      console.log(`Cache hit: ${key}`)
      return cached
    }
  }

  // Cache miss or revalidate - fetch fresh data
  console.log(`Cache miss: ${key}`)
  const data = await fetcher()

  // Store in cache
  if (data) {
    await cacheService.set(key, data, ttl)
  }

  return data
}

/**
 * Cache middleware for Next.js API routes
 */
export function cacheMiddleware(handler: Function, options: CacheOptions) {
  return async (req: NextRequest) => {
    const { key, ttl } = options

    // Check if we should bypass cache (for POST, PUT, DELETE)
    if (req.method !== 'GET') {
      return handler(req)
    }

    // Try to get from cache
    const cached = await cacheService.get(key)
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': `public, max-age=${ttl || 300}`,
        },
      })
    }

    // Execute handler
    const response = await handler(req)
    
    // Cache the response if successful
    if (response.ok) {
      const data = await response.json()
      await cacheService.set(key, data, ttl)
      
      return NextResponse.json(data, {
        headers: {
          'X-Cache': 'MISS',
          'Cache-Control': `public, max-age=${ttl || 300}`,
        },
      })
    }

    return response
  }
}

/**
 * Helper to invalidate cache after mutations
 */
export async function invalidateCache(patterns: string | string[]) {
  const patternArray = Array.isArray(patterns) ? patterns : [patterns]
  
  for (const pattern of patternArray) {
    await cacheService.delPattern(pattern)
    console.log(`Cache invalidated: ${pattern}`)
  }
}

/**
 * Cache decorator for functions
 */
export function cached(ttl?: number) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`
      
      const cached = await cacheService.get(cacheKey)
      if (cached) {
        return cached
      }

      const result = await originalMethod.apply(this, args)
      await cacheService.set(cacheKey, result, ttl)
      
      return result
    }

    return descriptor
  }
}
