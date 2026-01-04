/**
 * Empty Cart State Component
 */

'use client'

import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function EmptyCartState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <ShoppingCart className="w-24 h-24 text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md">
                Looks like you haven't added any items to your cart yet. Start shopping to find great products!
            </p>
            <Link href="/products">
                <Button size="lg">
                    Continue Shopping
                </Button>
            </Link>
        </div>
    )
}

