"use client"

import {
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

interface CategoriesMobileProps {
  categories?: any[]
}

export default function CategoriesMobile({ categories: propCategories }: CategoriesMobileProps) {
  const displayCategories = propCategories || categories
  
  return (
    <section className="py-6 bg-white px-4">
      <div className="flex items-center justify-between pb-3">
        <h2 className="text-[#181411] text-lg font-bold leading-tight tracking-[-0.015em]">
          Find the parts you need
        </h2>
      </div>
      
      <div 
        className="overflow-x-auto overflow-y-hidden [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex items-stretch gap-4 pb-2">
          {displayCategories.map((category) => {
            const IconComponent = category.icon
            if (!IconComponent) return null
            
            return (
              <a
                key={category.name}
                href={category.href}
                className="flex flex-col gap-2 items-center min-w-[100px] group"
              >
                <div className="w-20 h-20 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center group-hover:border-blue-500 transition-colors cursor-pointer">
                  <IconComponent className="w-9 h-9 text-blue-500" strokeWidth={1.5} />
                </div>
                <p className="text-[#181411] text-xs font-medium leading-normal text-center">
                  {category.name}
                </p>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
