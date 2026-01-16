'use client'

import { useUser } from '@/lib/auth/client'
import { getUserPricingState } from '@/lib/utils/pricing-utils'
import QuoteConfirmationPage from '@/modules/checkout/components/quote-confirmation-page'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function QuoteSuccessContent() {
    const { user } = useUser()
    const userState = getUserPricingState(user)
    const searchParams = useSearchParams()

    // Get both UUID and formatted quote number
    const quoteId = searchParams.get('quoteId') || 'UNKNOWN'
    const quoteNumber = searchParams.get('quoteNumber') || quoteId

    // Determine account type display text
    const getAccountTypeText = () => {
        switch (userState) {
            case 'guest':
                return 'Guest'
            case 'individual':
                return 'Individual Account'
            case 'business_unverified':
                return 'Business Account'
            case 'business_verified':
                return 'Verified Business'
            default:
                return 'Guest'
        }
    }

    // Determine priority level
    const getPriority = () => {
        switch (userState) {
            case 'guest':
                return 'Low Priority'
            case 'individual':
                return 'Standard'
            case 'business_unverified':
                return 'Standard Business'
            case 'business_verified':
                return 'High Priority'
            default:
                return 'Standard'
        }
    }

    const now = new Date()
    const submittedDate = now.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
    const submittedTime = now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }) + ' IST'

    return (
        <QuoteConfirmationPage
            quoteId={quoteId}
            quoteNumber={quoteNumber}
            submittedDate={submittedDate}
            submittedTime={submittedTime}
            accountType={getAccountTypeText()}
            isVerified={userState === 'business_verified'}
            itemsCount={2}
            priority={getPriority()}
            expectedResponseTime="24–48 business hours"
        />
    )
}

export default function QuoteSuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
            <QuoteSuccessContent />
        </Suspense>
    )
}
