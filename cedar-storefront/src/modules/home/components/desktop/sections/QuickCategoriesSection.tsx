"use client"

import { useRef } from "react"
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

const categories = [
  {
    name: "Control Panels",
    icon: Cpu,
    href: "/categories/control-panels"
  },
  {
    name: "Doors",
    icon: DoorOpen,
    href: "/categories/doors"
  },
  {
    name: "Motors",
    icon: Zap,
    href: "/categories/motors"
  },
  {
    name: "Safety Devices",
    icon: Shield,
    href: "/categories/safety-devices"
  },
  {
    name: "Cables & Wiring",
    icon: Cable,
    href: "/categories/cables"
  },
  {
    name: "Buttons & Fixtures",
    icon: ToggleLeft,
    href: "/categories/buttons"
  },
  {
    name: "Sensors",
    icon: Radio,
    href: "/categories/sensors"
  },
  {
    name: "Brakes",
    icon: Disc,
    href: "/categories/brakes"
  },
  {
    name: "Pulleys & Sheaves",
    icon: Circle,
    href: "/categories/pulleys"
  },
  {
    name: "Guides & Rails",
    icon: Layers,
    href: "/categories/guides"
  },
  {
    name: "Buffers",
    icon: Minus,
    href: "/categories/buffers"
  },
  {
    name: "Indicators",
    icon: Lightbulb,
    href: "/categories/indicators"
  },
  {
    name: "Governors",
    icon: Gauge,
    href: "/categories/governors"
  },
  {
    name: "Ropes & Chains",
    icon: Link2,
    href: "/categories/ropes"
  },
  {
    name: "Inverters",
    icon: Power,
    href: "/categories/inverters"
  },
  {
    name: "Handrails",
    icon: Grip,
    href: "/categories/handrails"
  }
]

const QuickCategoriesSection = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400
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
    <div className="px-12 md:px-12">
      <div className="flex items-center justify-between pb-3 pt-5">
        <h2 className="text-[#181411] text-[22px] font-bold leading-tight tracking-[-0.015em]">
          Find the parts you need
        </h2>
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
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto overflow-y-hidden [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex items-stretch gap-6 pb-2">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <a
                key={category.name}
                href={category.href}
                className="flex flex-col gap-3 items-center min-w-[140px] group"
              >
                <div className="w-28 h-28 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center group-hover:border-blue-500 transition-colors cursor-pointer">
                  <IconComponent className="w-12 h-12 text-blue-500" strokeWidth={1.5} />
                </div>
                <p className="text-[#181411] text-sm font-medium leading-normal text-center">
                  {category.name}
                </p>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default QuickCategoriesSection
