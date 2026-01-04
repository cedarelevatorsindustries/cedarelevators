"use client"

import { ArrowRight } from "lucide-react"
import Link from "next/link"
import type { ElevatorType } from "@/lib/data/elevator-types"

interface ShopByTypeSectionProps {
    hasProducts?: boolean
    elevatorTypes?: ElevatorType[]
}

export default function ShopByTypeSection({ hasProducts = false, elevatorTypes = [] }: ShopByTypeSectionProps) {
    // Don't render if no products in backend OR no elevator types
    if (!hasProducts || !elevatorTypes || elevatorTypes.length === 0) {
        return null
    }

    return (
        <section className="bg-white py-8">
            <div className="px-12">
                {/* Section Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        Shop by Elevator Type
                    </h2>
                    <p className="text-gray-600 text-sm">
                        Browse our premium elevator selection organized by elevator type
                    </p>
                </div>

                {/* Elevator Types Grid - Square Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {elevatorTypes.map((type) => {
                        const imageSrc = type.thumbnail_image || type.banner_image || '/images/image.png'
                        const href = `/products?type=${type.slug}`
                        
                        return (
                            <Link
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
                                        {type.description || `Browse ${type.name.toLowerCase()} components`}
                                    </p>

                                    {/* CTA Button */}
                                    <div className="flex items-center text-blue-300 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <span className="mr-1">Shop Now</span>
                                        <ArrowRight size={14} />
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

