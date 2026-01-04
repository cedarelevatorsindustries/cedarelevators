/**
 * Add to Cart Button v2
 * Cedar Elevator Industries
 * 
 * Updated button component that works with new cart context:
 * - Supports guest and authenticated users
 * - Shows loading and success states
 * - Handles pricing visibility
 */

'use client'

import { useState } from 'react'
import { ShoppingCart, LoaderCircle, Check } from 'lucide-react'
import { useCart } from '@/contexts/cart-context'
import { useAuth } from '@clerk/nextjs'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface AddToCartButtonProps {
  productId: string
  productTitle: string
  productThumbnail?: string
  variantId?: string
  quantity?: number
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
  showSuccessState?: boolean
  fullWidth?: boolean
  onSuccess?: () => void
}

export function AddToCartButtonV2({
  productId,
  productTitle,
  productThumbnail,
  variantId,
  quantity = 1,
  size = 'md',
  disabled = false,
  className = '',
  showSuccessState = true,
  fullWidth = false,
  onSuccess
}: AddToCartButtonProps) {
  const { addItem } = useCart()
  const { isSignedIn } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleClick = async () => {
    if (disabled || isLoading) return

    setIsLoading(true)
    try {
      await addItem(productId, variantId || null, quantity)

      if (showSuccessState) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 2000)
      }

      onSuccess?.()
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6 text-base',
    lg: 'py-3.5 px-8 text-lg'
  }

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={cn(
        'font-semibold transition-all duration-200',
        sizeClasses[size],
        fullWidth && 'w-full',
        showSuccess && 'bg-green-600 hover:bg-green-700',
        className
      )}
      data-testid="add-to-cart-btn"
    >
      {isLoading ? (
        <>
          <LoaderCircle className="w-5 h-5 mr-2 animate-spin" />
          Adding...
        </>
      ) : showSuccess ? (
        <>
          <Check className="w-5 h-5 mr-2" />
          Added to Cart!
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5 mr-2" />
          Add to Cart
        </>
      )}
    </Button>
  )
}

