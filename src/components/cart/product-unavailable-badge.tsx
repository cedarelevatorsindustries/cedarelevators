/**
 * Product Unavailable Badge
 * Cedar Elevator Industries
 * 
 * Badge to show when product is unavailable or out of stock
 */

'use client'

import { AlertCircle, PackageX, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

type UnavailabilityReason = 'deleted' | 'out_of_stock' | 'discontinued' | 'temporarily_unavailable'

interface ProductUnavailableBadgeProps {
  reason: UnavailabilityReason
  className?: string
  showIcon?: boolean
}

export function ProductUnavailableBadge({ 
  reason, 
  className = '',
  showIcon = true 
}: ProductUnavailableBadgeProps) {
  const configs = {
    deleted: {
      icon: PackageX,
      text: 'Product No Longer Available',
      color: 'text-red-700',
      bg: 'bg-red-50',
      border: 'border-red-200'
    },
    out_of_stock: {
      icon: AlertCircle,
      text: 'Out of Stock',
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200'
    },
    discontinued: {
      icon: PackageX,
      text: 'Discontinued',
      color: 'text-gray-700',
      bg: 'bg-gray-50',
      border: 'border-gray-200'
    },
    temporarily_unavailable: {
      icon: Clock,
      text: 'Temporarily Unavailable',
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      border: 'border-blue-200'
    }
  }

  const config = configs[reason]
  const Icon = config.icon

  return (
    <div 
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium',
        config.color,
        config.bg,
        config.border,
        className
      )}
      data-testid="product-unavailable-badge"
    >
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span>{config.text}</span>
    </div>
  )
}
