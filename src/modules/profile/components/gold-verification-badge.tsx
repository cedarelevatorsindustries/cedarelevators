'use client'

import { cn } from '@/lib/utils'

interface GoldVerificationBadgeProps {
    className?: string
    size?: number
}

/**
 * Gradient Gold Star Verification Badge
 * Features a star-burst shape with a gold gradient and white checkmark
 */
export default function GoldVerificationBadge({
    className,
    size = 20
}: GoldVerificationBadgeProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            className={cn("inline-block", className)}
            aria-label="Verified"
        >
            <defs>
                <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FDE047" /> {/* yellow-300 */}
                    <stop offset="50%" stopColor="#F59E0B" /> {/* amber-500 */}
                    <stop offset="100%" stopColor="#D97706" /> {/* amber-600 */}
                </linearGradient>
            </defs>

            {/* Starburst shape */}
            <path
                d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.475 13.406 1.6 11.903 1.6c-1.503 0-2.915.875-3.533 2.152-.416-.166-.866-.25-1.336-.25-2.108 0-3.818 1.788-3.818 3.998 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.71 3.998 3.818 3.998.47 0 .92-.084 1.336-.25.618 1.277 2.03 2.152 3.533 2.152 1.503 0 2.915-.875 3.533-2.152.416.166.866.25 1.336.25 2.108 0 3.818-1.788 3.818-3.998 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6z"
                fill="url(#gold-gradient)"
            />

            {/* White checkmark */}
            <path
                d="M9.5 15.5L6 12l-1.5 1.5L9.5 18.5l9-9L17 8l-7.5 7.5z"
                fill="white"
            />
        </svg>
    )
}
