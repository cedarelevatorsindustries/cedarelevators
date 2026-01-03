/**
 * Optimized Cart Item Card
 * Cedar Elevator Industries
 * 
 * Performance optimizations:
 * - Memoized component
 * - Optimized re-renders
 * - Efficient event handlers
 */

'use client'

import { memo, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { DerivedCartItem, UserType } from '@/types/cart.types'
import { useUpdateCartItem, useRemoveCartItem } from '@/lib/hooks/use-cart-query'
import { formatCurrency } from '@/lib/utils/currency'
import { Minus, Plus, Trash2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CartItemCardProps {
  item: DerivedCartItem
  showPrices: boolean
  userType: UserType
}

export const CartItemCard = memo(function CartItemCard({ 
  item, 
  showPrices, 
  userType 
}: CartItemCardProps) {
  const updateMutation = useUpdateCartItem()
  const removeMutation = useRemoveCartItem()

  const handleQuantityChange = useCallback((newQuantity: number) => {
    if (newQuantity < 1) return
    updateMutation.mutate({ cartItemId: item.id, quantity: newQuantity })
  }, [item.id, updateMutation])

  const handleRemove = useCallback(() => {
    removeMutation.mutate(item.id)
  }, [item.id, removeMutation])

  const isUnavailable = !item.is_available
  const isOutOfStock = !item.stock_available

  return (
    <div className={`border rounded-lg p-4 ${isUnavailable || isOutOfStock ? 'bg-gray-50' : 'bg-white'}`}>
      <div className="flex gap-4">
        {/* Product Image */}
        <Link href={`/products/${item.product?.slug || ''}`} className="flex-shrink-0">
          <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-gray-100">
            {item.thumbnail ? (
              <Image
                src={item.thumbnail}
                alt={item.title}
                fill
                className="object-cover"
                sizes="96px"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No image
              </div>
            )}
          </div>
        </Link>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Link 
                href={`/products/${item.product?.slug || ''}`}
                className="font-semibold text-gray-900 hover:text-orange-600 transition-colors line-clamp-2"
              >
                {item.title}
              </Link>
              {item.variant && (
                <p className="text-sm text-gray-600 mt-1">
                  Variant: {item.variant.name}
                </p>
              )}
              {item.product?.sku && (
                <p className="text-xs text-gray-500 mt-1">
                  SKU: {item.product.sku}
                </p>
              )}
            </div>

            {/* Price (if visible) */}
            {showPrices && (
              <div className="text-right flex-shrink-0">
                <div className="font-bold text-lg text-gray-900">
                  {formatCurrency(item.line_total)}
                </div>
                {item.compare_at_price && item.compare_at_price > item.unit_price && (
                  <div className="text-sm">
                    <span className="line-through text-gray-500">
                      {formatCurrency(item.compare_at_price * item.quantity)}
                    </span>
                    {item.discount_percentage && (
                      <span className="ml-2 text-green-600 font-semibold">
                        {item.discount_percentage}% off
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status Badges */}
          {(isUnavailable || isOutOfStock) && (
            <div className="mt-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-600 font-medium">
                {isUnavailable ? 'Product unavailable' : 'Out of stock'}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex items-center justify-between">
            {/* Quantity Selector */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={item.quantity <= 1 || updateMutation.isPending}
                className="h-8 w-8 p-0"
                data-testid="decrease-quantity-btn"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium" data-testid="item-quantity">
                {item.quantity}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={updateMutation.isPending || isOutOfStock}
                className="h-8 w-8 p-0"
                data-testid="increase-quantity-btn"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Remove Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={removeMutation.isPending}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              data-testid="remove-item-btn"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
})
