"use client"

import { Info, TrendingDown } from "lucide-react"

interface PricingBlockSectionProps {
  showPrice: boolean
  price: number | null
  originalPrice?: number | null
  isGuest: boolean
  isBusiness: boolean
  isVerified: boolean
  currency?: string
}

export default function PricingBlockSection({
  showPrice,
  price,
  originalPrice,
  isGuest,
  isBusiness,
  isVerified,
  currency = "INR"
}: PricingBlockSectionProps) {
  const formatPrice = (amount: number) => {
    return `₹${(amount / 100).toLocaleString("en-IN")}`
  }

  const discount = originalPrice && price 
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null

  return (
    <div className="bg-gray-50 rounded-xl p-6 space-y-4">
      {showPrice && price ? (
        <>
          {/* Verified Business - Show Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-gray-900">
              {formatPrice(price)}
            </span>
            {originalPrice && originalPrice > price && (
              <>
                <span className="text-xl text-gray-400 line-through">
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
          
          <div className="flex items-start gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              <strong>Verified Business Pricing</strong> - Instant checkout available
            </p>
          </div>

          {/* Bulk Pricing Hint */}
          <p className="text-sm text-gray-600">
            💼 <strong>Bulk orders?</strong> Contact us for volume discounts
          </p>
        </>
      ) : (
        <>
          {/* Non-Verified - Show XXX */}
          <div className="space-y-3">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-gray-400 tracking-wider">
                ₹ XXX
              </span>
              <span className="text-sm text-gray-500">(Price hidden)</span>
            </div>

            {/* Contextual Message */}
            <div className="flex items-start gap-2 text-sm bg-orange-50 text-orange-700 p-3 rounded-lg">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                {isGuest ? (
                  <p>
                    <strong>Login to see pricing</strong> - Sign in to view product prices
                  </p>
                ) : isBusiness && !isVerified ? (
                  <p>
                    <strong>Verify your account to see pricing</strong> - Complete business verification to access prices
                  </p>
                ) : (
                  <p>
                    <strong>Request a quote for pricing</strong> - Our team will provide a custom quote
                  </p>
                )}
              </div>
            </div>

            {/* CTA */}
            <p className="text-sm text-gray-600">
              📞 <strong>Need pricing?</strong> Request a quote or contact our sales team
            </p>
          </div>
        </>
      )}

      {/* Additional Info */}
      <div className="pt-4 border-t space-y-2 text-sm text-gray-600">
        <p>✓ GST included in price</p>
        <p>✓ Free shipping on orders above ₹50,000</p>
        <p>✓ 2-year warranty included</p>
      </div>
    </div>
  )
}
