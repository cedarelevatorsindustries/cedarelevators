/**
 * Individual Upgrade Nudge
 * Non-blocking CTA to upgrade to business account
 */

'use client'

import { TrendingUp } from 'lucide-react'

interface IndividualUpgradeNudgeProps {
    onUpgrade: () => void
}

export function IndividualUpgradeNudge({ onUpgrade }: IndividualUpgradeNudgeProps) {
    return (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <p className="text-sm text-gray-700 mb-2">
                        Buying for business or bulk needs?{' '}
                        <strong className="text-gray-900">Upgrade to Business account</strong>{' '}
                        for bulk pricing, GST invoices, and faster checkout.
                    </p>
                    <button
                        type="button"
                        onClick={onUpgrade}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 underline"
                    >
                        Upgrade to Business →
                    </button>
                </div>
            </div>
        </div>
    )
}
