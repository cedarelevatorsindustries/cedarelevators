/**
 * Cart Summary Component
 * Displays order summary with pricing breakdown
 * Only for verified business users
 */

'use client'

import { CartSummary as CartSummaryType } from '@/types/cart.types'
import { Button } from '@/components/ui/button'
import { ShoppingCart, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface CartSummaryProps {
  summary: CartSummaryType
  onCheckout?: () => void
  onRequestQuote?: () => void
}

export function CartSummary({ summary, onCheckout, onRequestQuote }: CartSummaryProps) {
  const router = useRouter()

  const handleCheckout = () => {
    if (summary.canCheckout) {
      onCheckout?.() || router.push('/checkout')
    }
  }

  const handleRequestQuote = () => {
    onRequestQuote?.() || router.push('/quotes/new')
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6 sticky top-4" data-testid="cart-summary">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

      {/* Item Count */}
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-600">Items ({summary.itemCount})</span>
        <span className="font-medium">₹{summary.subtotal.toLocaleString()}</span>
      </div>

      {/* Discount */}
      {summary.discount > 0 && (
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Discount</span>
          <span className="font-medium text-green-600">-₹{summary.discount.toLocaleString()}</span>
        </div>
      )}

      {/* Shipping */}
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-600">Shipping</span>
        <span className="font-medium">
          {summary.shipping === 0 ? 'FREE' : `₹${summary.shipping.toLocaleString()}`}
        </span>
      </div>

      {/* Tax */}
      {summary.tax > 0 && (
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">GST (18%)</span>
          <span className="font-medium">₹{summary.tax.toLocaleString()}</span>
        </div>
      )}

      <div className="border-t my-4" />

      {/* Total */}
      <div className="flex justify-between text-lg font-bold mb-6">
        <span>Total</span>
        <span data-testid="cart-total">₹{summary.total.toLocaleString()}</span>
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

      {/* Action Buttons - Only for Verified Business Users */}
      <div className="grid grid-cols-2 gap-3">
        {/* Secondary: Request Quote */}
        <Button
          onClick={handleRequestQuote}
          variant="outline"
          className="w-full border-2 border-gray-300 hover:bg-gray-50"
          size="lg"
          data-testid="request-quote-btn"
        >
          <FileText className="w-4 h-4 mr-2" />
          Request Quote
        </Button>

        {/* Primary: Proceed to Checkout */}
        <Button
          onClick={handleCheckout}
          disabled={!summary.canCheckout}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          size="lg"
          data-testid="checkout-btn"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Checkout
        </Button>
      </div>

      {/* Continue Shopping Button */}
      <Link href="/catalog" className="block mt-3">
        <Button
          variant="outline"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white border-transparent"
          size="lg"
        >
          Continue Shopping
        </Button>
      </Link>
    </div>
  )
}
