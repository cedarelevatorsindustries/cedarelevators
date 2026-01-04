/**
 * Cart Summary Optimized Component
 * Displays cart summary with totals
 */

'use client'

import { CartSummary } from '@/types/cart.types'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface CartSummaryOptimizedProps {
    summary: CartSummary
    showPrices: boolean
    onCheckout?: () => void
}

export default function CartSummaryOptimized({
    summary,
    showPrices,
    onCheckout
}: CartSummaryOptimizedProps) {
    return (
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-bold">Order Summary</h2>

            {showPrices ? (
                <>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span>Subtotal ({summary.itemCount} items)</span>
                            <span>₹{summary.subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        {summary.discount > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Discount</span>
                                <span>-₹{summary.discount.toLocaleString('en-IN')}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>{summary.shipping === 0 ? 'FREE' : `₹${summary.shipping.toLocaleString('en-IN')}`}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tax</span>
                            <span>₹{summary.tax.toLocaleString('en-IN')}</span>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span>₹{summary.total.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </>
            ) : (
                <p className="text-gray-600">Sign in to view pricing</p>
            )}

            {onCheckout && (
                <Button
                    onClick={onCheckout}
                    className="w-full"
                    disabled={!summary.canCheckout}
                >
                    Proceed to Checkout
                </Button>
            )}
        </div>
    )
}

