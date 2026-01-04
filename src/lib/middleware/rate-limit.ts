/**
 * Rate Limiting Middleware using Redis
 * Implements token bucket algorithm for API rate limiting
 */

import { NextRequest, NextResponse } from 'next/server'
import { cacheService } from '@/lib/services/redis'
import { CACHE_KEYS } from '@/lib/utils/cache-keys'

export interface RateLimitConfig {
  max: number // Maximum requests
  window: number // Time window in seconds
  message?: string
}

export const RATE_LIMITS = {
  // Public API endpoints
  PUBLIC: {
    max: 100,
    window: 60, // 100 requests per minute
  },
  // Authenticated users
  AUTHENTICATED: {
    max: 300,
    window: 60, // 300 requests per minute
  },
  // Admin endpoints
  ADMIN: {
    max: 1000,
    window: 60, // 1000 requests per minute
  },
  // Search endpoints
  SEARCH: {
    max: 30,
    window: 60, // 30 searches per minute
  },
  // Auth endpoints (login, register)
  AUTH: {
    max: 5,
    window: 300, // 5 attempts per 5 minutes
  },
} as const

/**
 * Rate limit a request by IP
 */
export async function rateLimitByIP(
  ip: string,
  endpoint: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const key = CACHE_KEYS.RATE_LIMIT.IP(ip, endpoint)
  const { max, window } = config

  // Get current count
  const current = await cacheService.get<number>(key) || 0

  if (current >= max) {
    // Rate limit exceeded
    const ttl = await cacheService.ttl(key)
    return {
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + (ttl * 1000),
    }
  }

  // Increment counter
  const newCount = await cacheService.incr(key)

  // Set expiry on first request
  if (newCount === 1) {
    await cacheService.expire(key, window)
  }

  return {
    allowed: true,
    remaining: Math.max(0, max - newCount),
    resetAt: Date.now() + (window * 1000),
  }
}

/**
 * Rate limit a request by user ID
 */
export async function rateLimitByUser(
  userId: string,
  endpoint: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const key = CACHE_KEYS.RATE_LIMIT.USER(userId, endpoint)
  const { max, window } = config

  const current = await cacheService.get<number>(key) || 0

  if (current >= max) {
    const ttl = await cacheService.ttl(key)
    return {
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + (ttl * 1000),
    }
  }

  const newCount = await cacheService.incr(key)

  if (newCount === 1) {
    await cacheService.expire(key, window)
  }

  return {
    allowed: true,
    remaining: Math.max(0, max - newCount),
    resetAt: Date.now() + (window * 1000),
  }
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  return 'unknown'
}

/**
 * Rate limit middleware for API routes
 */
export function withRateLimit(
  handler: Function,
  config: RateLimitConfig = RATE_LIMITS.PUBLIC
) {
  return async (request: NextRequest) => {
    const ip = getClientIP(request)
    const endpoint = request.nextUrl.pathname

    // Try to rate limit by IP
    const result = await rateLimitByIP(ip, endpoint, config)

    // Add rate limit headers
    const headers = {
      'X-RateLimit-Limit': config.max.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.resetAt).toISOString(),
    }

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: config.message || 'Rate limit exceeded',
          retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            ...headers,
            'Retry-After': Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    // Execute handler
    const response = await handler(request)

    // Add rate limit headers to response
    if (response instanceof NextResponse) {
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
    }

    return response
  }
}

/**
 * Check if user is rate limited (for client-side checks)
 */
export async function checkRateLimit(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig
): Promise<boolean> {
  const key = CACHE_KEYS.RATE_LIMIT.IP(identifier, endpoint)
  const current = await cacheService.get<number>(key) || 0
  return current < config.max
}

/**
 * Reset rate limit for a specific identifier
 */
export async function resetRateLimit(
  identifier: string,
  endpoint: string
): Promise<void> {
  const key = CACHE_KEYS.RATE_LIMIT.IP(identifier, endpoint)
  await cacheService.del(key)
}

