"use client"

import LocalizedClientLink from "@components/ui/localized-client-link"
import { Heart, X } from "lucide-react"
import { useWishlist } from "@/lib/hooks/use-wishlist"
import Image from "next/image"

export function WishlistHoverCardContent() {
  const { items, count, removeItem } = useWishlist()

  if (count === 0) {
    return (
      <div className="w-80 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Wishlist</h3>
        <div className="flex flex-col items-center justify-center py-8">
          <Heart size={48} className="text-gray-300 mb-3" />
          <p className="text-sm text-gray-600">Your wishlist is empty</p>
        </div>
        <LocalizedClientLink
          href="/catalog"
          className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center font-semibold py-3 px-4 rounded-lg transition-colors mt-4"
        >
          Start Shopping
        </LocalizedClientLink>
      </div>
    )
  }

  // Show max 5 items in the preview
  const previewItems = items.slice(0, 5)

  const formatPrice = (price?: number) => {
    if (!price || price === 0) return "Price on request"
    return `₹${price.toLocaleString()}`
  }

  return (
    <div className="w-96">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Wishlist ({count} {count === 1 ? 'item' : 'items'})
        </h3>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {previewItems.map((item) => (
          <div key={item.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 group relative">
            <div className="flex gap-3">
              {/* Product Image */}
              <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                {item.product_thumbnail ? (
                  <Image
                    src={item.product_thumbnail}
                    alt={item.product_title || "Product"}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Heart size={24} className="text-gray-300" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                  {item.product_title || item.products?.title || "Untitled Product"}
                </h4>
                <p className="text-sm font-semibold text-gray-700">
                  {formatPrice(item.price || item.variants?.price)}
                </p>
              </div>

              {/* Remove Button */}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  removeItem(item.variant_id)
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                aria-label="Remove from wishlist"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200">
        <LocalizedClientLink
          href="/wishlist"
          className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          View all {count} {count === 1 ? 'item' : 'items'}
        </LocalizedClientLink>
      </div>
    </div>
  )
}

