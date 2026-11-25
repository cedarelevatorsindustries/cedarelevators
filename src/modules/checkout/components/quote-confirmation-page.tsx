'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  Copy,
  Check,
  Mail,
  ArrowRight,
  AlertCircle,
  FileSearch,
  ClipboardCheck,
  Send,
} from 'lucide-react'
import { toast } from 'sonner'
import { QuotationPageShell } from '@/modules/quote/components/shared/quotation-page-shell'
import { QuotationStatusBadge } from '@/modules/quote/components/shared/quotation-status-badge'

export interface QuoteConfirmationProps {
  hasContext: boolean
  quoteNumber?: string | null
  submittedDateTime?: string | null
  requestTypeLabel?: string
  itemsCount?: number
  customerEmail?: string | null
  emailStatus?: 'sent' | 'failed'
}

const PROCESS_STAGES = [
  {
    icon: CheckCircle2,
    title: 'Request received',
    description: 'Your quotation request has been logged in our system.',
    active: true,
  },
  {
    icon: FileSearch,
    title: 'Requirements reviewed',
    description: 'Our technical team reviews specifications and component quantities.',
    active: false,
  },
  {
    icon: ClipboardCheck,
    title: 'Quotation prepared',
    description: 'Itemized commercial terms, taxes, and validity are finalized.',
    active: false,
  },
  {
    icon: Send,
    title: 'Quotation sent',
    description: 'Your formal PDF quotation is emailed and available to download.',
    active: false,
  },
]

export default function QuoteConfirmationPage({
  hasContext,
  quoteNumber,
  submittedDateTime,
  requestTypeLabel = 'Quotation Request',
  itemsCount = 0,
  customerEmail,
  emailStatus = 'sent',
}: QuoteConfirmationProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (!quoteNumber) return
    navigator.clipboard?.writeText(quoteNumber)
    setCopied(true)
    toast.success('Quotation reference copied')
    setTimeout(() => setCopied(false), 2000)
  }

  if (!hasContext || !quoteNumber) {
    return (
      <QuotationPageShell maxWidth="narrow">
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 sm:p-8 text-center space-y-5">
          <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto text-gray-600">
            <FileSearch className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="type-subsection text-gray-900">Quotation Status &amp; Confirmation</h1>
            <p className="type-body-sm text-gray-600">
              Your recent submission summary is not stored in this browser session. You can verify your email anytime to view all submitted requests.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/quotes/track"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#FF5A1F] hover:bg-[#e54e18] text-white rounded-lg text-sm transition-colors"
            >
              <span>Track Your Quotations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/quotes/new"
              className="flex-1 inline-flex items-center justify-center px-5 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-lg text-sm transition-colors"
            >
              Request a Quotation
            </Link>
          </div>
        </div>
      </QuotationPageShell>
    )
  }

  return (
    <QuotationPageShell maxWidth="default">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Centered Header */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-[0_1px_2px_rgba(17,24,39,0.03)] p-6 sm:p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center mx-auto text-emerald-700">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-1.5 max-w-lg mx-auto">
            <p className="type-eyebrow text-orange-600">Confirmation</p>
            <h1 className="type-section text-gray-900">Your Request Has Been Received</h1>
            <p className="type-body text-gray-600">
              Thank you for contacting Cedar Elevators. Your quotation reference has been recorded.
            </p>
          </div>

          {/* Reference Summary Strip */}
          <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div className="rounded-xl bg-gray-50/80 border border-gray-200/80 p-3.5 sm:col-span-2 lg:col-span-2 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Quotation Number</p>
                <p className="text-sm sm:text-base font-mono text-gray-900 truncate mt-0.5">
                  {quoteNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy quotation number"
                className="w-8 h-8 rounded-lg bg-white border border-gray-200 hover:border-gray-300 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="rounded-xl bg-gray-50/80 border border-gray-200/80 p-3.5">
              <p className="text-xs text-gray-500">Status</p>
              <div className="mt-1">
                <QuotationStatusBadge status="submitted" size="sm" />
              </div>
            </div>

            <div className="rounded-xl bg-gray-50/80 border border-gray-200/80 p-3.5">
              <p className="text-xs text-gray-500">Items Included</p>
              <p className="text-sm text-gray-900 mt-0.5">
                {itemsCount === 0
                  ? 'General Enquiry'
                  : `${itemsCount} ${itemsCount === 1 ? 'Product' : 'Products'}`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-xs text-gray-500">
            {submittedDateTime && <span>Submitted: {submittedDateTime}</span>}
            <span>Type: {requestTypeLabel}</span>
          </div>
        </div>

        {/* Email Confirmation Note */}
        {emailStatus === 'failed' ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <p>Your quotation request is saved cleanly, though automated email delivery experienced a temporary delay.</p>
              <p className="text-xs text-amber-800 mt-1">
                Save reference <span className="font-mono">{quoteNumber}</span> and check updates anytime via Track Your Quotations.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200/90 rounded-xl p-4 flex items-start gap-3">
            <Mail className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">
              Confirmation email sent to{' '}
              <span className="text-gray-900">{customerEmail || 'your provided email address'}</span>
              . Keep your quotation number handy or track status anytime without a password.
            </p>
          </div>
        )}

        {/* What Happens Next? */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-[0_1px_2px_rgba(17,24,39,0.03)] p-6">
          <h2 className="type-subsection text-gray-900 mb-5">What Happens Next?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROCESS_STAGES.map((stage, idx) => {
              const Icon = stage.icon
              return (
                <div
                  key={stage.title}
                  className={`rounded-xl border p-4 space-y-2 ${
                    stage.active
                      ? 'bg-orange-50/50 border-orange-200'
                      : 'bg-gray-50/50 border-gray-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        stage.active
                          ? 'bg-orange-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-xs text-gray-400 tabular-nums">0{idx + 1}</span>
                  </div>
                  <p className={`text-sm ${stage.active ? 'text-gray-900' : 'text-gray-700'}`}>
                    {stage.title}
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed">{stage.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
          <Link
            href="/quotes/track"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FF5A1F] hover:bg-[#e54e18] text-white rounded-lg text-sm transition-colors shadow-sm"
          >
            <span>Track Your Quotations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-lg text-sm transition-colors"
          >
            Browse Products
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 text-gray-600 hover:text-gray-900 text-sm transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </QuotationPageShell>
  )
}
