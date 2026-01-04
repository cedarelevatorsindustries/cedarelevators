/**
 * Optimized Cart Page with Lazy Loading
 * Cedar Elevator Industries
 * 
 * Performance optimizations:
 * - React Query for state management
 * - Lazy loading for heavy components
 * - Virtual scrolling for large carts
 * - Optimized re-renders
 */

'use client'

import { Suspense, lazy, useMemo } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import {
  useCartQuery,
  useCartWithPricing,
  useCartLockStatus
} from '@/lib/hooks/use-cart-query'
import { UserType, canSeePrice } from '@/types/cart.types'
import { CartLockWarning } from '@/components/cart/cart-lock-warning'
import { Skeleton } from '@/components/ui/skeleton'
import { ShoppingCart, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Lazy load heavy components
const CartItemsList = lazy(() => import('./cart-items-list'))
const CartSummary = lazy(() => import('./cart-summary-optimized'))
const EmptyCartState = lazy(() => import('./empty-cart-state'))

export default function CartPageOptimized() {
  const { isSignedIn } = useAuth()
  const { user } = useUser()

  // Determine user type
  const userType = useMemo<UserType>(() => {
    if (!isSignedIn) return 'guest'
    const accountType = user?.publicMetadata?.accountType as string || 'individual'
    if (accountType === 'business') {
      const verificationStatus = user?.publicMetadata?.verificationStatus as string
      return verificationStatus === 'verified' ? 'business_verified' : 'business_unverified'
    }
    return 'individual'
  }, [isSignedIn, user])

  // Fetch cart with React Query (automatic caching, refetching)
  const { data: cart, isLoading: cartLoading } = useCartQuery()
  const { data: cartData, isLoading: pricingLoading } = useCartWithPricing(userType)
  const { data: lockStatus } = useCartLockStatus(cart?.id)

  const isLoading = cartLoading || pricingLoading
  const derivedItems = cartData?.items || []
  const summary = cartData?.summary
  const showPrices = canSeePrice(userType)

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <CartPageSkeleton />
      </div>
    )
  }

  // Empty cart
  if (!cart || derivedItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<div>Loading...</div>}>
          <EmptyCartState />
        </Suspense>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/products"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Continue Shopping
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ShoppingCart className="h-8 w-8" />
              Shopping Cart
            </h1>
            <p className="text-gray-600 mt-1">
              {summary?.itemCount || 0} {summary?.itemCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
        </div>
      </div>

      {/* Lock Warning */}
      {lockStatus?.is_locked && (
        <CartLockWarning lockStatus={lockStatus} />
      )}

      {/* Cart Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items - 2/3 width on desktop */}
        <div className="lg:col-span-2">
          <Suspense fallback={<CartItemsSkeleton />}>
            <CartItemsList
              items={derivedItems}
              showPrices={showPrices}
              userType={userType}
            />
          </Suspense>
        </div>

        {/* Cart Summary - 1/3 width on desktop */}
        <div className="lg:col-span-1">
          <Suspense fallback={<CartSummarySkeleton />}>
            {summary && (
              <CartSummary
                summary={summary}
                showPrices={showPrices}
              />
            )}
          </Suspense>
        </div>
      </div>
    </div>
  )
}

// =====================================================
// Loading Skeletons
// =====================================================

function CartPageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <CartItemSkeleton />
          <CartItemSkeleton />
          <CartItemSkeleton />
        </div>
        <div className="lg:col-span-1">
          <CartSummarySkeleton />
        </div>
      </div>
    </div>
  )
}

function CartItemSkeleton() {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex gap-4">
        <Skeleton className="h-24 w-24 rounded" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
    </div>
  )
}

function CartSummarySkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <div className="pt-4 border-t">
        <Skeleton className="h-6 w-full" />
      </div>
      <Skeleton className="h-12 w-full" />
    </div>
  )
}

function CartItemsSkeleton() {
  return (
    <div className="space-y-4">
      <CartItemSkeleton />
      <CartItemSkeleton />
      <CartItemSkeleton />
    </div>
  )
}

