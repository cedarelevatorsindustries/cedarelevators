/**
 * Checkout Order Summary
 * Shows cart items and pricing breakdown
 */

'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Lock, ShoppingBag } from 'lucide-react'
import type { CartSummary } from '@/types/cart.types'
import type { CheckoutSummary } from '@/lib/actions/checkout'

interface CheckoutOrderSummaryProps {
  cartSummary: CartSummary
  checkoutSummary: CheckoutSummary | null
  canProceedToPayment: boolean
  currentStep: string
  onProceedToPayment: () => void
}

export function CheckoutOrderSummary({
  cartSummary,
  checkoutSummary,
  canProceedToPayment,
  currentStep,
  onProceedToPayment,
}: CheckoutOrderSummaryProps) {
  const summary = checkoutSummary || {
    subtotal: cartSummary.subtotal,
    tax: cartSummary.tax,
    gst_percentage: 18,
    shipping: cartSummary.shipping,
    discount: cartSummary.discount,
    total: cartSummary.total,
    currency: 'INR'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: summary.currency,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="sticky top-24" data-testid="checkout-summary">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 text-gray-900">
            <ShoppingBag className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Order Summary</h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {cartSummary.itemCount} {cartSummary.itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>

        {/* Pricing Breakdown */}
        <div className="p-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium" data-testid="subtotal-amount">
              {formatCurrency(summary.subtotal)}
            </span>
          </div>

          {summary.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount</span>
              <span className="font-medium text-green-600" data-testid="discount-amount">
                -{formatCurrency(summary.discount)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium" data-testid="shipping-amount">
              {summary.shipping === 0 ? 'FREE' : formatCurrency(summary.shipping)}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">GST ({summary.gst_percentage}%)</span>
            <span className="font-medium" data-testid="tax-amount">
              {formatCurrency(summary.tax)}
            </span>
          </div>

          <div className="pt-3 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-base font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-gray-900" data-testid="total-amount">
                {formatCurrency(summary.total)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 text-right">
              (Inclusive of all taxes)
            </p>
          </div>
        </div>

        {/* Action Button */}
        {currentStep === 'address' && (
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <Button
              size="lg"
              className="w-full"
              disabled={!canProceedToPayment}
              onClick={onProceedToPayment}
              data-testid="proceed-to-payment-button"
            >
              Proceed to Payment
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            {!canProceedToPayment && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Please select delivery address
              </p>
            )}
          </div>
        )}

        {/* Security Badge */}
        <div className="p-4 bg-green-50 border-t border-green-100">
          <div className="flex items-center justify-center gap-2 text-sm text-green-700">
            <Lock className="w-4 h-4" />
            <span className="font-medium">Secure Checkout</span>
          </div>
          <p className="text-xs text-center text-green-600 mt-1">
            Your payment information is encrypted
          </p>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-4 bg-blue-50 rounded-lg p-4 text-sm">
        <p className="text-blue-900 font-medium mb-2">✓ Business Verified</p>
        <ul className="space-y-1 text-blue-700 text-xs">
          <li>• Invoice will be sent to your registered email</li>
          <li>• Credit terms as per agreement</li>
          <li>• Priority support for B2B orders</li>
        </ul>
      </div>
    </div>
  )
}

