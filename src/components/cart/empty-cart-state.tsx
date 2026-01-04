/**
 * Empty Cart State Component
 * Displays when cart is empty
 */

'use client'

import { ShoppingBag, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UserType } from '@/types/cart.types'

interface EmptyCartStateProps {
  userType: UserType
}

export function EmptyCartState({ userType }: EmptyCartStateProps) {
  const isGuest = userType === 'guest'

  return (
    <div className="text-center max-w-md mx-auto py-16" data-testid="empty-cart-state">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShoppingBag className="w-12 h-12 text-gray-400" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-3">
        Your Cart is Empty
      </h2>
      <p className="text-gray-600 mb-8">
        {isGuest 
          ? 'Sign in to sync your cart across devices or continue shopping as guest.'
          : 'Add products to your cart and they will appear here.'}
      </p>
      <div className="flex gap-3 justify-center">
        <Link href="/catalog">
          <Button size="lg">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Browse Products
          </Button>
        </Link>
        {isGuest && (
          <Link href="/sign-in">
            <Button size="lg" variant="outline">
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}

