/**
 * Cart Item Card Component
 * Displays individual cart item with actions
 */

'use client'

import { DerivedCartItem, UserType, canSeePrice } from '@/types/cart.types'
import { useCart } from '@/contexts/cart-context'
import { Minus, Plus, Trash2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface CartItemCardProps {
  item: DerivedCartItem
  userType: UserType
}

export function CartItemCard({ item, userType }: CartItemCardProps) {
  const { updateQuantity, removeItem } = useCart()
  const [isUpdating, setIsUpdating] = useState(false)
  const showPrice = canSeePrice(userType)

  const handleIncrement = async () => {
    if (isUpdating) return
    setIsUpdating(true)
    await updateQuantity(item.id, item.product_id, item.quantity + 1, item.variant_id || undefined)
    setIsUpdating(false)
  }

  const handleDecrement = async () => {
    if (isUpdating || item.quantity <= 1) return
    setIsUpdating(true)
    await updateQuantity(item.id, item.product_id, item.quantity - 1, item.variant_id || undefined)
    setIsUpdating(false)
  }

  const handleRemove = async () => {
    if (isUpdating) return
    setIsUpdating(true)
    await removeItem(item.id, item.product_id, item.variant_id || undefined)
    setIsUpdating(false)
  }

  return (
    <div className="flex gap-4 py-4 border-b" data-testid="cart-item-card">
      {/* Product Image */}
      <Link href={`/products/${item.product?.slug || ''}`} className="flex-shrink-0">
        <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
          {item.thumbnail ? (
            <Image
              src={item.thumbnail}
              alt={item.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <Link 
          href={`/products/${item.product?.slug || ''}`}
          className="font-medium text-gray-900 hover:text-orange-600 line-clamp-2"
        >
          {item.title}
        </Link>
        
        {item.variant && (
          <p className="text-sm text-gray-500 mt-1">{item.variant.name}</p>
        )}

        {item.product?.sku && (
          <p className="text-xs text-gray-400 mt-1">SKU: {item.product.sku}</p>
        )}

        {/* Availability Warnings */}
        {!item.is_available && (
          <div className="flex items-center gap-1 mt-2 text-xs text-red-600">
            <AlertCircle className="w-3 h-3" />
            <span>Product no longer available</span>
          </div>
        )}

        {item.is_available && !item.stock_available && (
          <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
            <AlertCircle className="w-3 h-3" />
            <span>Insufficient stock</span>
          </div>
        )}

        {/* Price (if visible) */}
        {showPrice && item.is_available && (
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">
                ₹{item.unit_price.toLocaleString()}
              </span>
              {item.compare_at_price && item.compare_at_price > item.unit_price && (
                <>
                  <span className="text-sm text-gray-400 line-through">
                    ₹{item.compare_at_price.toLocaleString()}
                  </span>
                  {item.discount_percentage && (
                    <span className="text-xs font-medium text-green-600">
                      {item.discount_percentage}% OFF
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Sign in message for guest/unverified */}
        {!showPrice && (
          <p className="text-sm text-gray-500 mt-2">
            {userType === 'guest' ? 'Sign in to view pricing' : 'Verify your business account to view pricing'}
          </p>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2 border rounded-lg">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDecrement}
            disabled={isUpdating || item.quantity <= 1 || !item.is_available}
            className="h-8 w-8"
            data-testid="decrease-quantity-btn"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="w-8 text-center font-medium" data-testid="item-quantity">
            {item.quantity}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleIncrement}
            disabled={isUpdating || !item.stock_available || !item.is_available}
            className="h-8 w-8"
            data-testid="increase-quantity-btn"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          disabled={isUpdating}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          data-testid="remove-item-btn"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Remove
        </Button>

        {/* Line Total */}
        {showPrice && item.is_available && (
          <div className="mt-2 font-semibold text-right" data-testid="item-line-total">
            ₹{item.line_total.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  )
}
