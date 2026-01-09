/**
 * Empty Cart State Component
 */

'use client'

import { EmptyState } from '@/components/ui/empty-state'

export default function EmptyCartState() {
    return (
        <EmptyState
            image="/empty-states/cart.png"
            title="Your cart is empty"
            description="Looks like you haven't added any items to your cart yet. Start shopping to find great products!"
            actionLabel="Continue Shopping"
            actionLink="/catalog"
        />
    )
}

