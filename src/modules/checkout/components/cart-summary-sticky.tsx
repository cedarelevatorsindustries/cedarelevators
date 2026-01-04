"use client"

import { ShoppingBag, Shield, Truck, Award } from 'lucide-react'
import Image from 'next/image'
import type { OrderSummary } from '../types'
import TrustBadges from './trust-badges'
import BulkDiscountCalculator from './bulk-discount-calculator'

interface CartSummaryStickyProps {
  summary: OrderSummary
  showBulkCalculator?: boolean
  ctaButton?: React.ReactNode
}

export default function CartSummarySticky({ 
  summary, 
  showBulkCalculator = false,
  ctaButton 
}: CartSummaryStickyProps) {
  const formatPrice = (amount: number) => {
    if (!summary.showPrices) return '₹XX,XX,XXX'
    return `₹${(amount / 100).toLocaleString('en-IN')}`
  }

  const totalQuantity = summary.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="bg-white rounded-xl shadow-lg sticky top-4 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Order Summary</h3>
          <span className="bg-white/20 px-2 py-1 rounded-full text-sm">
            {summary.items.length} items
          </span>
        </div>
      </div>

      {/* Items Preview */}
      <div className="p-4 border-b max-h-48 overflow-y-auto">
        <div className="space-y-3">
          {summary.items.slice(0, 3).map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {item.thumbnail ? (
                  <Image
                    src={item.thumbnail}
                    alt={item.title}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.title}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">×{item.quantity}</span>
                  <span className="text-sm font-semibold">{formatPrice(item.subtotal)}</span>
                </div>
              </div>
            </div>
          ))}
          {summary.items.length > 3 && (
            <p className="text-sm text-gray-500 text-center">
              +{summary.items.length - 3} more items
            </p>
          )}
        </div>
      </div>

      {/* Bulk Discount Calculator */}
      {showBulkCalculator && summary.showPrices && (
        <div className="p-4 border-b bg-green-50">
          <BulkDiscountCalculator totalQuantity={totalQuantity} />
        </div>
      )}

      {/* Price Breakdown */}
      <div className="p-4 space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span className="font-medium">{formatPrice(summary.subtotal)}</span>
        </div>
        
        {summary.bulkDiscount && summary.bulkDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Bulk Discount</span>
            <span className="font-medium">-{formatPrice(summary.bulkDiscount)}</span>
          </div>
        )}

        {summary.discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Coupon Discount</span>
            <span className="font-medium">-{formatPrice(summary.discount)}</span>
          </div>
        )}

        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span className="font-medium">
            {summary.shipping === 0 ? (
              <span className="text-green-600">FREE</span>
            ) : (
              formatPrice(summary.shipping)
            )}
          </span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>GST (18%)</span>
          <span className="font-medium">{formatPrice(summary.tax)}</span>
        </div>
      </div>

      {/* Total */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold text-gray-900">Total</span>
          <span className="text-2xl font-bold text-gray-900">{formatPrice(summary.total)}</span>
        </div>

        {/* CTA Button */}
        {ctaButton}
      </div>

      {/* Trust Badges */}
      <div className="p-4 border-t">
        <TrustBadges compact />
      </div>
    </div>
  )
}

