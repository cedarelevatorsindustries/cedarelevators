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
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-blue-600">
              Component Families
            </span>
            <h2 className="text-xl sm:text-3xl font-semibold text-zinc-900 tracking-tight mt-0.5 sm:mt-1">
              Browse Product Categories
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 mt-0.5 sm:mt-1 hidden sm:block">
              Explore precision engineering components organized by functional family.
            </p>
          </div>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-orange-600 hover:text-blue-600 transition-colors"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Link>
        </div>

        {/* Categories Flex List - Left Aligned with Guaranteed Geometric Circle */}
        <div className="flex flex-wrap items-start justify-start gap-8 sm:gap-10 lg:gap-14">
          {items.map((cat) => {
            const firstLetter = (cat.name || "C").trim().charAt(0).toUpperCase()

            return (
              <Link
                key={cat.slug}
                href={`/catalog?category=${cat.slug}`}
                className="group flex flex-col items-center text-center transition-transform hover:-translate-y-1 duration-200"
              >
                {/* Guaranteed 1:1 Geometric Circle Frame */}
                <div
                  className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full bg-white border-2 border-zinc-200 group-hover:border-blue-600 group-hover:shadow-md flex items-center justify-center overflow-hidden transition-all duration-300 relative shrink-0 shadow-2xs mb-3"
                  style={{
                    aspectRatio: "1 / 1",
                    borderRadius: "9999px",
                  }}
                >
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain group-hover:scale-110 transition-transform duration-300 pointer-events-none"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100/70 flex items-center justify-center">
                      <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-600 group-hover:text-orange-600 uppercase select-none transition-colors">
                        {firstLetter}
                      </span>
                    </div>
                  )}
                </div>

                {/* Category Name */}
                <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight max-w-[150px] text-center">
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
