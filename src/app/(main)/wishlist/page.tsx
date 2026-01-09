"use client"

import { useWishlist } from "@/lib/hooks"
import ProductCard from "@/components/ui/product-card"
import { Heart, ShoppingBag, LoaderCircle } from "lucide-react"
import Link from "next/link"

import { EmptyState } from "@/components/ui/empty-state"
import { WishlistSummary } from "@/modules/wishlist/components/wishlist-summary"

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
      <div className="min-h-screen bg-gray-50 pt-20">
        <EmptyState
          image="/empty-states/wishlist-empty-state.png"
          title="Your Wishlist is Empty"
          description="Save your favorite products to your wishlist and shop them later."
          actionLabel="Browse Products"
          actionLink="/catalog"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-24 lg:pb-0">
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

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Products Grid */}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map((item) => {
                // Convert wishlist item to product format for ProductCard
                const product = {
                  id: item.product_id,
                  title: item.product_title || item.products?.title || "",
                  thumbnail: item.product_thumbnail || item.products?.thumbnail || null,
                  handle: item.product_handle || item.products?.handle || "",
                  variants: [
                    {
                      id: item.variant_id,
                      title: item.variant_title || item.variants?.title || "",
                      price: item.price || item.variants?.price || 0,
                      calculated_price: {
                        calculated_amount: item.price || item.variants?.calculated_price?.calculated_amount || item.variants?.price || 0,
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

          {/* Summary Sidebar */}
          <div className="lg:w-80 w-full">
            <WishlistSummary items={items} />
          </div>
        </div>
      </div>
    </div>
  )
}

