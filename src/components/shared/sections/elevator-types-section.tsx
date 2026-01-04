"use client"

import { ArrowRight } from "lucide-react"
import LocalizedClientLink from "@components/ui/localized-client-link"
import { cn } from "@/lib/utils"
import type { ElevatorType } from "@/lib/data/elevator-types"

interface ElevatorTypesSectionProps {
    variant?: 'desktop' | 'mobile'
    hasProducts?: boolean
    elevatorTypes?: ElevatorType[]
}

/**
 * Unified Elevator Types Section
 * Responsive component that handles both mobile and desktop layouts
 */
export function ElevatorTypesSection({
    variant = 'desktop',
    hasProducts = true,
    elevatorTypes = []
}: ElevatorTypesSectionProps) {
    const isMobile = variant === 'mobile'

    // Don't render if no elevator types available
    if (!elevatorTypes || elevatorTypes.length === 0) {
        return null
    }

    // Don't render if no products in backend (desktop behavior)
    if (!hasProducts && !isMobile) {
        return null
    }

    return (
        <section className={cn(
            "bg-white",
            isMobile ? "py-6" : "py-8"
        )}>
            <div className={cn(isMobile ? "px-4" : "px-12")}>
                {/* Section Header */}
                <div className={cn(isMobile ? "mb-4" : "mb-6")}>
                    <h2 className={cn(
                        "font-bold text-gray-900",
                        isMobile ? "text-lg mb-1" : "text-2xl font-semibold mb-2"
                    )}>
                        Shop by Elevator Type
                    </h2>
                    <p className={cn(
                        "text-gray-600",
                        isMobile ? "text-xs" : "text-sm"
                    )}>
                        Browse our premium elevator selection organized by elevator type
                    </p>
                </div>

                {/* Elevator Types Grid */}
                {isMobile ? (
                    <MobileGrid elevatorTypes={elevatorTypes} />
                ) : (
                    <DesktopGrid elevatorTypes={elevatorTypes} />
                )}
            </div>
        </section>
    )
}

/** Desktop Grid - Square cards with overlays */
function DesktopGrid({ elevatorTypes }: { elevatorTypes: ElevatorType[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {elevatorTypes.map((type) => {
                const imageSrc = type.thumbnail_image || type.banner_image || '/images/image.png'
                const href = `/catalog?type=${type.slug}`

                return (
                    <LocalizedClientLink
                        key={type.id}
                        href={href}
                        className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 aspect-square"
                    >
                        {/* Background Image */}
                        <div className="absolute inset-0 bg-gray-200">
                            <img
                                src={imageSrc}
                                alt={type.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            {/* Dark Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 transition-all duration-300" />
                        </div>

                        {/* Content Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <h3 className="text-base font-bold mb-1 group-hover:text-blue-300 transition-colors line-clamp-2">
                                {type.name}
                            </h3>
                            <p className="text-gray-200 text-xs mb-2 leading-relaxed line-clamp-2">
                                {type.description || 'Browse products for this elevator type'}
                            </p>
                            {/* CTA Button */}
                            <div className="flex items-center text-blue-300 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="mr-1">Shop Now</span>
                                <ArrowRight size={14} />
                            </div>
                        </div>
                    </LocalizedClientLink>
                )
            })}
        </div>
    )
}

/** Mobile Grid - Vertical cards with separate image and content */
function MobileGrid({ elevatorTypes }: { elevatorTypes: ElevatorType[] }) {
    return (
        <div className="grid grid-cols-2 gap-3">
            {elevatorTypes.map((type) => {
                const imageSrc = type.thumbnail_image || type.banner_image || '/images/image.png'
                const href = `/catalog?type=${type.slug}`

                return (
                    <div key={type.id} className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
                        {/* Image */}
                        <div className="relative aspect-square overflow-hidden">
                            <img
                                src={imageSrc}
                                alt={type.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Content */}
                        <div className="p-3 flex flex-col gap-2">
                            <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight">
                                {type.name}
                            </h3>
                            <p className="text-gray-600 text-[10px] leading-relaxed truncate">
                                {type.description || 'Explore components'}
                            </p>
                            {/* Shop Now Button */}
                            <LocalizedClientLink
                                href={href}
                                className="flex items-center justify-center text-white font-medium text-xs bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md py-2 transition-colors"
                            >
                                <span className="mr-1">Shop Now</span>
                                <ArrowRight size={12} />
                            </LocalizedClientLink>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default ElevatorTypesSection

