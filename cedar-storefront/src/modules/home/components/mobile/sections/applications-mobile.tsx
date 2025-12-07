"use client"

import { ArrowRight } from "lucide-react"
import LocalizedClientLink from "@components/ui/localized-client-link"

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

export default function ApplicationsMobile() {
  return (
    <section className="bg-white py-6">
      <div className="px-4">
        {/* Section Header */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            Shop by Application
          </h2>
          <p className="text-gray-600 text-xs">
            Browse our premium elevator selection organized by common building projects
          </p>
        </div>

        {/* Applications Grid - Vertical Cards */}
        <div className="grid grid-cols-2 gap-3">
          {applications.map((app) => (
            <div key={app.id} className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
              {/* Image */}
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={app.image}
                  alt={app.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-3 flex flex-col gap-2">
                {/* Title */}
                <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight">
                  {app.title}
                </h3>
                
                {/* Description - Single line truncate */}
                <p className="text-gray-600 text-[10px] leading-relaxed truncate">
                  {app.description}
                </p>
                
                {/* Shop Now Button */}
                <LocalizedClientLink
                  href={app.href}
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
