"use client"

import ProductCard from "@/components/ui/product-card"
import LocalizedClientLink from "@components/ui/localized-client-link"
import { Star } from "lucide-react"

// Demo products from top application categories
const topApplicationProducts = [
  {
    id: "5",
    title: "Commercial High-Speed Motor",
    description: "Gearless traction motor for high-rise buildings",
    handle: "commercial-high-speed-motor",
    thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=800&fit=crop",
    variants: [{ calculated_price: { calculated_amount: 85000 } }],
    metadata: { category: "Commercial" }
  },
  {
    id: "6",
    title: "Residential Door Operator",
    description: "Quiet and smooth door system for luxury apartments",
    handle: "residential-door-operator",
    thumbnail: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=800&fit=crop",
    variants: [{ calculated_price: { calculated_amount: 22000 } }],
    metadata: { category: "Residential" }
  },
  {
    id: "7",
    title: "Hospital Emergency System",
    description: "Battery backup control panel for medical facilities",
    handle: "hospital-emergency-system",
    thumbnail: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=800&fit=crop",
    variants: [{ calculated_price: { calculated_amount: 65000 } }],
    metadata: { category: "Healthcare" }
  },
  {
    id: "8",
    title: "Industrial Freight Brake",
    description: "Heavy-duty electromagnetic brake for cargo lifts",
    handle: "industrial-freight-brake",
    thumbnail: "https://images.unsplash.com/photo-1565610222536-ef125c59da2e?w=800&h=800&fit=crop",
    variants: [{ calculated_price: { calculated_amount: 38000 } }],
    metadata: { category: "Industrial" }
  }
]

export default function TopApplications() {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold text-gray-900">Top Applications</h2>
        </div>
        <LocalizedClientLink
          href="/applications"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View All →
        </LocalizedClientLink>
      </div>
      
      {/* 4 products in a row with special variant */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {topApplicationProducts.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product as any} 
            variant="special"
          />
        ))}
      </div>
    </section>
  )
}
