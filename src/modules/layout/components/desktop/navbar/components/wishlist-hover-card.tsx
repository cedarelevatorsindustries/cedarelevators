"use client"

import LocalizedClientLink from "@components/ui/localized-client-link"
import { Heart } from "lucide-react"

interface WishlistItem {
  id: string
  title: string
  image?: string
  price: string
}

interface WishlistHoverCardContentProps {
  items: WishlistItem[]
}

export function WishlistHoverCardContent({ items }: WishlistHoverCardContentProps) {
  if (items.length === 0) {
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

  return (
    <div className="w-96">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Wishlist</h3>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
            <div className="flex gap-3">
              {item.image && (
                <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded" />
              )}
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{item.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{item.price}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <LocalizedClientLink
          href="/wishlist"
          className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          View all items
        </LocalizedClientLink>
      </div>
    </div>
  )
}

