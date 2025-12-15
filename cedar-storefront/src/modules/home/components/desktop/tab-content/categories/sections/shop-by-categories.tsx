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
  Grip
} from "lucide-react"

interface ShopByCategoriesProps {
  categories: ProductCategory[]
}

// Component categories (not lift types)
const componentCategories = [
  { name: "Control Panels", icon: Cpu, handle: "control-panels" },
  { name: "Door Systems", icon: DoorOpen, handle: "door-systems" },
  { name: "Motors & Drives", icon: Zap, handle: "motors-drives" },
  { name: "Safety Devices", icon: Shield, handle: "safety-devices" },
  { name: "Cables & Wiring", icon: Cable, handle: "cables-wiring" },
  { name: "Buttons & Fixtures", icon: ToggleLeft, handle: "buttons-fixtures" },
  { name: "Sensors", icon: Radio, handle: "sensors" },
  { name: "Brakes", icon: Disc, handle: "brakes" },
  { name: "Pulleys & Sheaves", icon: Circle, handle: "pulleys-sheaves" },
  { name: "Guide Rails", icon: Layers, handle: "guide-rails" },
  { name: "Buffers", icon: Minus, handle: "buffers" },
  { name: "Indicators", icon: Lightbulb, handle: "indicators" },
  { name: "Governors", icon: Gauge, handle: "governors" },
  { name: "Ropes & Chains", icon: Link2, handle: "ropes-chains" },
  { name: "Inverters", icon: Power, handle: "inverters" },
  { name: "Handrails", icon: Grip, handle: "handrails" }
]

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

      {/* 2-line horizontal scroll - 8 categories per row */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto overflow-y-hidden [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex flex-col gap-6 pb-2">
          {/* First Row - 8 categories */}
          <div className="flex gap-6">
            {componentCategories.slice(0, 8).map((category) => {
              const IconComponent = category.icon
              return (
                <LocalizedClientLink
                  key={category.handle}
                  href={`/categories/${category.handle}`}
                  className="flex flex-col gap-3 items-center min-w-[140px] group"
                >
                  <div className="w-28 h-28 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center group-hover:border-blue-500 transition-colors cursor-pointer shadow-sm">
                    <IconComponent className="w-12 h-12 text-blue-500" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-medium text-gray-900 text-center line-clamp-2">
                    {category.name}
                  </p>
                </LocalizedClientLink>
              )
            })}
          </div>

          {/* Second Row - 8 categories */}
          <div className="flex gap-6">
            {componentCategories.slice(8, 16).map((category) => {
              const IconComponent = category.icon
              return (
                <LocalizedClientLink
                  key={category.handle}
                  href={`/categories/${category.handle}`}
                  className="flex flex-col gap-3 items-center min-w-[140px] group"
                >
                  <div className="w-28 h-28 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center group-hover:border-blue-500 transition-colors cursor-pointer shadow-sm">
                    <IconComponent className="w-12 h-12 text-blue-500" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-medium text-gray-900 text-center line-clamp-2">
                    {category.name}
                  </p>
                </LocalizedClientLink>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
