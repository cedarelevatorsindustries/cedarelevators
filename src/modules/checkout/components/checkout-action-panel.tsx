/**
 * Checkout Action Panel
 * Role-based CTA - the critical component that adapts to user permissions
 */

'use client'

import { Loader2, ShieldCheck, AlertCircle, LogIn } from 'lucide-react'
import type { CheckoutPermission } from '../types/checkout-ui'
import { IndividualUpgradeNudge } from './individual-upgrade-nudge'
import { IndividualLimitsWarning } from './individual-limits-warning'

interface CheckoutActionPanelProps {
    permission: CheckoutPermission
    onPlaceOrder: () => void
    onVerify: () => void
    onRegister: () => void
    onSignIn: () => void
    isProcessing: boolean
    total: number
    limitViolations?: string[]
    canProceed?: boolean
}

export function CheckoutActionPanel({
    permission,
    onPlaceOrder,
    onVerify,
    onRegister,
    onSignIn,
    isProcessing,
    total,
    limitViolations = [],
    canProceed = true
}: CheckoutActionPanelProps) {

    // A. Full Checkout (Verified Business)
    if (permission === 'full_checkout') {
        return (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-24">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Total Amount</span>
                        <span className="text-2xl font-bold text-orange-600">
                            ₹{total.toLocaleString('en-IN')}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500">Inclusive of all taxes</p>
                </div>

                <button
                    onClick={onPlaceOrder}
                    disabled={!canProceed || isProcessing}
                    className="w-full py-4 px-6 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        'Place Order'
                    )}
                </button>

                <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verified Business Account</span>
                </div>
            </div>
        )
    }

    // B. Individual Checkout (with limits)
    if (permission === 'individual_checkout') {
        // B1. Limits Exceeded
        if (limitViolations.length > 0) {
            return (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-24">
                    <IndividualLimitsWarning
                        violations={limitViolations}
                        onUpgrade={onRegister}
                    />
                </div>
            )
        }

        // B2. Within Limits
        return (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-24">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Total Amount</span>
                        <span className="text-2xl font-bold text-orange-600">
                            ₹{total.toLocaleString('en-IN')}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500">Inclusive of all taxes</p>
                </div>

                <button
                    onClick={onPlaceOrder}
                    disabled={!canProceed || isProcessing}
                    className="w-full py-4 px-6 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        'Place Order'
                    )}
                </button>

                {/* Non-blocking upgrade nudge */}
                <IndividualUpgradeNudge onUpgrade={onRegister} />
            </div>
        )
    }

    // C. Blocked - Verify Business
    if (permission === 'blocked_verify') {
        return (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-24">
                <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-amber-900 mb-1">Verification Required</h4>
                            <p className="text-sm text-amber-800">
                                Business verification is required to place orders.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onVerify}
                    className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    <ShieldCheck className="w-5 h-5" />
                    Complete Verification
                </button>
            </div>
        )
    }

    // D. Blocked - Sign In
    if (permission === 'blocked_signin') {
        return (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-24">
                <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-red-900 mb-1">Sign In Required</h4>
                            <p className="text-sm text-red-800">
                                Please sign in to continue with checkout.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onSignIn}
                    className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    <LogIn className="w-5 h-5" />
                    Sign In
                </button>
            </div>
        )
    }

    return null
}
