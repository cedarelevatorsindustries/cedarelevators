/**
 * Price Change Notice Component
 * Shows notice when product price has changed since adding to cart
 */

'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'

interface PriceChangeNoticeProps {
  oldPrice: number
  newPrice: number
  showPrices: boolean
}

export function PriceChangeNotice({ 
  oldPrice, 
  newPrice, 
  showPrices 
}: PriceChangeNoticeProps) {
  if (!showPrices || oldPrice === newPrice) {
    return null
  }

  const priceIncreased = newPrice > oldPrice
  const percentChange = Math.abs(((newPrice - oldPrice) / oldPrice) * 100).toFixed(0)

  return (
    <div className={`flex items-center gap-2 text-xs mt-1 ${
      priceIncreased ? 'text-red-600' : 'text-green-600'
    }`}>
      {priceIncreased ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      <span>
        Price {priceIncreased ? 'increased' : 'decreased'} by {percentChange}%
      </span>
    </div>
  )
}
