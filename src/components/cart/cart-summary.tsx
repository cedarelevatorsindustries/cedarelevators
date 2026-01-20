/**
 * Cart Summary Component
 * Displays order summary with pricing breakdown
 * Only for verified business users
 */

'use client'

import { useMemo } from 'react'
import { CartSummary as CartSummaryType } from '@/types/cart.types'
import { Button } from '@/components/ui/button'
import { AlertCircle, FileText, ShoppingCart, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface CartSummaryProps {
  summary: CartSummaryType
  onCheckout?: () => void
  onRequestQuote?: () => void
  onClearCart?: () => void
  gstPercentage?: number  // Optional GST percentage to display
  deliveryEta?: string  // Optional delivery timeline (e.g., "2-10 business days")
}

export function CartSummary({ summary, onCheckout, onRequestQuote, onClearCart, gstPercentage, deliveryEta }: CartSummaryProps) {
  console.log('[CartSummary] deliveryEta prop:', deliveryEta)
  const router = useRouter()

  const handleCheckout = () => {
    if (summary.canCheckout) {
      onCheckout?.() || router.push('/checkout')
    }
  }

  const handleRequestQuote = () => {
    onRequestQuote?.() || router.push('/quotes/new')
  }

  // Calculate GST percentage from tax and subtotal if not provided
  const displayGstPercentage = gstPercentage ||
    (summary.subtotal > 0 ? Math.round((summary.tax / summary.subtotal) * 100) : 18)

  // Calculate savings
  const totalSavings = useMemo(() => {
    return summary.discount
  }, [summary.discount])

  return (
    <div className="bg-white rounded-lg p-6 sticky top-4 shadow-sm border-none" data-testid="cart-summary">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>

      {/* Summary Items */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Items ({summary.itemCount})</span>
          <span className="font-medium">₹{summary.subtotal.toLocaleString()}</span>
        </div>

        {summary.discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount</span>
            <span className="font-medium">-₹{summary.discount.toLocaleString()}</span>
          </div>
        )}

        {/* Shipping - only show if there's a cost (> 0) */}
        {summary.shipping > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium">₹{summary.shipping.toLocaleString()}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">GST ({displayGstPercentage}%)</span>
          <span className="font-medium">₹{Math.round(summary.tax).toLocaleString()}</span>
        </div>
      </div>

      {/* Savings message - positioned before total */}
      {totalSavings > 0 && (
        <div className="mb-3">
          <p className="text-sm text-green-600 font-medium">
            You saved ₹{totalSavings.toLocaleString()} on this order
          </p>
        </div>
      )}

      {/* Total */}
      <div className="border-t pt-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-lg font-bold text-gray-900">Total</span>
          <span className="text-2xl font-bold text-gray-900" data-testid="cart-total">
            ₹{Math.round(summary.total).toLocaleString()}
          </span>
        </div>

        {/* Info message about delivery charge */}
        <p className="text-xs text-gray-500">
          In addition, a delivery charge will apply
        </p>
      </div>

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

      {/* Single Checkout Button */}
      <div className="mb-6">
        <Button
          onClick={handleCheckout}
          disabled={!summary.canCheckout}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          size="lg"
          data-testid="checkout-btn"
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          Proceed to Checkout
        </Button>
      </div>

      {/* Trust Badges - Bullet Points with Checkmarks */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <span className="text-green-600 text-xs font-bold">✓</span>
          </div>
          <span>Cash on Delivery Available</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <span className="text-green-600 text-xs font-bold">✓</span>
          </div>
          <span>GST Invoice included</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <span className="text-green-600 text-xs font-bold">✓</span>
          </div>
          <span>Secured Payment</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <span className="text-green-600 text-xs font-bold">✓</span>
          </div>
          <span>{deliveryEta}</span>
        </div>
      </div>

      {/* Bottom Links */}
      <div className="pt-4 border-t space-y-3">
        {/* Need more? Request bulk pricing */}
        <div className="text-center">
          <Button
            onClick={handleRequestQuote}
            variant="outline"
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200 italic"
            size="sm"
          >
            <FileText className="h-4 w-4 mr-2" />
            Need more? Request bulk pricing
          </Button>
        </div>

        {/* Continue Shopping */}
        <div className="text-center">
          <Link href="/catalog" className="text-blue-600 hover:text-blue-700 hover:underline text-sm font-medium block py-2">
            Continue Shopping
          </Link>
        </div>

        {/* Clear Cart */}
        {onClearCart && (
          <Button
            onClick={onClearCart}
            variant="ghost"
            className="w-full text-gray-600 hover:text-gray-700 hover:bg-gray-100"
            data-testid="clear-cart-btn"
          >
            Clear Cart
          </Button>
        )}
      </div>
    </div>
  )
}
