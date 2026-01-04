/**
 * Cart Items List with Virtual Scrolling
 * Cedar Elevator Industries
 * 
 * Optimized for large carts (100+ items):
 * - Virtual scrolling for performance
 * - Only renders visible items
 * - Smooth scrolling experience
 */

'use client'

import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'
import { DerivedCartItem, UserType } from '@/types/cart.types'
import { CartItemCard } from './cart-item-card-optimized'

interface CartItemsListProps {
  items: DerivedCartItem[]
  showPrices: boolean
  userType: UserType
}

export default function CartItemsList({ 
  items, 
  showPrices, 
  userType 
}: CartItemsListProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  // Use virtual scrolling for large lists (more than 20 items)
  const shouldUseVirtual = items.length > 20

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 160, // Estimated height of each cart item
    overscan: 5, // Number of items to render outside viewport
    enabled: shouldUseVirtual
  })

  // Regular rendering for small carts
  if (!shouldUseVirtual) {
    return (
      <div className="space-y-4">
        {items.map((item) => (
          <CartItemCard 
            key={item.id}
            item={item}
            showPrices={showPrices}
            userType={userType}
          />
        ))}
      </div>
    )
  }

  // Virtual scrolling for large carts
  const virtualItems = virtualizer.getVirtualItems()

  return (
    <div
      ref={parentRef}
      className="space-y-4 overflow-auto"
      style={{
        height: `${Math.min(items.length * 160, 800)}px`, // Max height 800px
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => {
          const item = items[virtualItem.index]
          return (
            <div
              key={item.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <CartItemCard 
                item={item}
                showPrices={showPrices}
                userType={userType}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

