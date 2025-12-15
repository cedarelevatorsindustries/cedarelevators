"use client"

import { Check } from "lucide-react"

interface PriceTier {
  minQuantity: number
  maxQuantity?: number
  pricePerUnit: number
  discount?: number
}

interface BulkPricingTableProps {
  tiers: PriceTier[]
  currentQuantity?: number
  showPrice: boolean
  currency?: string
}

export default function BulkPricingTable({
  tiers,
  currentQuantity = 1,
  showPrice,
  currency = "INR"
}: BulkPricingTableProps) {
  if (tiers.length === 0) return null

  const formatPrice = (amount: number) => {
    return `₹${(amount / 100).toLocaleString("en-IN")}`
  }

  const isCurrentTier = (tier: PriceTier) => {
    if (tier.maxQuantity) {
      return currentQuantity >= tier.minQuantity && currentQuantity <= tier.maxQuantity
    }
    return currentQuantity >= tier.minQuantity
  }

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3">
        <h3 className="text-white font-semibold">Bulk Pricing</h3>
        <p className="text-blue-100 text-sm">Save more when you buy in bulk</p>
      </div>

      <div className="divide-y divide-gray-200">
        {tiers.map((tier, index) => {
          const isCurrent = isCurrentTier(tier)
          
          return (
            <div
              key={index}
              className={`
                px-4 py-3 flex items-center justify-between
                ${isCurrent ? "bg-blue-50 border-l-4 border-blue-600" : ""}
              `}
            >
              <div className="flex items-center gap-3">
                {isCurrent && (
                  <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                )}
                <div>
                  <p className={`font-medium ${isCurrent ? "text-blue-900" : "text-gray-900"}`}>
                    {tier.minQuantity}
                    {tier.maxQuantity ? ` - ${tier.maxQuantity}` : "+"} units
                  </p>
                  {tier.discount && (
                    <p className="text-sm text-green-600 font-medium">
                      Save {tier.discount}%
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right">
                {showPrice ? (
                  <>
                    <p className={`font-bold ${isCurrent ? "text-blue-900" : "text-gray-900"}`}>
                      {formatPrice(tier.pricePerUnit)}
                    </p>
                    <p className="text-xs text-gray-600">per unit</p>
                  </>
                ) : (
                  <p className="text-gray-400 font-semibold">₹ XXX</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {!showPrice && (
        <div className="bg-orange-50 px-4 py-3 text-sm text-orange-700">
          <p>
            <strong>Login or verify your account</strong> to see bulk pricing
          </p>
        </div>
      )}
    </div>
  )
}
