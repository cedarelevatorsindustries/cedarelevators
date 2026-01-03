/**
 * Checkout Eligibility Guard
 * Cedar Elevator Industries
 * 
 * Determines if user can proceed with checkout
 * and redirects if not eligible
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useUser } from '@clerk/nextjs'
import { useCart } from '@/contexts/cart-context'
import { UserType, canCheckout } from '@/types/cart.types'

interface CheckoutGuardResult {
  canProceed: boolean
  reason?: 'empty_cart' | 'guest_user' | 'individual_user' | 'unverified_business' | 'cart_issues'
  redirectTo?: string
}

export function useCheckoutEligibility(): CheckoutGuardResult {
  const { isSignedIn } = useAuth()
  const { user } = useUser()
  const { summary } = useCart()

  // Determine user type
  const getUserType = (): UserType => {
    if (!isSignedIn) return 'guest'
    const accountType = user?.publicMetadata?.accountType as string || 'individual'
    if (accountType === 'business') {
      const verificationStatus = user?.publicMetadata?.verificationStatus as string
      return verificationStatus === 'verified' ? 'business_verified' : 'business_unverified'
    }
    return 'individual'
  }

  const userType = getUserType()

  // Check 1: Empty cart
  if (summary.itemCount === 0) {
    return {
      canProceed: false,
      reason: 'empty_cart',
      redirectTo: '/cart'
    }
  }

  // Check 2: Guest user
  if (userType === 'guest') {
    return {
      canProceed: false,
      reason: 'guest_user',
      redirectTo: '/sign-in?redirect=/checkout'
    }
  }

  // Check 3: Individual user (should request quote instead)
  if (userType === 'individual') {
    return {
      canProceed: false,
      reason: 'individual_user',
      redirectTo: '/request-quote?source=checkout'
    }
  }

  // Check 4: Unverified business
  if (userType === 'business_unverified') {
    return {
      canProceed: false,
      reason: 'unverified_business',
      redirectTo: '/profile/verification?redirect=/checkout'
    }
  }

  // Check 5: Cart has issues (unavailable or out of stock items)
  if (summary.hasUnavailableItems || summary.hasOutOfStockItems) {
    return {
      canProceed: false,
      reason: 'cart_issues',
      redirectTo: '/cart'
    }
  }

  // Check 6: Can checkout flag
  if (!summary.canCheckout) {
    return {
      canProceed: false,
      reason: 'cart_issues',
      redirectTo: '/cart'
    }
  }

  // All checks passed
  return {
    canProceed: true
  }
}

/**
 * HOC/Component to guard checkout routes
 */
export function CheckoutGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { canProceed, redirectTo } = useCheckoutEligibility()

  useEffect(() => {
    if (!canProceed && redirectTo) {
      router.push(redirectTo)
    }
  }, [canProceed, redirectTo, router])

  if (!canProceed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
      </div>
    )
  }

  return <>{children}</>
}
