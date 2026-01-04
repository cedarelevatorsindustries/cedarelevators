"use client"

import { useState } from "react"
import { MessageSquare, FileText, TrendingUp, Info } from "lucide-react"
import LocalizedClientLink from "@components/ui/localized-client-link"
import { UserType, VerificationStatus } from "@/lib/hooks/useUserPricing"

interface VolumePricing {
  quantity: number
  price: number
}

interface PricingDisplayProps {
  product: {
    id: string
    title: string
    listPrice?: number
    businessPrice?: number
    discount?: number
    volumePricing?: VolumePricing[]
  }
  variant?: "card" | "detail"
  showActions?: boolean
  userState: {
    isLoading: boolean
    isLoggedIn: boolean
    userType: UserType
    verificationStatus: VerificationStatus
  }
}

export function PricingDisplay({
  product,
  variant = "card",
  showActions = true,
  userState
}: PricingDisplayProps) {
  const { isLoading, isLoggedIn, userType, verificationStatus } = userState
  const [showTooltip, setShowTooltip] = useState(false)

  // Show loading state or default to guest view during initial load
  if (isLoading || !isLoggedIn) {
    return (
      <div className="price-section">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl font-bold text-gray-400">XXX</span>
          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Info className="w-4 h-4" />
            </button>
            {showTooltip && (
              <div className="absolute left-0 top-6 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 z-10 shadow-lg">
                Pricing available for registered users. Sign in or create an account to view prices.
              </div>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-3">Login to view pricing</p>
        {showActions && variant === "detail" && (
          <div className="flex gap-2">
            <LocalizedClientLink
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Sign In
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/register"
              className="border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Create Account
            </LocalizedClientLink>
          </div>
        )}
        {variant === "card" && (
          <span className="text-blue-600 text-sm font-medium">
            Sign in to see price
          </span>
        )}
      </div>
    )
  }

  // Individual User
  if (userType === "individual") {
    return (
      <div className="price-section">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl font-bold text-gray-400">XXX</span>
          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Info className="w-4 h-4" />
            </button>
            {showTooltip && (
              <div className="absolute left-0 top-6 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 z-10 shadow-lg">
                Business accounts unlock instant pricing and volume discounts. Contact us or upgrade to see prices.
              </div>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-3">Contact us for pricing</p>
        {showActions && variant === "detail" && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <LocalizedClientLink
                href="/contact"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Chat Now
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/quotes/new"
                className="flex items-center gap-2 border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <FileText className="w-4 h-4" />
                Request Quote
              </LocalizedClientLink>
            </div>
            <LocalizedClientLink
              href="/register/business"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full"
            >
              <TrendingUp className="w-4 h-4" />
              Upgrade to Business Account
            </LocalizedClientLink>
          </div>
        )}
        {variant === "card" && (
          <span className="text-blue-600 text-sm font-medium">
            Request pricing
          </span>
        )}
      </div>
    )
  }

  // Business User
  if (userType === "business") {
    const hasDiscount = product.discount && product.discount > 0
    const hasVolumePricing = product.volumePricing && product.volumePricing.length > 0
    const isVerified = verificationStatus === 'approved'

    return (
      <div className="price-section">
        <div className="mb-3">
          {hasDiscount && product.listPrice && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-gray-500 line-through">
                ₹{product.listPrice.toLocaleString()}
              </span>
              <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded">
                Save {product.discount}%
              </span>
            </div>
          )}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              ₹{(product.businessPrice || product.listPrice || 0).toLocaleString()}
            </span>
            <span className="text-sm text-gray-600">per unit</span>
          </div>
        </div>

        {hasVolumePricing && variant === "detail" && product.volumePricing && (
          isVerified ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Volume Pricing Available
              </p>
              <div className="space-y-1">
                {product.volumePricing.map((tier, idx) => (
                  <p key={idx} className="text-sm text-gray-700">
                    <span className="font-medium">{tier.quantity}+ units:</span> ₹{tier.price.toLocaleString()} each
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4">
              <p className="text-sm font-semibold text-orange-900 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                Volume Pricing Locked
              </p>
              <p className="text-sm text-orange-800 mb-3">
                Verify your business identity to unlock volume discounts and bulk ordering.
              </p>
              <LocalizedClientLink
                href="/profile/verification"
                className="text-sm font-medium text-orange-700 hover:text-orange-800 underline"
              >
                Complete Verification &rarr;
              </LocalizedClientLink>
            </div>
          )
        )}

        {hasVolumePricing && variant === "card" && (
          <p className="text-xs text-blue-600 mt-2">
            {isVerified ? "Volume discounts available" : "Verify for volume discounts"}
          </p>
        )}
      </div>
    )
  }

  return null
}

