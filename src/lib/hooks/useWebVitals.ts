'use client'

/**
 * Performance Monitoring Hook
 * Cedar Elevator Industries
 * 
 * Monitors Core Web Vitals and reports to console/analytics
 * Note: FID has been deprecated in favor of INP in web-vitals v3+
 */

import { useEffect } from 'react'

interface WebVitalMetric {
    name: 'LCP' | 'CLS' | 'TTFB' | 'FCP' | 'INP'
    value: number
    rating: 'good' | 'needs-improvement' | 'poor'
}

const THRESHOLDS = {
    LCP: { good: 2500, poor: 4000 },
    CLS: { good: 0.1, poor: 0.25 },
    TTFB: { good: 800, poor: 1800 },
    FCP: { good: 1800, poor: 3000 },
    INP: { good: 200, poor: 500 },
}

function getRating(name: keyof typeof THRESHOLDS, value: number): 'good' | 'needs-improvement' | 'poor' {
    const threshold = THRESHOLDS[name]
    if (value <= threshold.good) return 'good'
    if (value <= threshold.poor) return 'needs-improvement'
    return 'poor'
}

export function useWebVitals(onReport?: (metric: WebVitalMetric) => void) {
    useEffect(() => {
        if (typeof window === 'undefined') return

        async function loadWebVitals() {
            try {
                const { onLCP, onCLS, onTTFB, onFCP, onINP } = await import('web-vitals')

                const report = (name: WebVitalMetric['name']) => (metric: { value: number }) => {
                    const rating = getRating(name, metric.value)
                    const webVitalMetric: WebVitalMetric = {
                        name,
                        value: metric.value,
                        rating,
                    }

                    // Log to console in development
                    if (process.env.NODE_ENV === 'development') {
                        const color = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌'
                        console.log(`${color} ${name}: ${metric.value.toFixed(2)} (${rating})`)
                    }

                    // Call custom reporter
                    onReport?.(webVitalMetric)
                }

                onLCP(report('LCP'))
                onCLS(report('CLS'))
                onTTFB(report('TTFB'))
                onFCP(report('FCP'))
                onINP(report('INP'))
            } catch (error) {
                // web-vitals not installed, skip
                console.log('Web Vitals library not available')
            }
        }

        loadWebVitals()
    }, [onReport])
}

/**
 * Performance observer for resource loading
 */
export function useResourceTiming() {
    useEffect(() => {
        if (typeof window === 'undefined' || !window.PerformanceObserver) return

        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'resource') {
                    const resource = entry as PerformanceResourceTiming

                    // Log slow resources (> 1s)
                    if (resource.duration > 1000) {
                        console.warn(`Slow resource: ${resource.name} (${resource.duration.toFixed(0)}ms)`)
                    }
                }
            }
        })

        try {
            observer.observe({ entryTypes: ['resource'] })
        } catch (e) {
            // Observer not supported
        }

        return () => observer.disconnect()
    }, [])
}

/**
 * Get connection quality for adaptive loading
 */
export function useConnectionQuality() {
    if (typeof navigator === 'undefined') {
        return { effectiveType: '4g', saveData: false }
    }

    const connection = (navigator as Navigator & {
        connection?: {
            effectiveType: string
            saveData: boolean
        }
    }).connection

    return {
        effectiveType: connection?.effectiveType || '4g',
        saveData: connection?.saveData || false,
    }
}
