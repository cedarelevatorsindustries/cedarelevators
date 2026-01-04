"use client"

import { Percent, TrendingUp } from 'lucide-react'

interface BulkDiscountCalculatorProps {
  totalQuantity: number
}

const DISCOUNT_TIERS = [
  { minQty: 5, discount: 5, label: '5+ units' },
  { minQty: 10, discount: 10, label: '10+ units' },
  { minQty: 25, discount: 15, label: '25+ units' },
  { minQty: 50, discount: 20, label: '50+ units' },
]

export default function BulkDiscountCalculator({ totalQuantity }: BulkDiscountCalculatorProps) {
  const currentTier = DISCOUNT_TIERS.filter(t => totalQuantity >= t.minQty).pop()
  const nextTier = DISCOUNT_TIERS.find(t => totalQuantity < t.minQty)

  const unitsToNextTier = nextTier ? nextTier.minQty - totalQuantity : 0

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Percent className="w-4 h-4 text-green-600" />
        <span className="font-semibold text-green-800 text-sm">Bulk Discount</span>
      </div>

      {/* Current Discount */}
      {currentTier ? (
        <div className="bg-green-100 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-green-800 font-medium">Your Discount</span>
            <span className="text-xl font-bold text-green-700">{currentTier.discount}% OFF</span>
          </div>
          <p className="text-xs text-green-700 mt-1">
            Applied on {totalQuantity} units
          </p>
        </div>
      ) : (
        <div className="bg-gray-100 rounded-lg p-3 mb-3">
          <p className="text-sm text-gray-600">
            Add {DISCOUNT_TIERS[0].minQty - totalQuantity} more units to unlock {DISCOUNT_TIERS[0].discount}% discount
          </p>
        </div>
      )}

      {/* Next Tier Progress */}
      {nextTier && (
        <div>
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Next tier: {nextTier.discount}% off</span>
            <span>{unitsToNextTier} more units needed</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ 
                width: `${Math.min((totalQuantity / nextTier.minQty) * 100, 100)}%` 
              }}
            />
          </div>
        </div>
      )}

      {/* Tier List */}
      <div className="mt-3 pt-3 border-t border-green-200">
        <p className="text-xs text-green-700 font-medium mb-2">Discount Tiers:</p>
        <div className="flex flex-wrap gap-2">
          {DISCOUNT_TIERS.map((tier, index) => (
            <span 
              key={index}
              className={`
                px-2 py-1 rounded text-xs font-medium
                ${totalQuantity >= tier.minQty 
                  ? 'bg-green-600 text-white' 
                  : 'bg-green-100 text-green-700'
                }
              `}
            >
              {tier.label}: {tier.discount}%
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

