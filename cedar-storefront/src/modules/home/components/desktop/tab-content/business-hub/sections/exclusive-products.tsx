"use client"

import ProductCard from "@/components/ui/product-card"
import { demoProducts } from "@/lib/data/demo-data"
import LocalizedClientLink from "@components/ui/localized-client-link"

export default function ExclusiveProducts() {
  const exclusiveProducts = demoProducts.slice(0, 4)

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Exclusive to Business</h2>
          <p className="text-gray-600 mt-1">Premium products available only for verified business accounts</p>
        </div>
        <LocalizedClientLink
          href="/business/exclusive-products"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View All →
        </LocalizedClientLink>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {exclusiveProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
