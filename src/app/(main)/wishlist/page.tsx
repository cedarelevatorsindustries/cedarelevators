"use client"

import { useWishlist } from "@/lib/hooks"
import { LoaderCircle, Trash2 } from "lucide-react"
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
    if (!confirm("Are you sure you want to remove all products from your quote list?")) return

    setIsClearing(true)
    try {
      await clearWishlist()
    } catch (error) {
      toast.error("Failed to clear quote list")
    } finally {
      setIsClearing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoaderCircle className="w-10 h-10 animate-spin text-orange-600" />
      </div>
    )
  }

  if (count === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <EmptyState
          image="/empty-states/wishlist-empty-state.png"
          title="Your list is waiting to be filled."
          description="Explore our elevator components and save the products you're interested in."
          actionLabel="Explore Products"
          actionLink="/products"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-24 lg:pb-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header with Clear List Button */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 pb-6">
          <div>
            <h1 className="type-section text-gray-900 mb-2">
              Your Quote List
            </h1>
            <p className="type-body-sm text-gray-600 max-w-2xl">
              Keep the products you&apos;re interested in one place. Review your selection and add or remove products as your requirements evolve.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {count} {count === 1 ? "product" : "products"} saved
            </p>
          </div>

          {count > 0 && (
            <Button
              variant="outline"
              className="text-gray-700 border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 self-start sm:self-auto"
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
                  Clear List
                </>
              )}
            </Button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Three-Column Product Grid */}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item) => {
                const product = {
                  id: item.product_id,
                  title: item.product_title || item.products?.title || "",
                  thumbnail: item.product_thumbnail || item.products?.thumbnail || null,
                  handle: item.product_handle || item.products?.handle || "",
                  description: item.products?.description || "",
                  price: item.price || item.variants?.price || 0,
                  variants: [
                    {
                      id: item.variant_id,
                      title: item.variant_title || item.variants?.title || "",
                      price: item.price || item.variants?.price || 0,
                      inventory_quantity: 999,
                      calculated_price: {
                        calculated_amount:
                          item.price ||
                          item.variants?.calculated_price?.calculated_amount ||
                          item.variants?.price ||
                          0,
                      },
                    },
                  ],
                } as any

                return (
                  <WishlistProductCard
                    key={item.id}
                    product={product}
                    variantId={item.variant_id}
                    wishlistItemId={item.id}
                    quantity={item.quantity || 1}
                    sku={item.product_sku}
                    variantTitle={item.variant_title}
                  />
                )
              })}
            </div>
          </div>

          {/* Right-Side Quote List Summary Panel */}
          <div className="lg:w-80 w-full">
            <WishlistActions items={items} />
          </div>
        </div>
      </div>
    </div>
  )
}
