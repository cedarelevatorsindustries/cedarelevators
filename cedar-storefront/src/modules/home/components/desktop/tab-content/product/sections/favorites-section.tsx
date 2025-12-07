"use client"

import { HttpTypes } from "@medusajs/types"
import ProductCard from "@/components/ui/product-card"
import LocalizedClientLink from "@components/ui/localized-client-link"
import { Heart } from "lucide-react"

interface FavoritesSectionProps {
  products: HttpTypes.StoreProduct[]
}

export default function FavoritesSection({ products }: FavoritesSectionProps) {
  const favoriteProducts = products.slice(0, 5)
  
  if (favoriteProducts.length === 0) {
    return (
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Favorites</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
          <p className="text-gray-600 mb-4">
            Start adding products to your wishlist to see them here
          </p>
          <LocalizedClientLink
            href="/catalog"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Browse Products
          </LocalizedClientLink>
        </div>
      </section>
    )
  }
  
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Your Favorites</h2>
        <LocalizedClientLink
          href="/wishlist?from=favorites"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View All →
        </LocalizedClientLink>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {favoriteProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
