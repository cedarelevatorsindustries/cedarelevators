/**
 * Debounce utility for performance optimization
 * Cedar Elevator Industries
 */

export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    return function (this: unknown, ...args: Parameters<T>) {
        if (timeoutId) {
            clearTimeout(timeoutId)
        }

        timeoutId = setTimeout(() => {
            func.apply(this, args)
        }, wait)
    }
}

/**
 * Throttle utility - limits function calls to once per interval
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle = false

    return function (this: unknown, ...args: Parameters<T>) {
        if (!inThrottle) {
            func.apply(this, args)
            inThrottle = true
            setTimeout(() => {
                inThrottle = false
            }, limit)
        }
    }
}

/**
 * RAF-based throttle for animation-related operations
 */
export function rafThrottle<T extends (...args: unknown[]) => unknown>(
    func: T
): (...args: Parameters<T>) => void {
    let rafId: number | null = null

    return function (this: unknown, ...args: Parameters<T>) {
        if (rafId) {
            cancelAnimationFrame(rafId)
        }

        rafId = requestAnimationFrame(() => {
            func.apply(this, args)
            rafId = null
        })
    }
}

/**
 * Memoization utility for expensive computations
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
    func: T,
    resolver?: (...args: Parameters<T>) => string
): T {
    const cache = new Map<string, ReturnType<T>>()

    return function (this: unknown, ...args: Parameters<T>): ReturnType<T> {
        const key = resolver ? resolver(...args) : JSON.stringify(args)

        if (cache.has(key)) {
            return cache.get(key)!
        }

        const result = func.apply(this, args) as ReturnType<T>
        cache.set(key, result)
        return result
    } as T
}

/**
 * Batch operations for reducing re-renders
 */
export function batchUpdates<T>(
    updates: (() => T)[],
    delay = 0
): Promise<T[]> {
    return new Promise((resolve) => {
        if (delay === 0) {
            requestAnimationFrame(() => {
                resolve(updates.map((update) => update()))
            })
        } else {
            setTimeout(() => {
                resolve(updates.map((update) => update()))
            }, delay)
        }
    })
}

/**
 * Check if we're on a low-end device
 */
export function isLowEndDevice(): boolean {
    if (typeof navigator === 'undefined') return false

    // Check hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency || 4

    // Check device memory (in GB)
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 8

    return cores <= 2 || memory <= 2
}

/**
 * Check connection quality
 */
export function getConnectionQuality(): 'slow' | 'medium' | 'fast' {
    if (typeof navigator === 'undefined') return 'fast'

    const connection = (navigator as Navigator & {
        connection?: { effectiveType: string }
    }).connection

    if (!connection) return 'fast'

    switch (connection.effectiveType) {
        case 'slow-2g':
        case '2g':
            return 'slow'
        case '3g':
            return 'medium'
        default:
            return 'fast'
    }
}

/**
 * Load script dynamically
 */
export function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = src
        script.async = true
        script.onload = () => resolve()
        script.onerror = reject
        document.head.appendChild(script)
    })
}
