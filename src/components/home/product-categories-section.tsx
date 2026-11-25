"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { ProductCategory } from "@/lib/types/domain"

interface ProductCategoriesSectionProps {
  categories?: ProductCategory[]
}

const DEFAULT_CATEGORIES = [
  {
    name: "Electrical Components",
    slug: "electrical-components",
    description: "Sensors, cables, limit switches, and control panel wiring components.",
    image: "https://res.cloudinary.com/dfjmqeigc/image/upload/v1768828831/cedar/categories/zib9qk6xnofojfjzw0sn.png"
  },
  {
    name: "Safety Components",
    slug: "safety-components",
    description: "Emergency alarms, interlocks, pit switches, and critical safety devices.",
    image: "https://res.cloudinary.com/dfjmqeigc/image/upload/v1769063998/cedar/categories/kmrhstxlsyq3kroka4sb.png"
  },
  {
    name: "Mechanical Components",
    slug: "mechanical-components",
    description: "Guide shoes, liners, door rollers, and structural elevator hardware.",
    image: "https://res.cloudinary.com/dfjmqeigc/image/upload/v1769064074/cedar/categories/ahn7uom9inr7xfuts6bt.png"
  },
  {
    name: "Door Systems",
    slug: "door-systems",
    description: "Operators, headers, hangers, and landing door components.",
    image: null
  },
  {
    name: "Traction Machines",
    slug: "traction-machines",
    description: "Geared and gearless traction drives, motors, and pulleys.",
    image: null
  },
  {
    name: "Cabin & Car",
    slug: "cabin-interior",
    description: "Handrails, car operating panels, ceilings, and flooring.",
    image: null
  }
]

export function ProductCategoriesSection({ categories = [] }: ProductCategoriesSectionProps) {
  // Map categories from props if available, or fall back to default list
  const items = categories && categories.length > 0
    ? categories.map((cat) => {
        const name = cat.name || "Category"
        const slug = cat.handle || cat.slug || "category"
        const image = (cat as any).thumbnail || (cat as any).thumbnail_image || (cat as any).image_url || null
        return { name, slug, image }
      })
    : DEFAULT_CATEGORIES

  return (
    <section className="w-full py-8 sm:py-14 bg-white">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12">
        {/* Section Header with Blue & Orange Theme */}
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <div>
            <h2 className="type-section text-zinc-900">
              Browse Product Categories
            </h2>
            <p className="type-body-sm text-zinc-600 mt-1 hidden sm:block">
              Explore precision engineering components organized by functional family.
            </p>
          </div>
          <Link
            href="/categories"
            className="type-nav inline-flex items-center gap-1 text-orange-600 hover:text-blue-600 transition-colors"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Link>
        </div>

        {/* Categories Flex List - Horizontal Scroll (3 in a row) on Mobile, Wrapped on Desktop */}
        <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-4 pb-2 sm:flex-wrap sm:overflow-visible sm:pb-0 items-start justify-start sm:gap-10 md:gap-12 lg:gap-16">
          {items.map((cat) => {
            const firstLetter = (cat.name || "C").trim().charAt(0).toUpperCase()

            return (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="flex flex-col items-center text-center shrink-0 w-[calc((100%-2rem)/3)] min-w-[96px] sm:w-auto sm:min-w-0"
              >
                {/* Guaranteed 1:1 Geometric Circle Frame */}
                <div
                  className="w-20 h-20 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-48 lg:h-48 xl:w-52 xl:h-52 aspect-square rounded-full bg-white border-2 border-zinc-200 flex items-center justify-center overflow-hidden relative shrink-0 shadow-xs mb-2 sm:mb-3.5"
                  style={{
                    aspectRatio: "1 / 1",
                  }}
                >
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-12 h-12 sm:w-22 sm:h-22 md:w-28 md:h-28 lg:w-32 lg:h-32 object-contain pointer-events-none"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100/70 flex items-center justify-center">
                      <span className="text-2xl sm:text-4xl md:text-5xl font-light text-blue-600 uppercase select-none">
                        {firstLetter}
                      </span>
                    </div>
                  )}
                </div>

                {/* Category Name - Single line on mobile, 2 lines max on desktop */}
                <h3 className="type-product text-xs sm:text-base text-zinc-900 truncate w-full sm:w-auto sm:whitespace-normal sm:line-clamp-2 sm:max-w-[160px] text-center">
                  {cat.name}
                </h3>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ProductCategoriesSection
