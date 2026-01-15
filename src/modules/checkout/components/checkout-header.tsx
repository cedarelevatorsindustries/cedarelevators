/**
 * Checkout Header Component
 * Shows source badge, quote number, and user verification status
 */

'use client'

import { CheckCircle2, FileText, ShoppingCart } from 'lucide-react'
import type { CheckoutSource, CheckoutPermission } from '../types/checkout-ui'

interface CheckoutHeaderProps {
    source: CheckoutSource
    sourceId: string
    quoteNumber?: string
    userType: 'guest' | 'individual' | 'business_unverified' | 'business_verified'
    permission: CheckoutPermission
}

export function CheckoutHeader({
    source,
    quoteNumber,
    userType,
    permission
}: CheckoutHeaderProps) {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>

                    {/* Order Source */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        {source === 'quote' ? (
                            <>
                                <FileText className="w-4 h-4" />
                                <span>Order Source: Quote</span>
                            </>
                        ) : (
                            <>
                                <ShoppingCart className="w-4 h-4" />
                                <span>Order Source: Cart</span>
                            </>
                        )}
                    </div>

                    {/* Quote Number */}
                    {source === 'quote' && quoteNumber && (
                        <div className="mt-2 inline-block px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                            Based on Quote: {quoteNumber}
                        </div>
                    )}
                </div>

                {/* User Status Badges */}
                <div className="flex flex-col items-end gap-2">
                    {permission === 'full_checkout' && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Verified Business</span>
                        </div>
                    )}

                    {permission === 'individual_checkout' && (
                        <div className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                            Individual Buyer
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
