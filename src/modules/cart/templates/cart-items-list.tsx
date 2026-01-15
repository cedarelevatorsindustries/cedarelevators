/**
 * Cart Items List Component
 * Displays list of cart items
 */

'use client'

import { DerivedCartItem, UserType } from '@/types/cart.types'
import { CartItemCard } from '@/components/cart/cart-item-card'

interface CartItemsListProps {
    items: DerivedCartItem[]
    userType: UserType
    showPrices?: boolean
    summary?: any // Using any for now to avoid circular deps or complex imports, or ideally import CartSummary type
}

export default function CartItemsList({ items, userType }: CartItemsListProps) {
    return (
        <div className="space-y-4">
            {items.map((item) => (
                <CartItemCard key={item.id} item={item} />
            ))}
        </div>
    )

}

