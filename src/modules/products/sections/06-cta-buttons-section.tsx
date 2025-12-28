"use client"

import { useState } from "react"
import { ShoppingCart, MessageSquare, Heart, Share2, Lock } from "lucide-react"
import Link from "next/link"
import QuantitySelector from "../components/product/quantity-selector"

interface CTAButtonsSectionProps {
  isGuest: boolean
  isBusiness: boolean
  isVerified: boolean
  accountType?: string
  allVariantsSelected?: boolean
  hasVariants?: boolean
  onAddToCart?: (quantity: number) => void
  onRequestQuote?: () => void
  onWishlist?: () => void
  onShare?: () => void
}

export default function CTAButtonsSection({
  isGuest,
  isBusiness,
  isVerified,
  accountType,
  allVariantsSelected = true,
  hasVariants = false,
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

  // Only verified business can add to cart
  const canAddToCart = isBusiness && isVerified && allVariantsSelected
  const isIndividual = accountType === "individual"

  return (
    <div className="space-y-4">
      {/* Quantity Selector Row */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-gray-700">Quantity:</span>
        <QuantitySelector
          quantity={quantity}
          onQuantityChange={setQuantity}
          disabled={false}
          size="md"
        />

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Wishlist and Share Icons */}
        <button
          onClick={handleWishlist}
          className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all ${isWishlisted
              ? "border-red-500 text-red-500 bg-red-50"
              : "border-gray-300 text-gray-600 hover:border-gray-400"
            }`}
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500" : ""}`} />
        </button>

        <button
          onClick={onShare}
          className="w-12 h-12 rounded-lg border-2 border-gray-300 text-gray-600 hover:border-gray-400 transition-all flex items-center justify-center"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Action Buttons - Based on User Type */}
      <div className="space-y-3">
        {/* Verified Business - Show both Add to Cart and Quote */}
        {isBusiness && isVerified ? (
          <div className="flex gap-3">
            <button
              onClick={() => canAddToCart && onAddToCart?.(quantity)}
              disabled={!allVariantsSelected}
              className={`flex-1 py-3.5 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-base ${allVariantsSelected
                  ? "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>

            <button
              onClick={onRequestQuote}
              className="flex-1 py-3.5 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 active:bg-blue-100 transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              Quote
            </button>
          </div>
        ) : isBusiness && !isVerified ? (
          /* Business Unverified - Quote only with verification teaser */
          <div className="space-y-2">
            <button
              onClick={onRequestQuote}
              className="w-full py-3.5 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 active:bg-orange-700 transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              Request Quote for Bulk Pricing
            </button>
            <Link
              href="/profile/verification"
              className="block text-center text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              <Lock className="w-3.5 h-3.5 inline mr-1" />
              Verify your business to enable direct purchase
            </Link>
          </div>
        ) : isIndividual ? (
          /* Individual User - Quote only with upgrade teaser */
          <div className="space-y-2">
            <button
              onClick={onRequestQuote}
              className="w-full py-3.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              Request Quote
            </button>
            <Link
              href="/profile/account"
              className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Create a business account for exclusive pricing
            </Link>
          </div>
        ) : (
          /* Guest - Quote with login CTA */
          <div className="space-y-2">
            <button
              onClick={onRequestQuote}
              className="w-full py-3.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              Request Quote
            </button>
            <Link
              href="/sign-in"
              className="block text-center text-sm text-gray-600 hover:text-gray-800"
            >
              Login for business pricing and faster quotes
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
