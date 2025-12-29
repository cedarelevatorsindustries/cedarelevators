"use client"

import ProductCard from "@/components/ui/product-card"
import LocalizedClientLink from "@/components/ui/localized-client-link"
import { Heart, TrendingUp, Star, Sparkles, ThumbsUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { DisplayCollection } from "@/lib/types/display-collection"

interface DynamicCollectionSectionProps {
  collection: DisplayCollection
  className?: string
  variant?: "default" | "mobile"
}

/**
 * Icon Map - Maps collection icon types to Lucide React icons
 */
const iconMap = {
  heart: Heart,
  trending: TrendingUp,
  star: Star,
  new: Sparkles,
  recommended: ThumbsUp,
  none: null
}

/**
 * Dynamic Collection Section Component
 * 
 * This is a single, reusable component that renders any product collection
 * based on the data passed to it. It handles:
 * - Different layouts (grid-3, grid-4, grid-5, horizontal-scroll)
 * - Icons
 * - Empty states
 * - View All links
 * - Mobile vs Desktop variants
 * 
 * @param collection - The collection data object
 * @param className - Additional CSS classes
 * @param variant - Display variant (default or mobile)
 */
export default function DynamicCollectionSection({
  collection,
  className,
  variant = "default"
}: DynamicCollectionSectionProps) {
  // Don't render if collection is inactive or has no products (unless it has an empty state message)
  if (!collection.isActive) return null

  // Handle empty state
  if (collection.products.length === 0) {
    if (!collection.emptyStateMessage) return null

    return (
      <section className={cn("py-8", className)}>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">{collection.title}</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          {collection.icon && collection.icon !== "none" && (
            <div className="flex justify-center mb-4">
              {(() => {
                const Icon = iconMap[collection.icon as keyof typeof iconMap]
                return Icon ? <Icon className="w-12 h-12 text-gray-400" /> : null
              })()}
            </div>
          )}
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {collection.title}
          </h3>
          <p className="text-gray-600 mb-4">
            {collection.emptyStateMessage}
          </p>
          {collection.viewAllLink && (
            <LocalizedClientLink
              href={collection.viewAllLink}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Browse Products
            </LocalizedClientLink>
          )}
        </div>
      </section>
    )
  }

  // Mobile variant with horizontal scroll
  if (variant === "mobile") {
    const displayProducts = collection.products.slice(0, 5)

    return (
      <section className={cn("pt-4 bg-white", className)}>
        <div className="flex items-center justify-between mb-4 px-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900">{collection.title}</h2>
            {collection.icon && collection.icon !== "none" && (
              (() => {
                const Icon = iconMap[collection.icon as keyof typeof iconMap]
                return Icon ? <Icon className="w-5 h-5 text-gray-600" /> : null
              })()
            )}
          </div>
          {collection.showViewAll && (
            <LocalizedClientLink
              href={collection.viewAllLink}
              className="text-blue-600 text-sm font-medium"
            >
              View All →
            </LocalizedClientLink>
          )}
        </div>

        {/* Horizontal Scrollable Product Cards */}
        <div
          className="overflow-x-auto overflow-y-hidden [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex gap-3 px-4 pb-2">
            {displayProducts.map((product) => (
              <div key={product.id} className="w-[160px] flex-shrink-0">
                <ProductCard product={product} variant="mobile" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Desktop variant with different grid layouts
  const layout = collection.layout || "grid-5"

  // Determine grid classes based on layout
  const gridClasses = {
    "grid-3": "grid grid-cols-2 md:grid-cols-3 gap-4",
    "grid-4": "grid grid-cols-2 md:grid-cols-4 gap-4",
    "grid-5": "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4",
    "horizontal-scroll": "flex overflow-x-auto gap-4 pb-2",
    "special": "grid grid-cols-2 md:grid-cols-4 gap-4" // Special variant for full image display
  }

  // Determine how many products to display
  const displayCount = layout === "grid-4" ? 4 : 5
  const displayProducts = collection.products.slice(0, displayCount)

  // Determine if we should use special variant for ProductCard
  const cardVariant = collection.metadata?.variant === "special" ? "special" : undefined

  return (
    <section className={cn("py-8", className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold text-gray-900">{collection.title}</h2>
          {collection.icon && collection.icon !== "none" && (
            (() => {
              const Icon = iconMap[collection.icon as keyof typeof iconMap]
              if (!Icon) return null

              // Special styling for trending icon
              if (collection.icon === "trending") {
                return <Icon className="w-6 h-6 text-green-600" />
              }

              return <Icon className="w-6 h-6 text-gray-600" />
            })()
          )}
        </div>
        {collection.showViewAll && (
          <LocalizedClientLink
            href={collection.viewAllLink}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All →
          </LocalizedClientLink>
        )}
      </div>

      {collection.description && (
        <p className="text-gray-600 mb-4">{collection.description}</p>
      )}

      <div className={gridClasses[layout as keyof typeof gridClasses] || gridClasses["grid-5"]}>
        {displayProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            variant={cardVariant}
          />
        ))}
      </div>
    </section>
  )
}
