/**
 * Mobile Sticky CTA
 * Fixed bottom bar for mobile checkout
 */

'use client'

import { Loader2 } from 'lucide-react'
import type { CheckoutPermission } from '../types/checkout-ui'

interface MobileStickyCTAProps {
    permission: CheckoutPermission
    total: number
    onAction: () => void
    actionLabel: string
    isProcessing: boolean
    canProceed?: boolean
}

export function MobileStickyCTA({
    permission,
    total,
    onAction,
    actionLabel,
    isProcessing,
    canProceed = true
}: MobileStickyCTAProps) {
    // Don't show for blocked users
    if (permission === 'blocked_signin' || permission === 'blocked_verify') {
        return null
    }

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50 safe-area-bottom">
            <div className="flex items-center gap-4">
                {/* Total */}
                <div className="flex-1">
                    <p className="text-xs text-gray-500">Total Amount</p>
                    <p className="text-xl font-bold text-orange-600">
                        ₹{total.toLocaleString('en-IN')}
                    </p>
                </div>

                {/* Action Button */}
                <button
                    onClick={onAction}
                    disabled={!canProceed || isProcessing}
                    className="flex-1 py-3.5 px-6 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-sm">Processing...</span>
                        </>
                    ) : (
                        <span>{actionLabel}</span>
                    )}
                </button>
            </div>
        </div>
    )
}
