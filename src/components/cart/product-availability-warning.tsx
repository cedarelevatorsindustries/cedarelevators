/**
 * Product Availability Warning Component
 * Shows warnings for unavailable or out-of-stock items
 */

'use client'

import { AlertCircle, XCircle, Package } from 'lucide-react'
import { DerivedCartItem } from '@/types/cart.types'

interface ProductAvailabilityWarningProps {
  item: DerivedCartItem
}

export function ProductAvailabilityWarning({ item }: ProductAvailabilityWarningProps) {
  if (!item.is_available) {
    return (
      <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-md p-3 mt-2">
        <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-red-700">
          <p className="font-medium">Product No Longer Available</p>
          <p className="text-xs mt-1">
            This product has been discontinued or removed from our catalog. Please remove it from your cart.
          </p>
        </div>
      </div>
    )
  }

  if (!item.stock_available) {
    return (
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-md p-3 mt-2">
        <Package className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-700">
          <p className="font-medium">Insufficient Stock</p>
          <p className="text-xs mt-1">
            Only limited stock available. Please reduce quantity or contact us for availability.
          </p>
        </div>
      </div>
    )
  }

  return null
}

