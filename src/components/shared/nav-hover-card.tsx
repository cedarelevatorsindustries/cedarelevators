"use client"

import { useState, useRef, useEffect, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface NavHoverCardProps {
    /** The trigger element (e.g., button, icon) */
    trigger: ReactNode
    /** The content to show in the dropdown */
    children: ReactNode
    /** Alignment of the dropdown relative to the trigger */
    align?: 'left' | 'center' | 'right'
    /** Width of the dropdown */
    width?: 'sm' | 'md' | 'lg' | 'auto'
    /** Whether to show the arrow pointer */
    showArrow?: boolean
    /** Callback when hover state changes */
    onHoverChange?: (isHovered: boolean) => void
    /** Close delay in ms (allows moving cursor to dropdown) */
    closeDelay?: number
    /** Class for the trigger wrapper */
    triggerClassName?: string
}

const widthClasses = {
    sm: 'w-64',
    md: 'w-80',
    lg: 'w-96',
    auto: 'w-auto'
}

/**
 * Generic Nav Hover Card
 * Reusable hover dropdown component for navbar items
 */
export function NavHoverCard({
    trigger,
    children,
    align = 'right',
    width = 'md',
    showArrow = true,
    onHoverChange,
    closeDelay = 100,
    triggerClassName
}: NavHoverCardProps) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const timeoutRef = useRef<NodeJS.Timeout>(undefined)

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setIsOpen(true)
        onHoverChange?.(true)
    }

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false)
            onHoverChange?.(false)
        }, closeDelay)
    }

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [])

    const alignmentClasses = {
        left: 'left-0',
        center: 'left-1/2 -translate-x-1/2',
        right: 'right-0'
    }

    const arrowAlignmentClasses = {
        left: 'left-4',
        center: 'left-1/2 -translate-x-1/2',
        right: 'right-8'
    }

    return (
        <div
            ref={containerRef}
            className={cn("relative", triggerClassName)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {trigger}

            {isOpen && (
                <div className={cn(
                    "absolute top-full mt-3 z-50",
                    alignmentClasses[align]
                )}>
                    {/* Arrow/Tail */}
                    {showArrow && (
                        <div className={cn(
                            "absolute -top-2",
                            arrowAlignmentClasses[align]
                        )}>
                            <div className="w-4 h-4 bg-white border-t border-l border-gray-200 rotate-45 shadow-lg" />
                        </div>
                    )}

                    {/* Card content */}
                    <div className={cn(
                        "relative bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden",
                        widthClasses[width]
                    )}>
                        {children}
                    </div>
                </div>
            )}
        </div>
    )
}

export default NavHoverCard

