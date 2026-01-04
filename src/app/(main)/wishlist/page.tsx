"use client"

import { useWishlist } from "@/lib/hooks"
import ProductCard from "@/components/ui/product-card"
import { Heart, ShoppingBag, LoaderCircle } from "lucide-react"
import Link from "next/link"

export default function WishlistPage() {
  const { items, count, isLoading, removeItem } = useWishlist()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoaderCircle className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    )
  }

  if (count === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Your Wishlist is Empty
            </h1>
            <p className="text-gray-600 mb-8">
              Save your favorite products to your wishlist and shop them later.
            </p>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Wishlist
          </h1>
          <p className="text-gray-600">
            {count} {count === 1 ? "item" : "items"} saved
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map((item) => {
            // Convert wishlist item to product format for ProductCard
            const product = {
              id: item.product_id,
              title: item.title,
              thumbnail: item.thumbnail,
              variants: [
                {
                  id: item.variant_id,
                  calculated_price: {
                    calculated_amount: item.price,
                  },
                },
              ],
            }

            return (
              <ProductCard
                key={item.id}
                product={product as any}
                variant="default"
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

