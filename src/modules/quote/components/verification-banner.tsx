"use client"

import { AlertCircle, ArrowRight } from "lucide-react"

export const VerificationBanner = ({
    isVerified = false,
    isPending = false
}: {
    isVerified?: boolean
    isPending?: boolean
}) => {
    if (isVerified) return null

    return (
        <div className="mx-4 mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">
                    {isPending ? "Verification Pending" : "Complete Business Profile"}
                </h3>
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                    {isPending
                        ? "We are reviewing your documents. You'll be notified soon."
                        : "Upload GST & PAN to unlock wholesale prices & credit limit."}
                </p>
                {!isPending && (
                    <button className="flex items-center gap-2 text-sm font-bold text-blue-700 bg-white px-4 py-2 rounded-lg border border-blue-200 shadow-sm hover:bg-blue-50 transition-colors">
                        Verify Now <ArrowRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    )
}
