'use client'

import React, { Suspense, useSyncExternalStore } from 'react'
import { useSearchParams } from 'next/navigation'
import QuoteConfirmationPage from '@/modules/checkout/components/quote-confirmation-page'
import {
  readLastQuoteSuccess,
  formatIndiaDateTime,
} from '@/modules/quote/components/shared/quote-confirmation-storage'

const emptySubscribe = () => () => {}

function QuoteSuccessContent() {
  const searchParams = useSearchParams()
  const queryQuoteNumber = searchParams.get('quoteNumber')?.trim() || null
  const queryItemsParam = searchParams.get('itemsCount')
  const queryRequestType = searchParams.get('requestType')
  const queryEmailStatus = searchParams.get('emailStatus')

  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  if (!isClient) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto h-64 rounded-2xl bg-white border border-gray-200 animate-pulse" />
      </div>
    )
  }

  const stored = readLastQuoteSuccess(queryQuoteNumber)
  const effectiveQuoteNumber = stored?.quoteNumber || queryQuoteNumber
  const parsedCount =
    queryItemsParam !== null && !Number.isNaN(parseInt(queryItemsParam, 10))
      ? Math.max(0, parseInt(queryItemsParam, 10))
      : 0
  const effectiveItemsCount =
    typeof stored?.itemsCount === 'number' ? stored.itemsCount : parsedCount

  const effectiveRequestType = stored?.requestType || queryRequestType || 'general'
  const requestTypeLabel =
    effectiveRequestType === 'bulk' || effectiveItemsCount >= 2
      ? 'Multi-Product Quotation'
      : effectiveRequestType === 'single' || effectiveItemsCount === 1
        ? 'Single-Product Quotation'
        : 'General Enquiry'

  const submittedDateTime = stored?.submittedAt
    ? formatIndiaDateTime(stored.submittedAt)
    : effectiveQuoteNumber
      ? formatIndiaDateTime(new Date().toISOString())
      : null

  const emailStatus: 'sent' | 'failed' =
    stored?.emailStatus === 'failed' || queryEmailStatus === 'failed' ? 'failed' : 'sent'

  return (
    <QuoteConfirmationPage
      hasContext={Boolean(effectiveQuoteNumber)}
      quoteNumber={effectiveQuoteNumber}
      submittedDateTime={submittedDateTime}
      requestTypeLabel={requestTypeLabel}
      itemsCount={effectiveItemsCount}
      customerEmail={stored?.customerEmail || null}
      emailStatus={emailStatus}
    />
  )
}

export default function QuoteSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAF9] pt-24 pb-16 px-4">
          <div className="max-w-3xl mx-auto h-64 rounded-2xl bg-white border border-gray-200 animate-pulse" />
        </div>
      }
    >
      <QuoteSuccessContent />
    </Suspense>
  )
}
