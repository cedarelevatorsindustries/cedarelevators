"use client"

import { Product } from "@/lib/types/domain"
import { Package, Heart, ShoppingCart, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useUser } from "@/lib/auth/client"
import { getUserPricingState, canViewPrice } from "@/lib/utils/pricing-utils"
import { useState, useEffect } from "react"
import { useWishlist } from "@/lib/hooks/use-wishlist"
import { useRecentlyViewed } from "@/hooks/use-recently-viewed"
import { useRouter } from "next/navigation"

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
  const { isInWishlist, toggleItem } = useWishlist()
  const { trackView } = useRecentlyViewed()
  const router = useRouter()

  // Get variant and price info for wishlist
  // Use variant ID if available, otherwise use product ID as fallback
  const variantId = product.variants?.[0]?.id || product.id || ""
  const wishlistPrice = product.variants?.[0]?.calculated_price?.calculated_amount || product.variants?.[0]?.price || 0
  const isWishlisted = isInWishlist(variantId)

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

  // NOTE: removed local state isWishlisted, using hook state

  // Determine user type and verification status using consistent utility
  const userState = getUserPricingState(user)
  const showPrice = canViewPrice(userState)

  // Re-derive helpers for existing JSX logic
  const isGuest = userState === 'guest'
  const isIndividual = userState === 'individual'
  // Business includes both verified and unverified for general "business" logic
  const isBusiness = userState === 'business_unverified' || userState === 'business_verified'
  const isVerified = userState === 'business_verified'

  // Extract price and compare_at_price (MRP) from product or variants
  // Handle both formats: direct number (50) or object ({amount: 50})
  // Priority: Use product table price first (matches product detail page), then fallback to variant
  // Prices are stored in rupees in the database (not paise)

  const rawPrice = (product as any).price || product.variants?.[0]?.price || 0
  const rawCompareAtPrice = (product as any).compare_at_price || product.variants?.[0]?.compare_at_price

  // Normalize: extract number from object if needed
  const price = typeof rawPrice === 'object' && rawPrice?.amount !== undefined
    ? rawPrice.amount
    : (typeof rawPrice === 'number' ? rawPrice : 0)

  const compareAtPrice = typeof rawCompareAtPrice === 'object' && rawCompareAtPrice?.amount !== undefined
    ? rawCompareAtPrice.amount
    : (typeof rawCompareAtPrice === 'number' ? rawCompareAtPrice : null)

  // Format prices for display (prices are already in rupees)
  const formattedPrice = price ? `₹${Number(price).toLocaleString("en-IN")}` : null
  const formattedMRP = compareAtPrice && compareAtPrice > price ? `MRP ₹${Number(compareAtPrice).toLocaleString("en-IN")}` : null

  // Calculate discount percentage
  const discountPercent = (price && compareAtPrice && compareAtPrice > price)
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : null


  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    // Allow everyone to add to cart - restrictions handled at checkout
    console.log("Add to cart:", product.id)
    // TODO: Implement add to cart logic
    // Cart will handle login/verification prompts at checkout
  }

  const handleRequestQuote = (e: React.MouseEvent) => {
    e.preventDefault()
    const params = new URLSearchParams({
      productId: product.id,
      productName: product.title
    })
    router.push(`/quotes/new?${params.toString()}`)
  }

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation() // Prevent navigation

    if (!variantId) {
      console.warn('No variant ID available for wishlist')
      return
    }

    try {
      await toggleItem(
        variantId,
        product.id!,
        product.title || "",
        product.thumbnail || null,
        wishlistPrice
      )
    } catch (error) {
      console.error('Error toggling wishlist:', error)
    }
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

  // Check if product is out of stock
  // Handle both 'variants' (from some sources) and 'product_variants' (from Supabase relations)
  const variants = product.variants || (product as any).product_variants || []
  const totalInventory = variants.reduce((sum: number, v: any) => sum + (v.inventory_quantity || 0), 0)
  const isOutOfStock = totalInventory === 0

  // Debug: Log stock calculation for mobile
  if (variant === 'mobile') {
    console.log('[ProductCard Mobile] Stock check:', {
      productId: product.id,
      productName: product.title,
      hasVariants: !!product.variants,
      variantsArray: variants,
      variantsCount: variants.length,
      totalInventory,
      isOutOfStock
    })
  }

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

            {/* Out of Stock Banner */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
                <div className="bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-lg">
                  OUT OF STOCK
                </div>
              </div>
            )}

            {/* Badge - Top Left */}
            {badgeConfig && (
              <div className={`absolute top-1.5 left-1.5 ${badgeConfig.bg} text-white px-1.5 py-0.5 text-[10px] rounded font-medium shadow-md z-10`}>
                {badgeConfig.text}
              </div>
            )}

            {/* Wishlist Button - Top Right */}
            <button
              onClick={handleWishlist}
              className="absolute top-1.5 right-1.5 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-md hover:bg-white transition-colors z-10"
            >
              <Heart
                className={`w-3 h-3 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`}
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

          {/* Price Section - With MRP and Discount */}
          {showPrice && formattedPrice ? (
            // Verified Business - Show Price with MRP and Discount
            <div className="py-0.5">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-base font-bold text-gray-900">{formattedPrice}</span>
                {formattedMRP && (
                  <span className="text-[10px] text-gray-400 line-through">{formattedMRP}</span>
                )}
                {discountPercent && discountPercent > 0 && (
                  <span className="text-[9px] font-semibold text-green-600 bg-green-50 px-1 py-0.5 rounded">
                    {discountPercent}%
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-500">(Inclusive of all taxes)</p>
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
          ) : isBusiness && isVerified ? (
            // Verified Business but no price data for this product
            <div className="py-0.5">
              <p className="text-xs font-medium text-gray-700">Price not set</p>
              <p className="text-[10px] text-gray-500">Request quote for pricing</p>
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

          {/* CTA Buttons - Quote only (users add variants to cart from product detail page) */}
          <div className="flex gap-1.5 pt-1">
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

          {/* Out of Stock Banner */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg">
                OUT OF STOCK
              </div>
            </div>
          )}

          {/* Badge - Inside Image Overlay (Top Left) */}
          {/* Badge - Inside Image Overlay (Top Left) */}
          {badge && (
            <div className={`absolute top-2 left-2 ${badge === 'top-application' ? 'bg-blue-600' : 'bg-red-500'} text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm z-10`}>
              {badge === "top-application" ? "Top Application" : badgeConfig?.text || badge}
            </div>
          )}

          {/* Wishlist - Top Right */}
          <button
            onClick={handleWishlist}
            className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-md hover:bg-white transition-colors z-10"
          >
            <Heart
              className={`w-3.5 h-3.5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`}
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
            {/* Price Display with MRP and Discount */}
            <div className="flex flex-col">
              {showPrice && formattedPrice ? (
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-sm font-bold text-gray-900">{formattedPrice}</span>
                  {formattedMRP && (
                    <span className="text-[10px] text-gray-400 line-through">{formattedMRP}</span>
                  )}
                  {discountPercent && discountPercent > 0 && (
                    <span className="text-[9px] font-semibold text-green-600 bg-green-50 px-1 py-0.5 rounded">
                      {discountPercent}%
                    </span>
                  )}
                </div>
              ) : isBusiness && isVerified ? (
                <span className="text-xs font-bold text-gray-600">Quote</span>
              ) : (
                <span className="text-xs font-bold text-orange-600">
                  {isBusiness && !isVerified ? "Verify for Price" : "Price on Request"}
                </span>
              )}
            </div>

            {/* Actions: Quote only (users add variants to cart from product detail page) */}
            <div className="flex gap-1.5">
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

          {/* Out of Stock Banner */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-base shadow-lg">
                OUT OF STOCK
              </div>
            </div>
          )}

          {/* Badge - Top Left */}
          {badgeConfig && (
            <div className={`absolute top-2 left-2 ${badgeConfig.bg} text-white px-2 py-1 text-xs rounded-md font-medium shadow-md z-10`}>
              {badgeConfig.text}
            </div>
          )}

          {/* Wishlist Button - Top Right */}
          <button
            onClick={handleWishlist}
            className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-colors z-10"
          >
            <Heart
              className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`}
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
          // Verified Business - Show Price with MRP and Discount
          <div className="py-1 mt-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-bold text-gray-900">{formattedPrice}</span>
              {formattedMRP && (
                <span className="text-sm text-gray-400 line-through">{formattedMRP}</span>
              )}
              {discountPercent && discountPercent > 0 && (
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                  {discountPercent}%
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">(Inclusive of all taxes)</p>
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
        ) : isBusiness && isVerified ? (
          // Verified Business but no price data for this product
          <div className="py-1 mt-2">
            <p className="text-sm font-medium text-gray-700">Price not set</p>
            <p className="text-xs text-gray-500">Request quote for pricing</p>
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

        {/* CTA Buttons - Quote only (users add variants to cart from product detail page) */}
        <div className="flex gap-2 pt-2">
          {/* Request Quote - For Everyone */}
          <button
            onClick={handleRequestQuote}
            className="w-full py-2.5 rounded-lg font-medium text-sm border-2 border-gray-300 text-gray-700 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            {isBusiness && !isVerified ? "Get Bulk Quote" : "Quote"}
          </button>
        </div>
      </div>
    </div>
  )
}

