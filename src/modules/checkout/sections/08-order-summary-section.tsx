"use client"

import { ShoppingBag, Tag, Truck, Receipt, Percent } from 'lucide-react'
import Image from 'next/image'
import type { OrderSummary } from '../types'

interface OrderSummarySectionProps {
  summary: OrderSummary
  showEditLink?: boolean
  compact?: boolean
}

export default function OrderSummarySection({ 
  summary, 
  showEditLink = true,
  compact = false 
}: OrderSummarySectionProps) {
  const formatPrice = (amount: number) => {
    if (!summary.showPrices) return '₹XX,XX,XXX'
    return `₹${(amount / 100).toLocaleString('en-IN')}`
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
        <h3 className="font-bold text-gray-900">Order Summary</h3>
        {showEditLink && (
          <a href="/cart" className="text-sm text-blue-600 hover:underline">
            Edit Cart
          </a>
        )}
      </div>

      {/* Items */}
      <div className={`p-4 ${compact ? 'max-h-48 overflow-y-auto' : ''}`}>
        <div className="space-y-3">
          {summary.items.map((item) => (
            <div key={item.id} className="flex gap-3">
              {/* Thumbnail */}
              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {item.thumbnail ? (
                  <Image
                    src={item.thumbnail}
                    alt={item.title}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 line-clamp-2">
                  {item.title}
                </p>
                {item.variantTitle && (
                  <p className="text-xs text-gray-500">{item.variantTitle}</p>
                )}
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatPrice(item.subtotal)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="p-4 border-t space-y-2">
        {/* Subtotal */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-gray-900">{formatPrice(summary.subtotal)}</span>
        </div>

        {/* Bulk Discount */}
        {summary.bulkDiscount && summary.bulkDiscount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-600 flex items-center gap-1">
              <Percent className="w-4 h-4" />
              Bulk Discount
            </span>
            <span className="font-medium text-green-600">-{formatPrice(summary.bulkDiscount)}</span>
          </div>
        )}

        {/* Discount */}
        {summary.discount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-600 flex items-center gap-1">
              <Tag className="w-4 h-4" />
              Discount
            </span>
            <span className="font-medium text-green-600">-{formatPrice(summary.discount)}</span>
          </div>
        )}

        {/* Shipping */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 flex items-center gap-1">
            <Truck className="w-4 h-4" />
            Shipping
          </span>
          <span className="font-medium text-gray-900">
            {summary.shipping === 0 ? (
              <span className="text-green-600">FREE</span>
            ) : (
              formatPrice(summary.shipping)
            )}
          </span>
        </div>

        {/* GST Breakdown */}
        {summary.showPrices && summary.gstBreakdown && (
          <div className="pt-2 border-t border-dashed space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>CGST (9%)</span>
              <span>{formatPrice(summary.gstBreakdown.cgst)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>SGST (9%)</span>
              <span>{formatPrice(summary.gstBreakdown.sgst)}</span>
            </div>
          </div>
        )}

        {/* Tax */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 flex items-center gap-1">
            <Receipt className="w-4 h-4" />
            GST (18%)
          </span>
          <span className="font-medium text-gray-900">{formatPrice(summary.tax)}</span>
        </div>
      </div>

      {/* Total */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">Total</span>
          <span className="text-xl font-bold text-gray-900">{formatPrice(summary.total)}</span>
        </div>
        {!summary.showPrices && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            💡 Login as verified dealer to see actual prices
          </p>
        )}
      </div>
    </div>
  )
}
