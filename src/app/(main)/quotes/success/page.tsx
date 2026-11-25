'use client'

import QuoteConfirmationPage from '@/modules/checkout/components/quote-confirmation-page'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function QuoteSuccessContent() {
  const searchParams = useSearchParams()

  const quoteId = searchParams.get('quoteId') || 'UNKNOWN'
  const quoteNumber = searchParams.get('quoteNumber') || quoteId
  const itemsCountParam = searchParams.get('itemsCount')
  const parsedCount = itemsCountParam !== null ? parseInt(itemsCountParam, 10) : 0
  const itemsCount = !isNaN(parsedCount) && parsedCount >= 0 ? parsedCount : 0
  const requestTypeParam = searchParams.get('requestType')

  const accountTypeText =
    requestTypeParam === 'bulk'
      ? 'Bulk Multi-Product Quote'
      : requestTypeParam === 'single' || itemsCount === 1
        ? 'Single-Product Quote'
        : 'General Enquiry'

  const now = new Date()
  const submittedDate = now.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const submittedTime =
    now.toLocaleTimeString('en-IN', {
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
      accountType={accountTypeText}
      isVerified={false}
      itemsCount={itemsCount}
      priority="Standard"
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
