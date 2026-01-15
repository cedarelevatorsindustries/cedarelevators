/**
 * Pricing Summary (Locked)
 * Displays order totals - locked from editing
 */

'use client'

import { Lock } from 'lucide-react'
import type { CheckoutSummary, CheckoutSource, CheckoutPermission } from '../types/checkout-ui'

interface PricingSummaryLockedProps {
    summary: CheckoutSummary
    source: CheckoutSource
    permission?: CheckoutPermission
}

export function PricingSummaryLocked({
    summary,
    source,
    permission
}: PricingSummaryLockedProps) {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Pricing Summary</h2>
                <Lock className="w-5 h-5 text-gray-400" />
            </div>

            {/* Pricing Breakdown */}
            <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-medium">₹{summary.subtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between text-gray-700">
                    <span>Tax (18% GST)</span>
                    <span className="font-medium">₹{summary.tax.toLocaleString('en-IN')}</span>
                </div>

                {summary.shipping > 0 && (
                    <div className="flex justify-between text-gray-700">
                        <span>Shipping</span>
                        <span className="font-medium">₹{summary.shipping.toLocaleString('en-IN')}</span>
                    </div>
                )}

                {summary.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span className="font-medium">-₹{summary.discount.toLocaleString('en-IN')}</span>
                    </div>
                )}
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-orange-600">
                        ₹{summary.total.toLocaleString('en-IN')}
                    </span>
                </div>
            </div>

            {/* Individual Pricing Note */}
            {permission === 'individual_checkout' && (
                <p className="text-sm text-gray-500 mt-4 p-3 bg-gray-50 rounded-lg">
                    Individual pricing. Business accounts may receive bulk benefits and GST invoices.
                </p>
            )}

            {/* Quote Source Note */}
            {source === 'quote' && (
                <p className="text-sm text-blue-600 mt-2">
                    Pricing as approved in the quote.
                </p>
            )}
        </div>
    )
}
