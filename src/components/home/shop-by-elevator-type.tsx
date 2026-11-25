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
    <section id="elevator-types" className="w-full py-10 sm:py-16 bg-white">
      <style>{`
        .elevator-scroll-track {
          scroll-padding-left: 0.75rem;
        }
        .elevator-type-card {
          flex: 0 0 74vw;
        }
        .elevator-type-card:first-child {
          margin-left: 0.75rem;
        }
        .elevator-type-card:last-child {
          margin-right: 0.75rem;
        }
        @media (min-width: 640px) {
          .elevator-scroll-track {
            scroll-padding-left: 1rem;
          }
          .elevator-type-card {
            flex: 0 0 260px;
          }
          .elevator-type-card:first-child {
            margin-left: 1rem;
          }
          .elevator-type-card:last-child {
            margin-right: 1rem;
          }
        }
        @media (min-width: 768px) {
          .elevator-scroll-track {
            scroll-padding-left: 1.5rem;
          }
          .elevator-type-card {
            flex: 0 0 calc((100% - 2.5rem) / 2.4);
          }
          .elevator-type-card:first-child {
            margin-left: 1.5rem;
          }
          .elevator-type-card:last-child {
            margin-right: 1.5rem;
          }
        }
        @media (min-width: 1024px) {
          .elevator-scroll-track {
            scroll-padding-left: 2rem;
          }
          .elevator-type-card {
            flex: 0 0 calc((100% - 4.5rem) / 3.35);
          }
          .elevator-type-card:first-child {
            margin-left: 2rem;
          }
          .elevator-type-card:last-child {
            margin-right: 2rem;
          }
        }
      `}</style>
      <div className="w-full">
        {/* Section Header (aligned with Shop by Application: px-3 sm:px-4 md:px-6 lg:px-8) */}
        <div className="flex items-end justify-between gap-4 mb-7 sm:mb-9 px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="max-w-xl text-left">
            <h2 className="type-section text-zinc-900">
              Shop by Elevator Type
            </h2>
            <p className="type-body-sm text-zinc-600 mt-1.5 hidden sm:block">
              Solutions categorized by elevator structure and usage profile.
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Desktop scroll navigation arrows */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scroll("left")}
                aria-label="Scroll left"
                className="w-9 h-9 rounded-full border border-zinc-200 bg-white hover:bg-zinc-100 flex items-center justify-center text-zinc-700 transition-colors shadow-2xs hover:border-zinc-300 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                aria-label="Scroll right"
                className="w-9 h-9 rounded-full border border-zinc-200 bg-white hover:bg-zinc-100 flex items-center justify-center text-zinc-700 transition-colors shadow-2xs hover:border-zinc-300 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Full-Bleed Horizontal Scroll Track - Left padding in initial state, bleeds smoothly at screen edges */}
        <div
          ref={scrollContainerRef}
          className="elevator-scroll-track flex gap-3 sm:gap-5 lg:gap-6 overflow-x-auto pb-2 pt-1 snap-x snap-mandatory no-scrollbar scroll-smooth"
          style={{
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none"
          }}
        >
          {items.map((type) => (
            <Link
              key={type.slug}
              href={`/products?type=${type.slug}`}
              className="elevator-type-card relative rounded-xl overflow-hidden border border-zinc-200 shadow-xs snap-start aspect-[4/3] flex flex-col justify-end p-4 sm:p-5"
            >
              {/* Image */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${type.image})` }}
              />

              {/* Darkened Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />

              {/* Content: 75% Left (Title + Description) | 25% Right (Button) */}
              <div className="relative z-10 text-white text-left flex items-end justify-between gap-2 w-full">
                <div className="w-[75%] min-w-0">
                  <h3 className="text-base sm:text-lg font-normal tracking-tight text-white line-clamp-1">
                    {type.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-zinc-200 mt-1.5 font-normal line-clamp-2 leading-relaxed">
                    {type.description}
                  </p>
                </div>
                <div className="w-[25%] flex items-end justify-end flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ShopByElevatorType
