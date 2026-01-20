'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'

interface LazyLoadProps {
    children: ReactNode
    fallback?: ReactNode
    rootMargin?: string
    threshold?: number
    className?: string
}

/**
 * LazyLoad Component
 * Defers rendering of children until they enter the viewport
 * Uses IntersectionObserver for efficient viewport detection
 */
export function LazyLoad({
    children,
    fallback = null,
    rootMargin = '100px',
    threshold = 0.1,
    className,
}: LazyLoadProps) {
    const [isVisible, setIsVisible] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.disconnect()
                }
            },
            {
                rootMargin,
                threshold,
            }
        )

        observer.observe(container)

        return () => observer.disconnect()
    }, [rootMargin, threshold])

    return (
        <div ref={containerRef} className={className}>
            {isVisible ? children : fallback}
        </div>
    )
}

interface LazyImageProps {
    src: string
    alt: string
    width?: number
    height?: number
    className?: string
    priority?: boolean
    placeholder?: 'blur' | 'empty'
    blurDataURL?: string
}

/**
 * LazyImage Component
 * Loads images only when they enter the viewport
 * With optional blur placeholder for better UX
 */
export function LazyImage({
    src,
    alt,
    width,
    height,
    className,
    priority = false,
    placeholder = 'empty',
    blurDataURL,
}: LazyImageProps) {
    const [isLoaded, setIsLoaded] = useState(false)
    const [isInView, setIsInView] = useState(priority)
    const imgRef = useRef<HTMLImageElement>(null)

    useEffect(() => {
        if (priority) return

        const img = imgRef.current
        if (!img) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true)
                    observer.disconnect()
                }
            },
            { rootMargin: '200px' }
        )

        observer.observe(img)
        return () => observer.disconnect()
    }, [priority])

    const showBlur = placeholder === 'blur' && blurDataURL && !isLoaded

    return (
        <div
            ref={imgRef}
            className={`relative overflow-hidden ${className || ''}`}
            style={{ width, height }}
        >
            {showBlur && (
                <img
                    src={blurDataURL}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover scale-110 blur-lg"
                />
            )}
            {isInView && (
                <img
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    onLoad={() => setIsLoaded(true)}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding="async"
                />
            )}
        </div>
    )
}

/**
 * Skeleton placeholder for lazy loaded content
 */
export function Skeleton({
    className = '',
    animate = true
}: {
    className?: string
    animate?: boolean
}) {
    return (
        <div
            className={`bg-gray-200 rounded ${animate ? 'animate-pulse' : ''
                } ${className}`}
        />
    )
}

/**
 * Prefetch utility for critical navigation links
 * Call this on hover/focus to preload next page
 */
export function prefetchRoute(href: string) {
    if (typeof window === 'undefined') return

    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = href
    link.as = 'document'
    document.head.appendChild(link)
}

/**
 * Hook for intersection observer
 */
export function useIntersectionObserver(
    options: IntersectionObserverInit = {}
): [React.RefObject<HTMLDivElement | null>, boolean] {
    const ref = useRef<HTMLDivElement>(null)
    const [isIntersecting, setIsIntersecting] = useState(false)

    useEffect(() => {
        const element = ref.current
        if (!element) return

        const observer = new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting)
        }, options)

        observer.observe(element)
        return () => observer.disconnect()
    }, [options])

    return [ref, isIntersecting]
}
