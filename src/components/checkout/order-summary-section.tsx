/**
 * Order Summary Section
 * Displays pricing breakdown in checkout sidebar
 */

'use client'

import { CheckoutSummary } from '@/lib/actions/checkout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Package, IndianRupee } from 'lucide-react'

interface OrderSummarySectionProps {
  items: any[]
  summary: CheckoutSummary
  currentStep: string
  onProceed?: () => void
  canProceed?: boolean
}

export function OrderSummarySection({
  items,
  summary,
  currentStep,
  onProceed,
  canProceed = false,
}: OrderSummarySectionProps) {
  return (
    <Card className="p-6 sticky top-24" data-testid="order-summary">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>

      {/* Items Count */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 pb-4 border-b">
        <Package className="w-4 h-4" />
        <span>{items.length} {items.length === 1 ? 'item' : 'items'}</span>
      </div>

      {/* Pricing Breakdown */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-gray-700">
          <span>Subtotal</span>
          <span className="font-medium">₹{summary.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>

        <div className="flex justify-between text-gray-700">
          <span>Shipping</span>
          <span className="font-medium">
            {summary.shipping === 0 ? (
              <span className="text-green-600">FREE</span>
            ) : (
              `₹${summary.shipping.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
            )}
          </span>
        </div>

        <div className="flex justify-between text-gray-700">
          <span>GST ({summary.gst_percentage}%)</span>
          <span className="font-medium">₹{summary.tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>

        {summary.discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span className="font-medium">-₹{summary.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        )}
      </div>

      <Separator className="my-4" />

      {/* Total */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-lg font-bold text-gray-900">Total</span>
        <div className="text-right">
          <div className="flex items-center gap-1 text-2xl font-bold text-gray-900">
            <IndianRupee className="w-5 h-5" />
            <span>{summary.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <p className="text-xs text-gray-500">Inclusive of all taxes</p>
        </div>
      </div>

      {/* Proceed Button (for address step) */}
      {currentStep === 'address' && onProceed && (
        <Button
          onClick={onProceed}
          disabled={!canProceed}
          className="w-full"
          size="lg"
          data-testid="proceed-to-review-btn"
        >
          Proceed to Review
        </Button>
      )}

      {/* Info Messages */}
      <div className="mt-6 space-y-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            ✓ Secure checkout powered by Razorpay
          </p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs text-green-700">
            ✓ Your order is protected by buyer protection
          </p>
        </div>
      </div>
    </Card>
  )
}

