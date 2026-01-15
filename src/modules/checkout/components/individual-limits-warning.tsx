/**
 * Individual Limits Warning
 * Shows when order exceeds individual purchase limits
 */

'use client'

import { AlertTriangle } from 'lucide-react'

interface IndividualLimitsWarningProps {
    violations: string[]
    onUpgrade: () => void
}

export function IndividualLimitsWarning({
    violations,
    onUpgrade
}: IndividualLimitsWarningProps) {
    return (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <div>
                    <h3 className="font-semibold text-amber-900 mb-2">
                        Order Exceeds Individual Purchase Limits
                    </h3>
                    <ul className="space-y-1 text-sm text-amber-800">
                        {violations.map((violation, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <span className="text-amber-600 mt-1">•</span>
                                <span>{violation}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <p className="text-sm text-amber-900 mb-4">
                Upgrade to a business account to remove these limitations and enjoy additional benefits.
            </p>

            <button
                onClick={onUpgrade}
                className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors"
            >
                Upgrade to Business Account
            </button>
        </div>
    )
}
