"use client"

import { Product } from "@/lib/types/domain"
import { Package, Heart, ShoppingCart, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useUser } from "@/lib/auth/client"
import { useState, useEffect } from "react"
import { useFavorites } from "@/hooks/use-favorites"
import { useRecentlyViewed } from "@/hooks/use-recently-viewed"

interface ProductCardProps {
  product: Product
  variant?: "default" | "special" | "mobile"
  badge?: "offer" | "trending" | "top-application" | "verified" | "pending"
}

export default function ProductCard({
  product,
  variant = "default",
  badge
}: ProductCardProps) {
  const { user } = useUser()
  const { isFavorite, toggle } = useFavorites(product.id)
  const { trackView } = useRecentlyViewed()

  // Track view on mount (only for default/special variants, not mobile list to avoid spam?)
  // User asked for "Recently Viewed - Help user resume browsing".
  // Tracking every card render is bad. Tracking should be on CLICK or Detail Page View.
  // "User clicks product" -> "Track view".
  // ProductCard links to detail page.
  // Ideally, tracking should happen on the PRODUCT DETAIL PAGE, not the card.
  // Checking user request: "Logic: User clicks on product, Product ID stored".
  // Since Link is wrapping the card/image, clicking it navigates.
  // We can track on click.

  const handleProductClick = () => {
    trackView(product)
  }

  // NOTE: removed local state isWishlisted, using hook state

  // Determine user type and verification status
  const isGuest = !user
  const accountType = user?.unsafeMetadata?.accountType as string | undefined
  const isIndividual = accountType === "individual"
  const isBusiness = accountType === "business"
  const isVerified = user?.unsafeMetadata?.is_verified === true

  // Pricing logic - only show for verified business
  const showPrice = isBusiness && isVerified
  const price = product.price?.amount || product.variants?.[0]?.price
  const formattedPrice = price ? `₹${(price / 100).toLocaleString("en-IN")}` : null

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    // Allow everyone to add to cart - restrictions handled at checkout
    console.log("Add to cart:", product.id)
    // TODO: Implement add to cart logic
    // Cart will handle login/verification prompts at checkout
  }

  const handleRequestQuote = (e: React.MouseEvent) => {
    e.preventDefault()
    console.log("Request quote:", product.id)
    // TODO: Implement request quote modal/form
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation() // Prevent navigation
    toggle()
  }

  // Badge configuration
  const getBadgeConfig = () => {
    if (!badge) return null

    const configs = {
      offer: { bg: "bg-red-500", text: "Special Offer" },
      trending: { bg: "bg-purple-600", text: "Trending" },
      "top-application": { bg: "bg-blue-600", text: "Top Application" },
      verified: { bg: "bg-green-600", text: "Verified Business" },
      pending: { bg: "bg-orange-500", text: "Pending Verification" }
    }
    return configs[badge]
  }

  const badgeConfig = getBadgeConfig()

  // Mobile Card Variant - Compact with cart icon left of quote button
  if (variant === "mobile") {
    return (
      <div className="group relative bg-gray-50 rounded-xl p-2 hover:shadow-xl transition-all duration-300">
        {/* Image Section */}
        <Link href={`/products/${product.handle}`} onClick={handleProductClick}>
          <div className="aspect-square bg-white rounded-xl relative overflow-hidden mb-2 shadow-sm">
            {product.thumbnail ? (
              <img
                src={product.thumbnail}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
            )}

            {/* Badge - Top Left */}
            {badgeConfig && (
              <div className={`absolute top-1.5 left-1.5 ${badgeConfig.bg} text-white px-1.5 py-0.5 text-[10px] rounded font-medium shadow-md`}>
                {badgeConfig.text}
              </div>
            )}

            {/* Wishlist Button - Top Right */}
            <button
              onClick={handleWishlist}
              className="absolute top-1.5 right-1.5 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-md hover:bg-white transition-colors z-10"
            >
              <Heart
                className={`w-3 h-3 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`}
              />
            </button>
          </div>
        </Link>

        {/* Content Section */}
        <div className="space-y-1.5">
          <Link href={`/products/${product.handle}`} onClick={handleProductClick}>
            {/* Title - Truncated to 1 line */}
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors leading-tight">
              {product.title}
            </h3>

            {/* Description - Truncated to 2 lines */}
            {product.description && (
              <p className="text-[10px] text-gray-600 line-clamp-2 leading-snug mt-1">
                {product.description}
              </p>
            )}
          </Link>

          {/* Price Section - Role-based Display (Same as Desktop) */}
          {showPrice && formattedPrice ? (
            // Verified Business - Show Price
            <div className="py-0.5">
              <p className="text-base font-bold text-gray-900">{formattedPrice}</p>
              <p className="text-[10px] text-gray-500">Min. order: Contact for details</p>
            </div>
          ) : isGuest ? (
            // Guest - Login Required
            <div className="py-0.5">
              <p className="text-xs font-medium text-orange-600">Price on request</p>
              <p className="text-[10px] text-gray-600">Login to see pricing</p>
            </div>
          ) : isIndividual ? (
            // Individual - Request Quote
            <div className="py-0.5">
              <p className="text-xs font-medium text-orange-600">Price on request</p>
              <p className="text-[10px] text-gray-600">Request quote for pricing</p>
            </div>
          ) : isBusiness && !isVerified ? (
            // Business Unverified - Verification Required
            <div className="py-0.5">
              <p className="text-xs font-medium text-orange-600">Price on request</p>
              <p className="text-[10px] text-gray-600">Verify account to see pricing</p>
            </div>
          ) : (
            // Fallback
            <div className="py-0.5">
              <p className="text-xs font-medium text-orange-600">Price on request</p>
              <p className="text-[10px] text-gray-600">Contact for pricing</p>
            </div>
          )}

          {/* Status Messages - Informational */}
          {showPrice && (
            <p className="text-[10px] text-green-600 font-medium flex items-center gap-1">
              <span className="w-1 h-1 bg-green-600 rounded-full"></span>
              Verified - Instant checkout
            </p>
          )}

          {/* CTA Buttons - Cart Icon + Quote Button */}
          <div className="flex gap-1.5 pt-1">
            {/* Cart Button - Only for Verified Business */}
            {showPrice && (
              <button
                onClick={handleAddToCart}
                className="w-8 h-8 flex-shrink-0 rounded-lg bg-orange-500 hover:bg-orange-600 transition-colors flex items-center justify-center shadow-sm"
              >
                <ShoppingCart className="w-4 h-4 text-white" />
              </button>
            )}

            {/* Request Quote Button - For Everyone */}
            <button
              onClick={handleRequestQuote}
              className="flex-1 py-1.5 rounded-lg font-medium text-xs border-2 border-gray-300 text-gray-700 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-all flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              {isBusiness && !isVerified ? "Get Bulk Quote" : "Request Quote"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Special Card Variant (for categories/trending) - Text Outside Image
  if (variant === "special") {
    // Get actual category/application name from product metadata
    const categoryType = product.metadata?.category as string || "Featured"

    return (
      <div className="group relative bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        {/* Square Image with Badge */}
        <Link href={`/products/${product.handle}`} className="block relative aspect-square overflow-hidden bg-gray-50" onClick={handleProductClick}>
          {product.thumbnail ? (
            <img
              src={product.thumbnail}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-300" />
            </div>
          )}

          {/* Badge - Inside Image Overlay (Top Left) */}
          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm z-10">
            {badge === "top-application" ? "Top Application" : categoryType}
          </div>

          {/* Wishlist - Top Right */}
          <button
            onClick={handleWishlist}
            className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-md hover:bg-white transition-colors z-10"
          >
            <Heart
              className={`w-3.5 h-3.5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`}
            />
          </button>
        </Link>

        {/* Content Outside Image */}
        <div className="p-3 flex flex-col flex-1 gap-2">
          <Link href={`/products/${product.handle}`} className="flex-1" onClick={handleProductClick}>
            {/* Title */}
            <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight mb-1 group-hover:text-blue-600 transition-colors">
              {product.title}
            </h3>

            {/* Description - Optional */}
            {product.description && (
              <p className="text-[10px] text-gray-500 line-clamp-1">
                {product.description}
              </p>
            )}
          </Link>

          {/* Price & Actions Row */}
          <div className="flex items-center justify-between gap-2 mt-auto pt-1">
            {/* Price Display */}
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 font-medium">Starting from</span>
              {showPrice && formattedPrice ? (
                <span className="text-sm font-bold text-gray-900">{formattedPrice}</span>
              ) : (
                <span className="text-xs font-bold text-orange-600">
                  {isBusiness && !isVerified ? "Verify for Price" : "Price on Request"}
                </span>
              )}
            </div>

            {/* Actions: Cart (only for verified) & Quote (for all) */}
            <div className="flex gap-1.5">
              {showPrice && (
                <button
                  onClick={handleAddToCart}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700 transition-all flex items-center justify-center"
                  title="Add to Cart"
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleRequestQuote}
                className="w-8 h-8 rounded-lg bg-orange-50 hover:bg-orange-500 hover:text-white text-orange-600 border border-orange-100 hover:border-orange-500 transition-all flex items-center justify-center"
                title={isBusiness && !isVerified ? "Get Bulk Quote" : "Request Quote"}
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default Card Variant
  return (
    <div className="group relative bg-gray-50 rounded-xl p-3 hover:shadow-xl transition-all duration-300">
      {/* Image Section - Separate with Rounded Corners */}
      <Link href={`/products/${product.handle}`} onClick={handleProductClick}>
        <div className="aspect-square bg-white rounded-xl relative overflow-hidden mb-3 shadow-sm">
          {product.thumbnail ? (
            <img
              src={product.thumbnail}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-16 h-16 text-gray-400" />
            </div>
          )}

          {/* Badge - Top Left */}
          {badgeConfig && (
            <div className={`absolute top-2 left-2 ${badgeConfig.bg} text-white px-2 py-1 text-xs rounded-md font-medium shadow-md`}>
              {badgeConfig.text}
            </div>
          )}

          {/* Wishlist Button - Top Right */}
          <button
            onClick={handleWishlist}
            className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-colors z-10"
          >
            <Heart
              className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`}
            />
          </button>
        </div>
      </Link>

      {/* Content Section - Direct on Background */}
      <div className="space-y-2">
        <Link href={`/products/${product.handle}`} onClick={handleProductClick}>
          {/* Title - Truncated */}
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {product.title}
          </h3>

          {/* Description - 2 lines */}
          {product.description && (
            <p className="text-xs text-gray-600 line-clamp-2 min-h-[32px] mb-2">
              {product.description}
            </p>
          )}
        </Link>

        {/* Price Section - Role-based Display */}
        {showPrice && formattedPrice ? (
          // Verified Business - Show Price
          <div className="py-1 mt-2">
            <p className="text-lg font-bold text-gray-900">{formattedPrice}</p>
            <p className="text-xs text-gray-500">Min. order: Contact for details</p>
          </div>
        ) : isGuest ? (
          // Guest - Login Required
          <div className="py-1 mt-2">
            <p className="text-sm font-medium text-orange-600">Price on request</p>
            <p className="text-xs text-gray-600">Login to see pricing</p>
          </div>
        ) : isIndividual ? (
          // Individual - Request Quote
          <div className="py-1 mt-2">
            <p className="text-sm font-medium text-orange-600">Price on request</p>
            <p className="text-xs text-gray-600">Request quote for pricing</p>
          </div>
        ) : isBusiness && !isVerified ? (
          // Business Unverified - Verification Required
          <div className="py-1 mt-2">
            <p className="text-sm font-medium text-orange-600">Price on request</p>
            <p className="text-xs text-gray-600">Verify account to see pricing</p>
          </div>
        ) : (
          // Fallback
          <div className="py-1 mt-2">
            <p className="text-sm font-medium text-orange-600">Price on request</p>
            <p className="text-xs text-gray-600">Contact for pricing</p>
          </div>
        )}

        {/* Status Messages - Informational */}
        {showPrice && (
          <p className="text-xs text-green-600 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
            Verified - Instant checkout
          </p>
        )}

        {/* CTA Buttons - Cart only for Verified Business */}
        <div className="flex gap-2 pt-2">
          {/* Add to Cart - Only for Verified Business */}
          {showPrice && (
            <button
              onClick={handleAddToCart}
              className="flex-1 py-2.5 rounded-lg font-medium text-sm bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
          )}

          {/* Request Quote - For Everyone */}
          <button
            onClick={handleRequestQuote}
            className={`${showPrice ? 'flex-1' : 'w-full'} py-2.5 rounded-lg font-medium text-sm border-2 border-gray-300 text-gray-700 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-all flex items-center justify-center gap-2`}
          >
            <MessageSquare className="w-4 h-4" />
            {isBusiness && !isVerified ? "Get Bulk Quote" : "Quote"}
          </button>
        </div>
      </div>
    </div>
  )
}
