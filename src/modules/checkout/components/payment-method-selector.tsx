/**
 * Payment Method Selector
 * Shows COD as the only payment option
 */

'use client'

import { IndianRupee } from 'lucide-react'

interface PaymentMethodSelectorProps {
    disabled?: boolean
}

export function PaymentMethodSelector({ disabled = false }: PaymentMethodSelectorProps) {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>

            {/* COD Option (only option) */}
            <div className="border-2 border-orange-500 bg-orange-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                    {/* Selected Radio */}
                    <div className="w-5 h-5 rounded-full border-2 border-orange-500 bg-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2.5 h-2.5 bg-white rounded-full" />
                    </div>

                    {/* Payment Details */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <IndianRupee className="w-5 h-5 text-orange-600" />
                            <span className="font-semibold text-gray-900">Cash on Delivery (COD)</span>
                        </div>
                        <p className="text-sm text-gray-600">
                            Payment will be collected at delivery or pickup.
                        </p>
                    </div>
                </div>
            </div>

            {/* Info Note */}
            <p className="text-sm text-gray-500 mt-4 p-3 bg-gray-50 rounded-lg">
                Online payment and other methods will be available soon.
            </p>
        </div>
    )
}
