"use client"

import { useWishlist } from "@/lib/hooks"
import { Heart, LoaderCircle, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

import { EmptyState } from "@/components/ui/empty-state"
import { WishlistProductCard } from "@/modules/wishlist/components/wishlist-product-card"
import { WishlistActions } from "@/modules/wishlist/components/wishlist-actions"
import { Button } from "@/components/ui/button"

export default function WishlistPage() {
  const { items, count, isLoading, clearWishlist } = useWishlist()
  const [isClearing, setIsClearing] = useState(false)

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to remove all items from your wishlist?")) return

    setIsClearing(true)
    try {
      await clearWishlist()
      toast.success("Wishlist cleared")
    } catch (error) {
      toast.error("Failed to clear wishlist")
    } finally {
      setIsClearing(false)
    }
  }

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
        {/* Header with Clear All Button */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Wishlist
            </h1>
            <p className="text-gray-600">
              {count} {count === 1 ? "item" : "items"} saved
            </p>
          </div>

          {count > 0 && (
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              onClick={handleClearAll}
              disabled={isClearing}
            >
              {isClearing ? (
                <>
                  <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </>
              )}
            </Button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Products Grid */}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map((item) => {
                // Convert wishlist item to product format for ProductCard
                // NOTE: Wishlist API doesn't return inventory_quantity, so we default to 999 (in stock)
                // This prevents false "OUT OF STOCK" display. Actual stock is checked at checkout.
                const product = {
                  id: item.product_id,
                  title: item.product_title || item.products?.title || "",
                  thumbnail: item.product_thumbnail || item.products?.thumbnail || null,
                  handle: item.product_handle || item.products?.handle || "",
                  description: item.products?.description || "",
                  variants: [
                    {
                      id: item.variant_id,
                      title: item.variant_title || item.variants?.title || "",
                      price: item.price || item.variants?.price || 0,
                      inventory_quantity: 999, // Default to in-stock since API doesn't return inventory
                      calculated_price: {
                        calculated_amount: item.price || item.variants?.calculated_price?.calculated_amount || item.variants?.price || 0,
                      },
                    },
                  ],
                } as any // Type assertion to avoid TypeScript errors

                return (
                  <WishlistProductCard
                    key={item.id}
                    product={product}
                    variantId={item.variant_id}
                    wishlistItemId={item.id}
                  />
                )
              })}
            </div>
          </div>

          {/* Actions Sidebar - Tier-based CTAs */}
          <div className="lg:w-80 w-full">
            <WishlistActions items={items} />
          </div>
        </div>
      </div>
    </div>
  )
}

