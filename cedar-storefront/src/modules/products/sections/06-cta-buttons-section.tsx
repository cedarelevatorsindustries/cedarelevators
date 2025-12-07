"use client"

import { useState } from "react"
import { ShoppingCart, MessageSquare, Heart, Share2, Minus, Plus } from "lucide-react"

interface CTAButtonsSectionProps {
  showAddToCart: boolean
  onAddToCart?: (quantity: number) => void
  onRequestQuote?: () => void
  onWishlist?: () => void
  onShare?: () => void
}

export default function CTAButtonsSection({
  showAddToCart,
  onAddToCart,
  onRequestQuote,
  onWishlist,
  onShare
}: CTAButtonsSectionProps) {
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    onWishlist?.()
  }

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Quantity
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20 h-10 text-center border-2 border-gray-300 rounded-lg font-semibold"
          />
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary CTAs */}
      <div className="space-y-3">
        {showAddToCart ? (
          <button
            onClick={() => onAddToCart?.(quantity)}
            className="w-full py-3.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-base"
          >
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </button>
        ) : (
          <button
            onClick={onRequestQuote}
            className="w-full py-3.5 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 text-base"
          >
            <MessageSquare className="w-5 h-5" />
            Request Quote
          </button>
        )}

        {/* Secondary CTA */}
        {showAddToCart && (
          <button
            onClick={onRequestQuote}
            className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-5 h-5" />
            Get Bulk Quote
          </button>
        )}
      </div>

      {/* Secondary Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleWishlist}
          className={`flex-1 py-3 rounded-lg font-medium border-2 transition-all flex items-center justify-center gap-2 ${
            isWishlisted
              ? "border-red-500 text-red-500 bg-red-50"
              : "border-gray-300 text-gray-700 hover:border-gray-400"
          }`}
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500" : ""}`} />
          {isWishlisted ? "Saved" : "Save"}
        </button>
        
        <button
          onClick={onShare}
          className="flex-1 py-3 rounded-lg font-medium border-2 border-gray-300 text-gray-700 hover:border-gray-400 transition-all flex items-center justify-center gap-2"
        >
          <Share2 className="w-5 h-5" />
          Share
        </button>
      </div>
    </div>
  )
}
