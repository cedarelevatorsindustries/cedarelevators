/**
 * Checkout Eligibility Guard
 * Cedar Elevator Industries
 * 
 * Component that checks if user can proceed to checkout:
 * - Blocks guest users
 * - Blocks unverified business users
 * - Blocks if cart has issues
 */

'use client'

import { UserType, CartSummary } from '@/types/cart.types'
import { Lock, AlertCircle, ShieldAlert, PackageX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface CheckoutEligibilityGuardProps {
  userType: UserType
  summary: CartSummary
  children: React.ReactNode
}

export function CheckoutEligibilityGuard({
  userType,
  summary,
  children
}: CheckoutEligibilityGuardProps) {
  // Guest users - must sign in
  if (userType === 'guest') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Sign In Required
          </h1>
          <p className="text-gray-600 mb-6">
            Please sign in to proceed with checkout. We'll save your cart so you can pick up right where you left off.
          </p>
          <div className="space-y-3">
            <Link href="/sign-in?redirect=/checkout">
              <Button size="lg" className="w-full">
                Sign In to Continue
              </Button>
            </Link>
            <Link href="/sign-up?redirect=/checkout">
              <Button size="lg" variant="outline" className="w-full">
                Create Account
              </Button>
            </Link>
            <Link href="/cart">
              <Button size="sm" variant="ghost" className="w-full">
                Back to Cart
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Individual users - can only request quotes
  if (userType === 'individual') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Business Account Required
          </h1>
          <p className="text-gray-600 mb-6">
            Direct checkout is available for verified business accounts only. As an individual user, you can request a quote and we'll get back to you with pricing and availability.
          </p>
          <div className="space-y-3">
            <Link href="/request-quote?source=cart">
              <Button size="lg" className="w-full">
                Request Quote Instead
              </Button>
            </Link>
            <Link href="/business-signup">
              <Button size="lg" variant="outline" className="w-full">
                Upgrade to Business Account
              </Button>
            </Link>
            <Link href="/cart">
              <Button size="sm" variant="ghost" className="w-full">
                Back to Cart
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Unverified business - must verify
  if (userType === 'business_unverified') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Verification Required
          </h1>
          <p className="text-gray-600 mb-6">
            Your business account needs to be verified before you can place orders. This usually takes 1-2 business days. You can still request quotes while we verify your account.
          </p>
          <div className="space-y-3">
            <Link href="/profile/verification">
              <Button size="lg" className="w-full">
                Complete Verification
              </Button>
            </Link>
            <Link href="/request-quote?source=cart">
              <Button size="lg" variant="outline" className="w-full">
                Request Quote Instead
              </Button>
            </Link>
            <Link href="/cart">
              <Button size="sm" variant="ghost" className="w-full">
                Back to Cart
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Verified business - check cart state
  if (summary.itemCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PackageX className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Your Cart is Empty
          </h1>
          <p className="text-gray-600 mb-6">
            Add some products to your cart before proceeding to checkout.
          </p>
          <div className="space-y-3">
            <Link href="/catalog">
              <Button size="lg" className="w-full">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Check for cart issues
  if (summary.hasUnavailableItems || summary.hasOutOfStockItems) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Cart Has Issues
          </h1>
          <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
            {summary.hasUnavailableItems && (
              <div className="flex items-start gap-2 text-sm text-gray-700 mb-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                <span>Some items are no longer available</span>
              </div>
            )}
            {summary.hasOutOfStockItems && (
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                <span>Some items are out of stock</span>
              </div>
            )}
          </div>
          <p className="text-gray-600 mb-6">
            Please review your cart and remove or adjust problematic items before proceeding.
          </p>
          <div className="space-y-3">
            <Link href="/cart">
              <Button size="lg" className="w-full">
                Review Cart
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // All checks passed - render checkout
  return <>{children}</>
}
