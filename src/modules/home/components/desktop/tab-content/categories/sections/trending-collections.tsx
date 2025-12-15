"use client"

import ProductCard from "@/components/ui/product-card"
import LocalizedClientLink from "@components/ui/localized-client-link"
import { TrendingUp } from "lucide-react"

// Demo products for trending collections
const trendingProducts = [
  {
    id: "1",
    title: "Smart Control Panel Pro",
    description: "IoT-enabled control system with touchscreen interface",
    handle: "smart-control-panel-pro",
    thumbnail: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=800&h=800&fit=crop",
    variants: [{ calculated_price: { calculated_amount: 45000 } }],
    metadata: { category: "Control Panels" }
  },
  {
    id: "2",
    title: "Energy Efficient Motor",
    description: "Variable frequency drive motor for reduced power consumption",
    handle: "energy-efficient-motor",
    thumbnail: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=800&fit=crop",
    variants: [{ calculated_price: { calculated_amount: 32000 } }],
    metadata: { category: "Motors & Drives" }
  },
  {
    id: "3",
    title: "Hospital Grade Door System",
    description: "Medical facility certified automatic door operator",
    handle: "hospital-grade-door-system",
    thumbnail: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&h=800&fit=crop",
    variants: [{ calculated_price: { calculated_amount: 28000 } }],
    metadata: { category: "Door Systems" }
  },
  {
    id: "4",
    title: "Heavy Duty Cable Set",
    description: "Industrial strength steel cables for freight elevators",
    handle: "heavy-duty-cable-set",
    thumbnail: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop",
    variants: [{ calculated_price: { calculated_amount: 15000 } }],
    metadata: { category: "Cables & Wiring" }
  }
]

export default function TrendingCollections() {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold text-gray-900">Trending Collections</h2>
          <TrendingUp className="w-6 h-6 text-green-600" />
        </div>
        <LocalizedClientLink
          href="/products?sort=trending"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View All →
        </LocalizedClientLink>
      </div>
      
      {/* 4 products in a row with special variant */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {trendingProducts.map((product) => (
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
