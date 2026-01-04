/**
 * Quantity Selector Component
 * Cedar Elevator Industries
 * 
 * Reusable quantity selector with increment/decrement
 */

'use client'

import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface QuantitySelectorProps {
  quantity: number
  onQuantityChange: (newQuantity: number) => void
  min?: number
  max?: number
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function QuantitySelector({
  quantity,
  onQuantityChange,
  min = 1,
  max = 999,
  disabled = false,
  size = 'md',
  className = ''
}: QuantitySelectorProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleIncrement = async () => {
    if (isUpdating || disabled || quantity >= max) return
    setIsUpdating(true)
    await onQuantityChange(quantity + 1)
    setIsUpdating(false)
  }

  const handleDecrement = async () => {
    if (isUpdating || disabled || quantity <= min) return
    setIsUpdating(true)
    await onQuantityChange(quantity - 1)
    setIsUpdating(false)
  }

  const sizeClasses = {
    sm: 'h-7 w-7',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  }

  const textSizeClasses = {
    sm: 'text-sm w-6',
    md: 'text-base w-8',
    lg: 'text-lg w-10'
  }

  return (
    <div className={cn('flex items-center gap-1 border rounded-lg', className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDecrement}
        disabled={isUpdating || disabled || quantity <= min}
        className={cn(sizeClasses[size], 'hover:bg-gray-100')}
        data-testid="quantity-decrement-btn"
        aria-label="Decrease quantity"
      >
        <Minus className="w-4 h-4" />
      </Button>
      <span 
        className={cn(
          'text-center font-medium',
          textSizeClasses[size],
          disabled && 'text-gray-400'
        )}
        data-testid="quantity-value"
      >
        {quantity}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleIncrement}
        disabled={isUpdating || disabled || quantity >= max}
        className={cn(sizeClasses[size], 'hover:bg-gray-100')}
        data-testid="quantity-increment-btn"
        aria-label="Increase quantity"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  )
}

