"use client"

import { useRef } from "react"
import { Product, ProductCategory, Order } from "@/lib/types/domain"
import LocalizedClientLink from "@components/ui/localized-client-link"
import {
  ChevronLeft,
  ChevronRight,
  Cpu,
  DoorOpen,
  Zap,
  Shield,
  Cable,
  ToggleLeft,
  Radio,
  Disc,
  Circle,
  Layers,
  Minus,
  Lightbulb,
  Gauge,
  Link2,
  Power,
  Grip,
  Box
} from "lucide-react"

interface ShopByCategoriesProps {
  categories: ProductCategory[]
}



export default function ShopByCategories({ categories }: ShopByCategoriesProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 600
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount)
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth"
      })
    }
  }

  // Helper to get icon component
  const getIconComponent = (iconName: string | undefined | null) => {
    if (!iconName) return Box // Default icon

    // Map of available icons
    const iconMap: { [key: string]: any } = {
      Cpu,
      DoorOpen,
      Zap,
      Shield,
      Cable,
      ToggleLeft,
      Radio,
      Disc,
      Circle,
      Layers,
      Minus,
      Lightbulb,
      Gauge,
      Link2,
      Power,
      Grip,
      Box
    }

    return iconMap[iconName] || Box
  }

  if (!categories || categories.length === 0) {
    return null
  }

  // Split categories into two rows for the layout
  const midPoint = Math.ceil(categories.length / 2)
  const firstRow = categories.slice(0, midPoint)
  const secondRow = categories.slice(midPoint)

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Shop by Categories</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* 2-line horizontal scroll */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto overflow-y-hidden [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex flex-col gap-6 pb-2 min-w-full">
          {/* First Row */}
          <div className="flex gap-6">
            {firstRow.map((category) => {
              const IconComponent = getIconComponent(category.icon)
              const thumbnailSrc = category.thumbnail || category.thumbnail_image || category.image_url
              return (
                <LocalizedClientLink
                  key={category.id}
                  href={`/catalog?category=${category.slug}`}
                  className="flex flex-col gap-3 items-center min-w-[140px] group"
                >
                  <div className="w-28 h-28 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center group-hover:border-blue-500 transition-colors cursor-pointer shadow-sm overflow-hidden">
                    {/* Use thumbnail_image from database, fallback to icon */}
                    {thumbnailSrc ? (
                      <img src={thumbnailSrc} alt={category.name} className="w-full h-full object-cover" />
                    ) : (
                      <IconComponent className="w-12 h-12 text-blue-500" strokeWidth={1.5} />
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900 text-center line-clamp-2 w-[120px]">
                    {category.name}
                  </p>
                </LocalizedClientLink>
              )
            })}
          </div>

          {/* Second Row */}
          {secondRow.length > 0 && (
            <div className="flex gap-6">
              {secondRow.map((category) => {
                const IconComponent = getIconComponent(category.icon)
                const thumbnailSrc = category.thumbnail || category.thumbnail_image || category.image_url
                return (
                  <LocalizedClientLink
                    key={category.id}
                    href={`/catalog?category=${category.slug}`}
                    className="flex flex-col gap-3 items-center min-w-[140px] group"
                  >
                    <div className="w-28 h-28 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center group-hover:border-blue-500 transition-colors cursor-pointer shadow-sm overflow-hidden">
                      {/* Use thumbnail_image from database, fallback to icon */}
                      {thumbnailSrc ? (
                        <img src={thumbnailSrc} alt={category.name} className="w-full h-full object-cover" />
                      ) : (
                        <IconComponent className="w-12 h-12 text-blue-500" strokeWidth={1.5} />
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900 text-center line-clamp-2 w-[120px]">
                      {category.name}
                    </p>
                  </LocalizedClientLink>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

