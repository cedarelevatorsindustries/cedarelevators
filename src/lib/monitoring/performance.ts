/**
 * Performance Monitoring Utilities
 * Tracks Web Vitals and performance metrics
 */

'use client'

import { useEffect } from 'react'
import { onCLS, onINP, onFCP, onLCP, onTTFB, Metric } from 'web-vitals'

interface PerformanceMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
}

/**
 * Send metric to analytics
 */
function sendToAnalytics(metric: Metric) {
  const { name, value, rating, id } = metric

  // Send to your analytics endpoint
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        value,
        rating,
        id,
        timestamp: Date.now(),
        url: window.location.href,
      }),
    }).catch(console.error)
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vital] ${name}:`, {
      value: Math.round(value),
      rating,
    })
  }
}

/**
 * Hook to report Web Vitals
 */
export function useReportWebVitals() {
  useEffect(() => {
    onCLS(sendToAnalytics)
    onINP(sendToAnalytics)
    onFCP(sendToAnalytics)
    onLCP(sendToAnalytics)
    onTTFB(sendToAnalytics)
  }, [])
}

/**
 * Performance observer for custom metrics
 */
export function observePerformance() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return
  }

  try {
    // Observe long tasks
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          console.warn('Long task detected:', {
            duration: entry.duration,
            startTime: entry.startTime,
          })
        }
      }
    })
    longTaskObserver.observe({ entryTypes: ['longtask'] })

    // Observe layout shifts
    const layoutShiftObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if ((entry as any).hadRecentInput) {
          continue
        }
        console.log('Layout shift:', (entry as any).value)
      }
    })
    layoutShiftObserver.observe({ entryTypes: ['layout-shift'] })
  } catch (error) {
    console.error('Performance observer error:', error)
  }
}

/**
 * Mark custom performance metrics
 */
export function markPerformance(name: string) {
  if (typeof window !== 'undefined' && 'performance' in window) {
    performance.mark(name)
  }
}

/**
 * Measure between two marks
 */
export function measurePerformance(name: string, startMark: string, endMark: string) {
  if (typeof window !== 'undefined' && 'performance' in window) {
    try {
      performance.measure(name, startMark, endMark)
      const measure = performance.getEntriesByName(name)[0]
      console.log(`[Performance] ${name}: ${Math.round(measure.duration)}ms`)
      return measure.duration
    } catch (error) {
      console.error('Performance measure error:', error)
    }
  }
  return 0
}

