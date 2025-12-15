"use client"

import { ArrowRight } from "lucide-react"
import LocalizedClientLink from "@components/ui/localized-client-link"

interface ShopByApplicationSectionProps {
  hasProducts: boolean
}

// Static application categories for marketing purposes
// These are use cases, not product categories from backend
const applications = [
  {
    id: "residential-elevators",
    title: "Build Your Dream Home Elevator",
    description: "Premium components for luxury residential installations",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop&crop=center",
    href: "/catalog?application=residential"
  },
  {
    id: "commercial-buildings",
    title: "Power Commercial Projects",
    description: "High-capacity systems for office buildings and complexes",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&crop=center",
    href: "/catalog?application=commercial"
  },
  {
    id: "hospital-elevators",
    title: "Medical-Grade Elevator Systems",
    description: "Reliable, safe components for healthcare facilities",
    image: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800&h=600&fit=crop&crop=center",
    href: "/catalog?application=hospital"
  },
  {
    id: "freight-elevators",
    title: "Heavy-Duty Freight Solutions",
    description: "Industrial-strength components for cargo transport",
    image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&h=600&fit=crop&crop=center",
    href: "/catalog?application=freight"
  },
  {
    id: "modernization",
    title: "Modernize Existing Elevators",
    description: "Upgrade old systems with latest technology",
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop&crop=center",
    href: "/catalog?application=modernization"
  },
  {
    id: "luxury-elevators",
    title: "Luxury Custom Installations",
    description: "Premium finishes and advanced features for high-end projects",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop&crop=center",
    href: "/catalog?application=luxury"
  }
]

export default function ShopByApplicationSection({ hasProducts }: ShopByApplicationSectionProps) {
  // Don't render if no products in backend
  if (!hasProducts) {
    return null
  }

  return (
    <section className="bg-white py-8">
      <div className="px-12">
        {/* Section Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Shop by Application
          </h2>
          <p className="text-gray-600 text-sm">
            Browse our premium elevator selection organized by common building projects
          </p>
        </div>

        {/* Applications Grid - Square Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {applications.map((app) => (
            <LocalizedClientLink
              key={app.id}
              href={app.href}
              className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 aspect-square"
            >
              {/* Background Image */}
              <div className="absolute inset-0 bg-gray-200">
                <img
                  src={app.image}
                  alt={app.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 transition-all duration-300" />
              </div>

              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="text-base font-bold mb-1 group-hover:text-blue-300 transition-colors line-clamp-2">
                  {app.title}
                </h3>
                <p className="text-gray-200 text-xs mb-2 leading-relaxed line-clamp-2">
                  {app.description}
                </p>
                
                {/* CTA Button */}
                <div className="flex items-center text-blue-300 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="mr-1">Shop Now</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </LocalizedClientLink>
          ))}
        </div>
      </div>
    </section>
  )
}
