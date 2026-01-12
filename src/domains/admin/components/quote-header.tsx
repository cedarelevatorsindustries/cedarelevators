'use client'

import { Quote } from '@/types/b2b/quote'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Calendar, CheckCircle, Eye, ShoppingCart, XCircle, FileWarning, Info } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface QuoteHeaderProps {
    quote: Quote
    statusConfig: {
        color: string
        icon: any
        label: string
    }
    userTypeBadge: {
        color: string
        label: string
        icon: any
    }
    canApprove: boolean
    canConvert: boolean
    isUnverifiedBusiness: boolean
    isIndividual: boolean
    isGuest: boolean
    isSaving: boolean
    onStartReview: () => void
    onApprove: () => void
    onReject: () => void
    onConvert: () => void
}

export function QuoteHeader({
    quote,
    statusConfig,
    userTypeBadge,
    canApprove,
    canConvert,
    isUnverifiedBusiness,
    isIndividual,
    isGuest,
    isSaving,
    onStartReview,
    onApprove,
    onReject,
    onConvert
}: QuoteHeaderProps) {
    const StatusIcon = statusConfig.icon
    const UserTypeIcon = userTypeBadge.icon

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            {/* Back Button */}
            <Link
                href="/admin/quotes"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm font-medium"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to List
            </Link>

            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <h1 className="text-3xl font-bold text-gray-900">Quote #{quote.quote_number}</h1>
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${statusConfig.color}`}>
                            <StatusIcon className="w-4 h-4" />
                            {statusConfig.label}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            Created {format(new Date(quote.created_at), 'dd MMM yyyy')}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${userTypeBadge.color}`}>
                            <UserTypeIcon className="w-3.5 h-3.5" />
                            User Type: {userTypeBadge.label}
                        </span>
                    </div>

                    {/* Conditional messaging based on user type */}
                    {quote.status === 'approved' && (
                        <>
                            {isUnverifiedBusiness && (
                                <div className="inline-flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                                    <FileWarning className="w-4 h-4" />
                                    <span className="font-medium">Business verification required to place order</span>
                                </div>
                            )}
                            {isIndividual && (
                                <div className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                                    <Info className="w-4 h-4" />
                                    <span className="font-medium">Individual accounts cannot place orders. Encourage business registration if applicable.</span>
                                </div>
                            )}
                            {isGuest && (
                                <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                                    <Info className="w-4 h-4" />
                                    <span className="font-medium">Quote sent via email</span>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Primary CTA */}
                <div className="flex items-center gap-2">
                    {quote.status === 'pending' && (
                        <Button
                            onClick={onStartReview}
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                            Start Review
                        </Button>
                    )}
                    {canConvert && (
                        <Button
                            onClick={onConvert}
                            disabled={isSaving}
                            className="bg-[#FF6B35] hover:bg-[#FF5722] text-white"
                        >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Convert to Order
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
