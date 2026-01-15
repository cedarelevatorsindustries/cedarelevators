/**
 * Business Info Display
 * Shows company name and GST for verified businesses
 */

'use client'

import { Building2, FileText } from 'lucide-react'
import type { BusinessInfo } from '../types/checkout-ui'

interface BusinessInfoDisplayProps {
    info: BusinessInfo
}

export function BusinessInfoDisplay({ info }: BusinessInfoDisplayProps) {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Information</h2>

            <div className="space-y-3">
                <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-gray-500">Company Name</p>
                        <p className="font-medium text-gray-900">{info.company_name}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-gray-500">GST Number</p>
                        <p className="font-medium text-gray-900 font-mono">{info.gst_number}</p>
                    </div>
                </div>
            </div>

            {info.is_verified && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>Verified Business</span>
                    </div>
                </div>
            )}
        </div>
    )
}
