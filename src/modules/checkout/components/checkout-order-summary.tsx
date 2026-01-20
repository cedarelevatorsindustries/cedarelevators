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
  deliveryEta?: string  // Optional delivery timeline
}

export function CheckoutOrderSummary({
  cartSummary,
  checkoutSummary,
  canProceedToPayment,
  currentStep,
  onProceedToPayment,
  deliveryEta,
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
            <span className="text-gray-600">Items ({cartSummary.itemCount})</span>
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

          {/* Shipping - only show if there's a cost (> 0) */}
          {summary.shipping > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium" data-testid="shipping-amount">
                {formatCurrency(summary.shipping)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">GST ({summary.gst_percentage}%)</span>
            <span className="font-medium" data-testid="tax-amount">
              {formatCurrency(summary.tax)}
            </span>
          </div>

          <div className="pt-3 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-base font-semibold text-gray-900">You Pay</span>
                <p className="text-xs text-gray-500 mt-0.5">Includes GST</p>
              </div>
              <span className="text-2xl font-bold text-gray-900" data-testid="total-amount">
                {formatCurrency(summary.total)}
              </span>
            </div>
            {summary.shipping === 0 && (
              <p className="text-xs text-gray-500 mt-2">
                In addition, a delivery charge will apply
              </p>
            )}
          </div>
        </div>

        {/* Action Button */}
        {currentStep === 'address' && (
          <div className="p-6 border-t border-gray-200">
            <Button
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={!canProceedToPayment}
              onClick={onProceedToPayment}
              data-testid="proceed-to-payment-button"
            >
              <Lock className="w-5 h-5 mr-2" />
              Place Secure Order
            </Button>
            {!canProceedToPayment && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Please select delivery address
              </p>
            )}
          </div>
        )}

        {/* Trust Badges - Bullet Points with Checkmarks */}
        <div className="p-6 border-t border-gray-200 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 text-xs font-bold">🛡️</span>
            </div>
            <span>Purchase Protection</span>
          </div>
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
            <span>Secure Transaction</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 text-xs font-bold">✓</span>
            </div>
            <span>{deliveryEta}</span>
          </div>
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

