"use client"

import Link from "next/link"

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
    <div className="border-t border-b border-gray-200 py-4">
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
                    {discount}% OFF
                  </span>
                )}
              </>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Guest User - Simple Text Prompt */}
          {isGuest && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <h3 className="text-lg font-bold text-blue-600 mb-1">
                Price Information Hidden
              </h3>
              <p className="text-sm text-gray-700">
                Login or <Link href="/sign-up" className="text-blue-600 font-semibold underline">Register as Business</Link> to see the full price.
              </p>
            </div>
          )}

          {/* Business User (Not Verified) - Simple Text Prompt */}
          {isBusiness && !isVerified && (
            <div className="bg-yellow-50 border border-yellow-400 rounded-lg p-4">
              <h3 className="text-lg font-bold text-yellow-900 mb-1">
                Verify your business to see prices
              </h3>
              <p className="text-sm text-yellow-800">
                Access exclusive B2B pricing and add items to your cart by completing your{" "}
                <Link href="/profile/verification" className="font-semibold underline">
                  business verification
                </Link>.
              </p>
            </div>
          )}

          {/* Individual User - Simple Text Prompt */}
          {!isGuest && !isBusiness && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-lg font-bold text-purple-600 mb-1">
                Business Pricing Available
              </h3>
              <p className="text-sm text-gray-700">
                <Link href="/profile/account" className="font-semibold underline text-purple-600">
                  Upgrade to a business account
                </Link>{" "}
                to access wholesale pricing and checkout features.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
