"use client"

import { ArrowRight } from "lucide-react"
import LocalizedClientLink from "@components/ui/localized-client-link"
import type { ElevatorType } from "@/lib/data/elevator-types"

interface ShopByElevatorTypeProps {
  elevatorTypes?: ElevatorType[]
}

export default function ShopByElevatorType({ elevatorTypes = [] }: ShopByElevatorTypeProps) {
  // Don't render if no elevator types
  if (elevatorTypes.length === 0) return null

  return (
    <section>
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Shop by Elevator Type
        </h2>
        <p className="text-gray-600 text-sm">
          Browse our premium elevator selection organized by elevator type
        </p>
      </div>

      {/* Elevator Types Grid - Square Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {elevatorTypes.map((type) => (
          <div key={type.id} className="flex flex-col">
            {/* Mobile: Title and Description Outside Card */}
            <div className="md:hidden mb-2">
              <h3 className="text-base font-bold text-gray-900 mb-1">
                {type.name}
              </h3>
              <p className="text-gray-600 text-xs leading-relaxed">
                {type.description}
              </p>
            </div>

            <LocalizedClientLink
              href={`/catalog?application=${type.slug}`}
              className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 aspect-square"
            >
              {/* Background Image */}
              <div className="absolute inset-0 bg-gray-200">
                {type.thumbnail_image ? (
                  <img
                    src={type.thumbnail_image}
                    alt={type.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100" />
                )}

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 transition-all duration-300" />
              </div>

              {/* Content Overlay - Desktop Only */}
              <div className="hidden md:block absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="text-base font-bold mb-1 group-hover:text-blue-300 transition-colors line-clamp-2">
                  {type.name}
                </h3>
                <p className="text-gray-200 text-xs mb-2 leading-relaxed line-clamp-2">
                  {type.description}
                </p>

                {/* CTA Button */}
                <div className="flex items-center text-blue-300 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="mr-1">Shop Now</span>
                  <ArrowRight size={14} />
                </div>
              </div>

              {/* Mobile: Shop Now Button */}
              <div className="md:hidden absolute bottom-0 left-0 right-0 p-3">
                <div className="flex items-center justify-center text-white font-medium text-sm bg-blue-600/90 rounded-lg py-2">
                  <span className="mr-1">Shop Now</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </LocalizedClientLink>
          </div>
        ))}
      </div>
    </section>
  )
}

