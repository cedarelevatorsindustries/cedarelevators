"use client"

import { ProductCategory } from "@/lib/types/domain"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { CatalogFilterDrawer } from "@/modules/catalog/components/filters"
import Link from "next/link"
import { useRef } from "react"

interface CatalogBannerProps {
    title: string
    subtitle?: string
    backgroundImage?: string
    categories?: ProductCategory[]
    type: "application" | "category"
    slug?: string
    variant?: "full" | "simple"
}


export function CatalogBanner({
    title,
    subtitle,
    backgroundImage,
    categories = [],
    type,
    slug,
    variant = "full"
}: CatalogBannerProps) {
    const scrollRef = useRef<HTMLDivElement>(null)

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 300
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            })
        }
    }

    // Simple variant - compact rounded banner without category bar
    if (variant === "simple") {
        return (
            <div className="w-full mt-0">
                <div
                    className="relative h-[240px] rounded-2xl mx-8 overflow-hidden"
                    style={{
                        backgroundImage: `url(${backgroundImage || "/images/image.png"})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/40" />

                    {/* Content - Centered */}
                    <div className="relative h-full flex flex-col items-center justify-center text-center px-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-white/90 text-sm md:text-base max-w-2xl">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
                <div className="h-8" />
            </div>
        )
    }

    // Full variant - with horizontal category bar
    return (
        <div className="w-full mt-0">
            {/* Banner Section */}
            <div
                className="relative h-[320px] md:h-[360px] bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 overflow-visible"
                style={{
                    backgroundImage: `url(${backgroundImage || "/images/image.png"})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40" />

                {/* Content - Title and Description Centered with Gap */}
                <div className="relative h-full max-w-[1400px] mx-auto px-8 flex flex-col justify-end pb-32">
                    <div className="text-center w-full">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-white/90 text-base md:text-lg max-w-3xl mx-auto">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                {/* Floating White Card - Wider with Less Rounded Corners */}
                {categories.length > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 translate-y-1/2">
                        <div className="max-w-[1300px] mx-auto px-8">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between relative">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {type === "application" ? "Source by Categories" : "Source by Subcategory"}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <CatalogFilterDrawer variant="icon" />
                                        {/* Scroll Buttons */}
                                        <button
                                            onClick={() => scroll('left')}
                                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                            aria-label="Scroll left"
                                        >
                                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                                        </button>
                                        <button
                                            onClick={() => scroll('right')}
                                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                            aria-label="Scroll right"
                                        >
                                            <ChevronRight className="w-5 h-5 text-gray-600" />
                                        </button>
                                    </div>
                                </div>

                                {/* Horizontal Scroll Container */}
                                <div
                                    ref={scrollRef}
                                    className="overflow-x-auto scrollbar-hide -mx-2"
                                >
                                    <div className="flex gap-8 px-2 pb-2">
                                        {categories.map((category) => (
                                            <Link
                                                key={category.id}
                                                href={
                                                    type === "application"
                                                        ? `/catalog?application=${slug}&category=${category.slug || category.handle || category.id}`
                                                        : `/catalog?category=${category.slug || category.handle || category.id}`
                                                }
                                                className="flex flex-col items-center gap-2 group min-w-[100px]"
                                            >
                                                {/* Image Container */}
                                                <div className="w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100">
                                                    <img
                                                        src={category.thumbnail || category.thumbnail_image || category.image_url || "/images/image.png"}
                                                        alt={category.name || ""}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                                    />
                                                </div>

                                                {/* Category Name */}
                                                <span className="text-xs font-medium text-gray-700 text-center group-hover:text-blue-700 transition-colors line-clamp-2 leading-tight max-w-[100px]">
                                                    {category.name}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Spacer to account for floating card */}
            {categories.length > 0 && <div className="h-28" />}

            <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
        </div>
    )
}

