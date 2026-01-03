/**
 * Optimized Cart Summary
 * Cedar Elevator Industries
 * 
 * Performance optimizations:
 * - Memoized calculations
 * - Efficient re-renders
 */

'use client'

import { memo, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { CartSummary as CartSummaryType, UserType, canCheckout } from '@/types/cart.types'
import { formatCurrency } from '@/lib/utils/currency'
import { Button } from '@/components/ui/button'
import { ShoppingBag, FileText, AlertCircle } from 'lucide-react'
import { useClearCart } from '@/lib/hooks/use-cart-query'
import Link from 'next/link'

interface CartSummaryProps {
  summary?: CartSummaryType
  showPrices: boolean
  userType: UserType
  cartId: string
}

export default memo(function CartSummary({ 
  summary, 
  showPrices, 
  userType,
  cartId 
}: CartSummaryProps) {
  const router = useRouter()
  const clearCartMutation = useClearCart()
  const canProceedToCheckout = canCheckout(userType)

  const checkoutBlocked = useMemo(() => {
    if (!summary) return true
    return (
      !canProceedToCheckout ||
      summary.hasUnavailableItems ||
      summary.hasOutOfStockItems ||
      summary.itemCount === 0
    )
  }, [summary, canProceedToCheckout])

  const handleCheckout = () => {
    router.push('/checkout')
  }

  const handleRequestQuote = () => {
    router.push('/request-quote?from=cart')
  }

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      clearCartMutation.mutate(cartId)
    }
  }

  if (!summary) return null

  return (
    <div className="bg-white border rounded-lg p-6 sticky top-4">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

      {/* Summary Items */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Items ({summary.itemCount})</span>
          {showPrices ? (
            <span className="font-medium">{formatCurrency(summary.subtotal)}</span>
          ) : (
            <span className="text-gray-400">Sign in to view</span>
          )}
        </div>

        {showPrices && summary.discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount</span>
            <span className="font-medium">-{formatCurrency(summary.discount)}</span>
          </div>
        )}

        {showPrices && (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">
                {summary.shipping === 0 ? 'FREE' : formatCurrency(summary.shipping)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (GST 18%)</span>
              <span className="font-medium">{formatCurrency(summary.tax)}</span>
            </div>
          </>
        )}
      </div>

      {/* Total */}
      {showPrices && (
        <div className="border-t pt-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-orange-600">
              {formatCurrency(summary.total)}
            </span>
          </div>
        </div>
      )}

      {/* Warnings */}
      {summary.hasUnavailableItems && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-800">
              Some items are no longer available. Please remove them to continue.
            </p>
          </div>
        </div>
      )}

      {summary.hasOutOfStockItems && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              Some items are out of stock. Please adjust quantities or request a quote.
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {/* Checkout Button */}
        {canProceedToCheckout ? (
          <Button
            onClick={handleCheckout}
            disabled={checkoutBlocked}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            size="lg"
            data-testid="checkout-btn"
          >
            <ShoppingBag className="h-5 w-5 mr-2" />
            Proceed to Checkout
          </Button>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
            <p className="text-sm text-blue-800 mb-2">
              {userType === 'guest' 
                ? 'Sign in to proceed with checkout'
                : userType === 'individual'
                ? 'Business account required for checkout'
                : 'Account verification required for checkout'
              }
            </p>
            {userType === 'guest' && (
              <Link href="/sign-in">
                <Button variant="outline" size="sm" className="w-full">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Request Quote Button */}
        {userType !== 'guest' && (
          <Button
            onClick={handleRequestQuote}
            variant="outline"
            className="w-full"
            size="lg"
            data-testid="request-quote-btn"
          >
            <FileText className="h-5 w-5 mr-2" />
            Request Quote
          </Button>
        )}

        {/* Clear Cart */}
        <Button
          onClick={handleClearCart}
          variant="ghost"
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
          disabled={clearCartMutation.isPending}
          data-testid="clear-cart-btn"
        >
          Clear Cart
        </Button>
      </div>

      {/* Trust Badges */}
      <div className="mt-6 pt-6 border-t">
        <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              ✓
            </div>
            <span>Secure Checkout</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              ✓
            </div>
            <span>Free Shipping</span>
          </div>
        </div>
      </div>
    </div>
  )
})
