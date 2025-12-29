"use client"

import { ArrowRight } from "lucide-react"
import LocalizedClientLink from "@components/ui/localized-client-link"

// Static elevator type categories for marketing purposes
// These are use cases, not product categories from backend
const elevatorTypes = [
  {
    id: "residential-elevators",
    title: "Build Your Dream House Elevator",
    description: "Premium components for luxury residential installations",
    image: "/images/image.png",
    href: "/catalog?application=residential"
  },
  {
    id: "commercial-buildings",
    title: "Power Commercial Projects",
    description: "High-capacity systems for office buildings and complexes",
    image: "/images/image.png",
    href: "/catalog?application=commercial"
  },
  {
    id: "hospital-elevators",
    title: "Medical-Grade Elevator Systems",
    description: "Reliable, safe components for healthcare facilities",
    image: "/images/image.png",
    href: "/catalog?application=hospital"
  },
  {
    id: "freight-elevators",
    title: "Heavy-Duty Freight Solutions",
    description: "Industrial-strength components for cargo transport",
    image: "/images/image.png",
    href: "/catalog?application=freight"
  },
  {
    id: "modernization",
    title: "Modernize Existing Elevators",
    description: "Upgrade old systems with latest technology",
    image: "/images/image.png",
    href: "/catalog?application=modernization"
  },
  {
    id: "luxury-elevators",
    title: "Luxury Custom Installations",
    description: "Premium finishes and advanced features for high-end projects",
    image: "/images/image.png",
    href: "/catalog?application=luxury"
  }
]

export default function ElevatorTypesMobile() {
  return (
    <section className="bg-white py-6">
      <div className="px-4">
        {/* Section Header */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            Shop by Elevator Type
          </h2>
          <p className="text-gray-600 text-xs">
            Browse our premium elevator selection organized by elevator type
          </p>
        </div>

        {/* Elevator Types Grid - Vertical Cards */}
        <div className="grid grid-cols-2 gap-3">
          {elevatorTypes.map((type) => (
            <div key={type.id} className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
              {/* Image */}
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={type.image}
                  alt={type.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-3 flex flex-col gap-2">
                {/* Title */}
                <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight">
                  {type.title}
                </h3>

                {/* Description - Single line truncate */}
                <p className="text-gray-600 text-[10px] leading-relaxed truncate">
                  {type.description}
                </p>

                {/* Shop Now Button */}
                <LocalizedClientLink
                  href={type.href}
                  className="flex items-center justify-center text-white font-medium text-xs bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md py-2 transition-colors"
                >
                  <span className="mr-1">Shop Now</span>
                  <ArrowRight size={12} />
                </LocalizedClientLink>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
