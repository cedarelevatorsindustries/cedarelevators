"use client"

import { Info, TrendingDown } from "lucide-react"

interface PriceDisplayProps {
  showPrice: boolean
  price: number | null
  originalPrice?: number | null
  isGuest: boolean
  isBusiness: boolean
  isVerified: boolean
  currency?: string
  size?: "sm" | "md" | "lg"
}

export default function PriceDisplay({
  showPrice,
  price,
  originalPrice,
  isGuest,
  isBusiness,
  isVerified,
  currency = "INR",
  size = "lg"
}: PriceDisplayProps) {
  const formatPrice = (amount: number) => {
    return `₹${Number(amount).toLocaleString("en-IN")}`
  }

  const discount = originalPrice && price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null

  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl"
  }

  // CRITICAL: Double-check verification status
  // Even if showPrice is true, NEVER show prices to unverified business users
  const shouldShowActualPrice = showPrice && price && (isVerified || !isBusiness)

  if (shouldShowActualPrice) {
    // Verified Business - Show Actual Price
    return (
      <div className="space-y-2">
        <div className="flex items-baseline gap-3">
          <span className={`${sizeClasses[size]} font-bold text-gray-900`}>
            {formatPrice(price)}
          </span>
          {originalPrice && originalPrice > price && (
            <>
              <span className="text-lg text-gray-400 line-through">
                {formatPrice(originalPrice)}
              </span>
              {discount && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded">
                  <TrendingDown className="w-4 h-4" />
                  {discount}% OFF
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex items-start gap-2 text-sm text-green-700 bg-green-50 p-2 rounded">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            <strong>Verified Business Pricing</strong> - Instant checkout available
          </p>
        </div>
      </div>
    )
  }

  // Non-Verified - Show XXX
  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-3">
        <span className={`${sizeClasses[size]} font-bold text-gray-400 tracking-wider`}>
          ₹ XXX
        </span>
        <span className="text-sm text-gray-500">(Price hidden)</span>
      </div>

      {/* Contextual Message */}
      <div className="flex items-start gap-2 text-sm bg-orange-50 text-orange-700 p-2 rounded">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div>
          {isGuest ? (
            <p>
              <strong>Login to see pricing</strong> - Sign in to view product prices
            </p>
          ) : isBusiness && !isVerified ? (
            <p>
              <strong>Verify your account to see pricing</strong> - Complete business verification
            </p>
          ) : (
            <p>
              <strong>Request a quote for pricing</strong> - Our team will provide a custom quote
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

