/**
 * API Route Caching Wrapper
 * Provides Redis caching for Next.js API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { cacheService } from '@/lib/services/redis'

export interface ApiCacheOptions {
    keyGenerator: (req: NextRequest) => string
    ttl: number
    allowMethods?: string[]
    revalidate?: boolean
}

/**
 * Wrap an API route handler with Redis caching
 * Only caches GET requests by default
 */
export function withApiCache(
    handler: (req: NextRequest) => Promise<NextResponse>,
    options: ApiCacheOptions
) {
    return async (req: NextRequest) => {
        const method = req.method || 'GET'

        // Only cache GET requests by default (or specified methods)
        const shouldCache = options.allowMethods
            ? options.allowMethods.includes(method)
            : method === 'GET'

        if (!shouldCache) {
            return handler(req)
        }

        const cacheKey = options.keyGenerator(req)

        // Force revalidation if requested
        if (!options.revalidate) {
            const cached = await cacheService.get(cacheKey)

            if (cached) {
                console.log(`[API Cache] HIT: ${cacheKey}`)
                return NextResponse.json(cached, {
                    headers: {
                        'X-Cache': 'HIT',
                        'Cache-Control': `public, max-age=${options.ttl}`,
                    }
                })
            }
        }

        console.log(`[API Cache] MISS: ${cacheKey}`)

        // Execute handler
        const response = await handler(req)

        // Cache successful responses
        if (response.ok) {
            try {
                const clonedResponse = response.clone()
                const data = await clonedResponse.json()

                await cacheService.set(cacheKey, data, options.ttl)

                // Return response with cache headers
                return NextResponse.json(data, {
                    headers: {
                        'X-Cache': 'MISS',
                        'Cache-Control': `public, max-age=${options.ttl}`,
                    }
                })
            } catch (error) {
                console.error('[API Cache] Error caching response:', error)
                return response
            }
        }

        return response
    }
}

/**
 * Generate cache key from URL and query params
 */
export function generateApiCacheKey(prefix: string, req: NextRequest): string {
    const url = new URL(req.url)
    const searchParams = url.searchParams.toString()
    return `api:${prefix}${searchParams ? `:${searchParams}` : ''}`
}
