/**
 * Cart Summary Component
 * Displays order summary with pricing breakdown
 */

'use client'

import { CartSummary as CartSummaryType, UserType, canSeePrice, canCheckout, canRequestQuote } from '@/types/cart.types'
import { Button } from '@/components/ui/button'
import { ShoppingCart, FileText, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface CartSummaryProps {
  summary: CartSummaryType
  userType: UserType
  onCheckout?: () => void
  onRequestQuote?: () => void
}

export function CartSummary({ summary, userType, onCheckout, onRequestQuote }: CartSummaryProps) {
  const router = useRouter()
  const showPrice = canSeePrice(userType)
  const canDoCheckout = canCheckout(userType)
  const canQuote = canRequestQuote(userType)

  const handleCheckout = () => {
    if (canDoCheckout && summary.canCheckout) {
      onCheckout?.() || router.push('/checkout')
    }
  }

  const handleRequestQuote = () => {
    if (canQuote) {
      onRequestQuote?.() || router.push('/quotes/new')
    } else {
      router.push('/sign-in')
    }
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6 sticky top-4" data-testid="cart-summary">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

      {/* Item Count */}
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-600">Items ({summary.itemCount})</span>
        {showPrice ? (
          <span className="font-medium">₹{summary.subtotal.toLocaleString()}</span>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </div>

      {/* Discount */}
      {showPrice && summary.discount > 0 && (
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Discount</span>
          <span className="font-medium text-green-600">-₹{summary.discount.toLocaleString()}</span>
        </div>
      )}

      {/* Shipping */}
      {showPrice && (
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium">
            {summary.shipping === 0 ? 'FREE' : `₹${summary.shipping.toLocaleString()}`}
          </span>
        </div>
      )}

      {/* Tax */}
      {showPrice && summary.tax > 0 && (
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">GST (18%)</span>
          <span className="font-medium">₹{summary.tax.toLocaleString()}</span>
        </div>
      )}

      <div className="border-t my-4" />

      {/* Total */}
      <div className="flex justify-between text-lg font-bold mb-6">
        <span>Total</span>
        {showPrice ? (
          <span data-testid="cart-total">₹{summary.total.toLocaleString()}</span>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </div>

      {/* Warnings */}
      {summary.hasUnavailableItems && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4">
          Some items are no longer available. Please remove them to proceed.
        </div>
      )}

      {summary.hasOutOfStockItems && (
        <div className="bg-amber-50 text-amber-700 text-sm p-3 rounded-lg mb-4">
          Some items are out of stock. Please adjust quantities.
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Checkout Button (Verified Business Only) */}
        {canDoCheckout && (
          <Button
            onClick={handleCheckout}
            disabled={!summary.canCheckout}
            className="w-full"
            size="lg"
            data-testid="checkout-btn"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Proceed to Checkout
          </Button>
        )}

        {/* Request Quote Button (All Authenticated) */}
        {canQuote && (
          <Button
            onClick={handleRequestQuote}
            variant={canDoCheckout ? 'outline' : 'default'}
            className="w-full"
            size="lg"
            data-testid="request-quote-btn"
          >
            <FileText className="w-4 h-4 mr-2" />
            Request Quote
          </Button>
        )}

        {/* Guest/Unverified Business Messages */}
        {userType === 'guest' && (
          <div className="text-center text-sm text-gray-600">
            <Link href="/sign-in" className="text-orange-600 hover:underline">
              Sign in
            </Link>{' '}
            to view pricing and checkout
          </div>
        )}

        {userType === 'business_unverified' && (
          <div className="bg-blue-50 text-blue-700 text-sm p-3 rounded-lg">
            <Lock className="w-4 h-4 inline mr-1" />
            <Link href="/profile/verification" className="font-medium hover:underline">
              Verify your business
            </Link>{' '}
            to unlock checkout
          </div>
        )}

        {userType === 'individual' && !canDoCheckout && (
          <div className="bg-blue-50 text-blue-700 text-sm p-3 rounded-lg text-center">
            Individual accounts can request quotes. For direct orders, consider upgrading to a business account.
          </div>
        )}
      </div>

      {/* Continue Shopping */}
      <Link href="/catalog">
        <Button variant="ghost" className="w-full mt-4">
          Continue Shopping
        </Button>
      </Link>
    </div>
  )
}

