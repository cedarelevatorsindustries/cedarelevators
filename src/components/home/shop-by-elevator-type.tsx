"use client"

import { useRef } from "react"
import Link from "next/link"
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react"
import type { ElevatorType } from "@/lib/data/elevator-types"

interface ShopByElevatorTypeProps {
  elevatorTypes?: ElevatorType[]
}

const DEFAULT_ELEVATOR_TYPES = [
  {
    title: "Passenger Elevators",
    slug: "passenger-elevator",
    description: "Components engineered for passenger elevators in residential and commercial buildings.",
    image: "https://res.cloudinary.com/dfjmqeigc/image/upload/v1769065096/cedar/elevator-types/k3ov43x6k72s2u5d0jft.jpg"
  },
  {
    title: "Freight Elevators",
    slug: "goods-elevator",
    description: "Heavy-duty parts for goods and cargo transportation lifts.",
    image: "https://res.cloudinary.com/dfjmqeigc/image/upload/v1769065135/cedar/elevator-types/l9e4k1jymw7ff1x2cclq.jpg"
  },
  {
    title: "Home Elevators",
    slug: "home-elevator",
    description: "Compact systems and components for residential villa lifts.",
    image: "https://res.cloudinary.com/dfjmqeigc/image/upload/v1769065174/cedar/elevator-types/bvh3h807r9wz952hyh7l.jpg"
  },
  {
    title: "Commercial Elevators",
    slug: "commercial-elevator",
    description: "High-traffic systems for commercial complexes.",
    image: "https://res.cloudinary.com/dfjmqeigc/image/upload/v1769065211/cedar/elevator-types/l2aitcwq9bgdjrijaimb.jpg"
  }
]

export function ShopByElevatorType({ elevatorTypes = [] }: ShopByElevatorTypeProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const items = elevatorTypes && elevatorTypes.length > 0
    ? elevatorTypes.map((t) => ({
        title: t.title,
        slug: t.slug,
        description: t.description || t.subtitle || `Solutions for ${t.title.toLowerCase()}.`,
        image:
          t.thumbnail_image ||
          t.banner_image ||
          DEFAULT_ELEVATOR_TYPES.find((d) => d.slug === t.slug)?.image ||
          DEFAULT_ELEVATOR_TYPES[0].image
      }))
    : DEFAULT_ELEVATOR_TYPES

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -340 : 340
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <section id="elevator-types" className="w-full py-8 sm:py-16 bg-zinc-50">
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Section Header with Blue & Orange Theme */}
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-blue-600">
              System Classification
            </span>
            <h2 className="text-xl sm:text-3xl font-semibold text-zinc-900 tracking-tight mt-0.5 sm:mt-1">
              Shop by Elevator Type
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 mt-0.5 sm:mt-1 hidden sm:block">
              Solutions categorized by elevator structure and usage profile.
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-orange-600 hover:text-blue-600 transition-colors"
            >
              <span>All Types</span>
              <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>

            {/* Desktop scroll navigation arrows */}
            <div className="hidden sm:flex items-center gap-1.5 ml-2">
              <button
                type="button"
                onClick={() => scroll("left")}
                aria-label="Scroll left"
                className="w-8 h-8 rounded-full border border-zinc-200 bg-white hover:bg-zinc-100 flex items-center justify-center text-zinc-700 transition-colors shadow-2xs hover:border-zinc-300 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                aria-label="Scroll right"
                className="w-8 h-8 rounded-full border border-zinc-200 bg-white hover:bg-zinc-100 flex items-center justify-center text-zinc-700 transition-colors shadow-2xs hover:border-zinc-300 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Scroll Track */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3 sm:gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory no-scrollbar scroll-smooth -mx-3 px-3 sm:mx-0 sm:px-0"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {items.map((type) => (
            <Link
              key={type.slug}
              href={`/catalog?type=${type.slug}`}
              className="group relative rounded-xl overflow-hidden border border-zinc-200 shadow-xs hover:shadow-lg hover:border-blue-300 transition-all duration-300 w-[78vw] sm:w-[300px] md:w-[320px] lg:w-[340px] flex-shrink-0 snap-start aspect-[4/3] flex flex-col justify-end p-3.5 sm:p-5"
            >
              {/* Image */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${type.image})` }}
              />

              {/* Darkened Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10 transition-opacity group-hover:from-black/90" />

              {/* Content */}
              <div className="relative z-10 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-lg font-semibold tracking-tight text-white group-hover:text-orange-300 transition-colors line-clamp-1">
                    {type.title}
                  </h3>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white group-hover:bg-blue-600 transition-colors flex-shrink-0 ml-1">
                    <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                </div>
                <p className="text-[11px] sm:text-xs text-zinc-300 mt-1 font-normal line-clamp-2">
                  {type.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ShopByElevatorType
