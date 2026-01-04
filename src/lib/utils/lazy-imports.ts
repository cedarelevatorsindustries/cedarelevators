/**
 * Centralized Lazy Import Utilities
 * Handles dynamic imports with loading states
 */

import { lazy, ComponentType } from 'react'

export interface LazyComponentOptions {
  fallback?: React.ReactNode
  retryDelay?: number
  maxRetries?: number
}

/**
 * Create lazy component with retry logic
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyComponentOptions = {}
): React.LazyExoticComponent<T> {
  const { maxRetries = 3, retryDelay = 1000 } = options

  return lazy(() =>
    importFn().catch((error) => {
      console.error('Lazy loading failed:', error)
      return retry(importFn, maxRetries, retryDelay)
    })
  )
}

/**
 * Retry failed import
 */
async function retry<T>(
  fn: () => Promise<T>,
  retriesLeft: number,
  delay: number
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retriesLeft === 0) {
      throw error
    }
    await new Promise((resolve) => setTimeout(resolve, delay))
    return retry(fn, retriesLeft - 1, delay * 2)
  }
}

/**
 * Preload component for faster navigation
 */
export function preloadComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): void {
  importFn().catch((error) => {
    console.error('Preload failed:', error)
  })
}


