'use client'

import { Building2, Mail, Phone, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import GoldVerificationBadge from '../gold-verification-badge'

interface BusinessOverviewMobileProps {
    user: {
        business?: {
            name?: string
            verification_status?: string
            verification_data?: {
                legal_business_name?: string | null
                gstin?: string | null
                pan?: string | null
                contact_person_phone?: string | null
            }
        } | null
        email?: string | null
        name?: string | null
    }
}

export default function BusinessOverviewMobile({ user }: BusinessOverviewMobileProps) {
    const isVerified = user.business?.verification_status === 'verified'
    const isPending = user.business?.verification_status === 'pending'
    const companyName = user.business?.verification_data?.legal_business_name || user.business?.name || user.name || 'Your Business'

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Verification Status Banner */}
            <div className={cn(
                "p-4 border-b",
                isVerified ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"
            )}>
                <div className="flex items-center gap-3">
                    {isVerified ? (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                        <p className={cn(
                            "font-semibold text-sm",
                            isVerified ? "text-green-900" : "text-orange-900"
                        )}>
                            {isVerified ? 'Business Verified' : isPending ? 'Verification Pending' : 'Business Not Verified'}
                        </p>
                        <p className={cn(
                            "text-xs mt-0.5",
                            isVerified ? "text-green-700" : "text-orange-700"
                        )}>
                            {isVerified
                                ? 'You have full access to B2B features'
                                : isPending
                                    ? 'We are reviewing your documents'
                                    : 'Complete verification to access B2B features'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Business Details Card */}
            <div className="p-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Building2 className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <span className="truncate">{companyName}</span>
                                    {isVerified && <GoldVerificationBadge size={18} />}
                                </h2>
                                <p className="text-sm text-gray-600">Business Profile</p>
                            </div>
                        </div>
                    </div>

                    {/* Business Details */}
                    <div className="p-4 space-y-4">
                        {/* Email */}
                        {user.email && (
                            <div className="flex items-start gap-3">
                                <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500 font-medium">Email</p>
                                    <p className="text-sm text-gray-900 break-all">{user.email}</p>
                                </div>
                            </div>
                        )}

                        {/* Phone */}
                        {user.business?.verification_data?.contact_person_phone && (
                            <div className="flex items-start gap-3">
                                <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500 font-medium">Phone</p>
                                    <p className="text-sm text-gray-900">{user.business.verification_data.contact_person_phone}</p>
                                </div>
                            </div>
                        )}

                        {/* GST Number */}
                        {user.business?.verification_data?.gstin && (
                            <div className="flex items-start gap-3">
                                <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500 font-medium">GST Number</p>
                                    <p className="text-sm text-gray-900 font-mono">{user.business.verification_data.gstin}</p>
                                </div>
                            </div>
                        )}

                        {/* PAN Number */}
                        {user.business?.verification_data?.pan && (
                            <div className="flex items-start gap-3">
                                <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500 font-medium">PAN Number</p>
                                    <p className="text-sm text-gray-900 font-mono">{user.business.verification_data.pan}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="p-4 border-t border-gray-200 space-y-2">
                        {!isVerified && (
                            <Link
                                href="/profile/business/verification"
                                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                            >
                                <CheckCircle className="w-4 h-4" />
                                {isPending ? 'View Verification Status' : 'Complete Verification'}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
