"use client"

import { cn } from "@/lib/utils"
import { Grid3x3, Wrench, ClipboardCheck, Cog, Package } from "lucide-react"

// Icon mapping for applications
const iconMap: Record<string, any> = {
    wrench: Wrench,
    clipboard: ClipboardCheck,
    cog: Cog,
    grid: Grid3x3,
    package: Package
}

// Badge color mapping matches storefront
const badgeColorMap: Record<string, string> = {
    orange: "bg-orange-600",
    blue: "bg-blue-600",
    green: "bg-green-600",
    purple: "bg-purple-600",
    red: "bg-red-600",
    yellow: "bg-yellow-600"
}

interface ApplicationPreviewProps {
    name: string
    description?: string
    imageUrl?: string
    badgeText?: string
    badgeColor?: string
    className?: string
    status?: string
}

export function ApplicationPreview({
    name,
    description,
    imageUrl,
    badgeText,
    badgeColor = "#f97316", // Default orange if custom color used
    className,
    status
}: ApplicationPreviewProps) {
    // Logic to determine badge background class if using preset colors, or style for custom hex
    let badgeClass = "bg-blue-600" // Default fallback
    const isPresetColor = Object.keys(badgeColorMap).some(color =>
        badgeColor?.toLowerCase().includes(color)
    )

    if (isPresetColor) {
        // Try to find a match in our map
        const match = Object.entries(badgeColorMap).find(([key]) =>
            badgeColor?.toLowerCase().includes(key)
        )
        if (match) badgeClass = match[1]
    }

    return (
        <div className={cn("w-full max-w-sm mx-auto", className)}>
            <div className="group relative overflow-hidden rounded-2xl shadow-md transition-all duration-300 aspect-[4/3] text-left w-full bg-gray-100">
                {/* Background Image */}
                <div className="absolute inset-0">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={name || "Application preview"}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                            <Grid3x3 className="w-12 h-12 opacity-20" />
                        </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                </div>

                {/* Badge */}
                {badgeText && (
                    <div className="absolute top-3 left-3">
                        <span
                            className={cn(
                                "text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide",
                                // If it's a hex code, we apply style directly, else class
                                !badgeColor.startsWith('#') ? badgeClass : ""
                            )}
                            style={badgeColor.startsWith('#') ? { backgroundColor: badgeColor } : undefined}
                        >
                            {badgeText}
                        </span>
                    </div>
                )}

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-lg font-bold mb-1">
                        {name || "Application Name"}
                    </h3>
                    <p className="text-gray-200 text-xs line-clamp-2">
                        {description || 'Browse products in this application'}
                    </p>
                </div>

                {/* Admin Status Overlay (Only for preview context) */}
                {status && (
                    <div className="absolute top-3 right-3">
                        <span className="bg-white/90 text-gray-800 text-[10px] font-medium px-2 py-0.5 rounded border border-gray-200 uppercase shadow-sm">
                            {status}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}
