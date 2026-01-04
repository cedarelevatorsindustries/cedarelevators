/**
 * Cache key naming convention and utilities
 * Provides consistent cache key generation across the application
 */

export const CACHE_KEYS = {
  // Product keys
  PRODUCTS: {
    LIST: (filters?: string) => `products:list${filters ? `:${filters}` : ''}`,
    DETAIL: (id: string) => `products:detail:${id}`,
    BY_SLUG: (slug: string) => `products:slug:${slug}`,
    BY_CATEGORY: (categoryId: string) => `products:category:${categoryId}`,
    FEATURED: () => 'products:featured',
    TOP_SELLING: () => 'products:top-selling',
    LOW_STOCK: () => 'products:low-stock',
  },

  // Category keys
  CATEGORIES: {
    LIST: () => 'categories:list',
    TREE: () => 'categories:tree',
    DETAIL: (id: string) => `categories:detail:${id}`,
    BY_SLUG: (slug: string) => `categories:slug:${slug}`,
  },

  // Order keys
  ORDERS: {
    LIST: (userId: string, filters?: string) => 
      `orders:user:${userId}${filters ? `:${filters}` : ''}`,
    DETAIL: (orderId: string) => `orders:detail:${orderId}`,
    STATS: () => 'orders:stats',
  },

  // Cart keys
  CART: {
    BY_ID: (cartId: string) => `cart:${cartId}`,
    BY_USER: (userId: string) => `cart:user:${userId}`,
  },

  // Admin dashboard keys
  ADMIN: {
    STATS: () => 'admin:stats',
    ANALYTICS: (type: string) => `admin:analytics:${type}`,
    CUSTOMERS: () => 'admin:customers',
    RECENT_ORDERS: () => 'admin:recent-orders',
  },

  // Search keys
  SEARCH: {
    RESULTS: (query: string, filters?: string) => 
      `search:${query}${filters ? `:${filters}` : ''}`,
  },

  // User keys
  USER: {
    PROFILE: (userId: string) => `user:profile:${userId}`,
    PREFERENCES: (userId: string) => `user:preferences:${userId}`,
    RECENT_VIEWS: (userId: string) => `user:recent-views:${userId}`,
  },

  // Business keys
  BUSINESS: {
    PROFILE: (userId: string) => `business:profile:${userId}`,
    VERIFICATION_STATUS: (userId: string) => `business:verification:${userId}`,
  },

  // Rate limiting keys
  RATE_LIMIT: {
    IP: (ip: string, endpoint: string) => `rate-limit:ip:${ip}:${endpoint}`,
    USER: (userId: string, endpoint: string) => `rate-limit:user:${userId}:${endpoint}`,
    API: (endpoint: string) => `rate-limit:api:${endpoint}`,
  },
} as const

/**
 * Cache TTL (Time To Live) in seconds
 */
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 900, // 15 minutes
  HOUR: 3600, // 1 hour
  DAY: 86400, // 24 hours
  WEEK: 604800, // 7 days
} as const

/**
 * Default TTL for different data types
 */
export const DEFAULT_TTL = {
  PRODUCTS: CACHE_TTL.LONG, // 15 minutes
  CATEGORIES: CACHE_TTL.HOUR, // 1 hour
  ADMIN_STATS: CACHE_TTL.MEDIUM, // 5 minutes
  SEARCH_RESULTS: CACHE_TTL.MEDIUM, // 5 minutes
  USER_PROFILE: CACHE_TTL.LONG, // 15 minutes
  CART: CACHE_TTL.HOUR, // 1 hour
  ORDERS: CACHE_TTL.MEDIUM, // 5 minutes
} as const

/**
 * Generate cache key with filters
 */
export function generateCacheKey(
  baseKey: string,
  filters?: Record<string, any>
): string {
  if (!filters || Object.keys(filters).length === 0) {
    return baseKey
  }

  const sortedFilters = Object.keys(filters)
    .sort()
    .map(key => `${key}:${filters[key]}`)
    .join(':')

  return `${baseKey}:${sortedFilters}`
}

/**
 * Parse filters from cache key
 */
export function parseCacheKeyFilters(cacheKey: string): Record<string, string> {
  const parts = cacheKey.split(':')
  const filters: Record<string, string> = {}

  for (let i = 0; i < parts.length - 1; i += 2) {
    if (parts[i] && parts[i + 1]) {
      filters[parts[i]] = parts[i + 1]
    }
  }

  return filters
}

/**
 * Invalidate cache patterns
 */
export const INVALIDATION_PATTERNS = {
  ALL_PRODUCTS: 'products:*',
  ALL_CATEGORIES: 'categories:*',
  ALL_ORDERS: 'orders:*',
  ALL_ADMIN: 'admin:*',
  USER_DATA: (userId: string) => `*:user:${userId}*`,
}

