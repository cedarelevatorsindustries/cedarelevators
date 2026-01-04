"use client"

import { ShieldCheck, ArrowRight } from "lucide-react"
import Link from "next/link"

interface StatusStripV2Props {
    isVerified: boolean
    isPending: boolean
    completionPercentage?: number
}

export function StatusStripV2({
    isVerified,
    isPending,
    completionPercentage = 80
}: StatusStripV2Props) {
    // Don't show if verified
    if (isVerified) {
        return null
    }

    return (
        <div className="mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-lg border border-blue-100 bg-blue-50/50 p-4 transition-all hover:shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="mt-0.5 rounded-full bg-blue-100 p-2 text-blue-600">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-slate-900 text-sm font-bold">
                            {isPending ? "Business Verification Pending" : "Complete Your Business Verification"}
                        </p>
                        <p className="text-slate-500 text-sm">
                            {completionPercentage}% Complete - Please upload your tax documents to unlock full pricing tiers.
                        </p>
                    </div>
                </div>
                <Link
                    href="/profile?tab=business"
                    className="group flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap"
                >
                    Complete Verification
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    )
}

