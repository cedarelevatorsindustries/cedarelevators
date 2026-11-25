'use client'

import { useState } from 'react'
import { Quote } from '@/types/b2b/quote'
import {
  ArrowLeft,
  Calendar,
  Eye,
  FileText,
  Loader2,
  Send,
  Download,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { getRequestTypeBadge } from './quote-helpers'

interface QuoteHeaderProps {
  quote: Quote
  statusConfig: { color: string; icon: any; label: string }
  isSaving: boolean
  canReview: boolean
  canIssue: boolean
  isReissue: boolean
  hasUnsavedChanges: boolean
  onStartReview: () => void
  onPreviewPdf: () => void
  onDownloadLatestPdf: () => void
  onIssueClick: () => void
}

export function QuoteHeader({
  quote,
  statusConfig,
  isSaving,
  canReview,
  canIssue,
  isReissue,
  hasUnsavedChanges,
  onStartReview,
  onPreviewPdf,
  onDownloadLatestPdf,
  onIssueClick,
}: QuoteHeaderProps) {
  const [copied, setCopied] = useState(false)
  const StatusIcon = statusConfig.icon
  const itemCount = quote.items?.length || 0
  const reqBadge = getRequestTypeBadge(quote.request_type, itemCount)
  const ReqIcon = reqBadge.icon

  const customerName =
    quote.requester_name ||
    quote.guest_name ||
    quote.company_details?.contact_name ||
    'Customer'

  const hasIssuedRevision = (quote.current_revision || 0) > 0
  const hasSavedPricing =
    Number(quote.estimated_total || 0) > 0 &&
    ['reviewing', 'quoted', 'approved'].includes(quote.status)

  const handleCopy = () => {
    navigator.clipboard?.writeText(quote.quote_number)
    setCopied(true)
    toast.success(`Copied ${quote.quote_number}`)
    setTimeout(() => setCopied(false), 1800)
  }

  // Canonical progress steps derived directly from backend state
  const isSubmittedStage = ['submitted', 'pending'].includes(quote.status)
  const isReviewStage = quote.status === 'reviewing'
  const isQuotedStage = ['quoted', 'approved', 'converted'].includes(quote.status)
  const isRejected = quote.status === 'rejected'
  const isExpired = quote.status === 'expired'

  const stages = [
    {
      label: 'Received',
      state: isSubmittedStage ? 'current' : 'done',
    },
    {
      label: 'Under Review',
      state: isReviewStage && !hasSavedPricing ? 'current' : isReviewStage || isQuotedStage ? 'done' : 'pending',
    },
    {
      label: 'Pricing Prepared',
      state: isReviewStage && hasSavedPricing ? 'current' : isQuotedStage ? 'done' : 'pending',
    },
    {
      label: 'Quoted',
      state: isQuotedStage ? 'done' : 'pending',
    },
  ] as const

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/admin/quotes"
          className="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Quotations</span>
        </Link>
        <span className="text-xs text-gray-500">
          Last updated {format(new Date(quote.updated_at || quote.created_at), 'dd MMM yyyy, hh:mm a')}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 font-mono">
              #{quote.quote_number}
            </h1>
            <button
              type="button"
              onClick={handleCopy}
              title="Copy quotation reference"
              aria-label="Copy quotation reference"
              className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color}`}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              {statusConfig.label}
            </span>

            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${reqBadge.color}`}
            >
              <ReqIcon className="w-3.5 h-3.5" />
              {reqBadge.label}
            </span>

            {hasIssuedRevision && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-900 text-white">
                Revision {quote.current_revision}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs sm:text-sm text-gray-600">
            <span className="font-medium text-gray-900">{customerName}</span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              Submitted {format(new Date(quote.created_at), 'dd MMM yyyy, hh:mm a')}
            </span>
            {quote.issued_at && (
              <span className="text-emerald-700 font-medium">
                Issued {format(new Date(quote.issued_at), 'dd MMM yyyy')}
              </span>
            )}
            {quote.valid_until && (
              <span className="text-gray-700">
                Valid until {format(new Date(quote.valid_until), 'dd MMM yyyy')}
              </span>
            )}
          </div>
        </div>

        {/* State-Driven Document & Workflow Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {canReview && (
            <Button
              onClick={onStartReview}
              disabled={isSaving}
              size="sm"
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              ) : (
                <Eye className="w-4 h-4 mr-1.5" />
              )}
              Start Review
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={onPreviewPdf} className="border-gray-300">
            <FileText className="w-4 h-4 mr-1.5" />
            Preview Draft
          </Button>

          {hasIssuedRevision && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDownloadLatestPdf}
              className="border-gray-300"
            >
              <Download className="w-4 h-4 mr-1.5" />
              Issued PDF (Rev {quote.current_revision})
            </Button>
          )}

          {canIssue && (
            <Button
              size="sm"
              onClick={onIssueClick}
              disabled={isSaving || hasUnsavedChanges}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Send className="w-4 h-4 mr-1.5" />
              {isReissue
                ? `Reissue Revision ${(quote.current_revision || 1) + 1}`
                : 'Issue & Send Quotation'}
            </Button>
          )}
        </div>
      </div>

      {/* Compact Workflow Progress Bar */}
      <div className="pt-4 border-t border-gray-100">
        {isRejected ? (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 flex items-center gap-2 text-xs sm:text-sm text-red-800">
            <XCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>
              <strong>Request Rejected</strong>
              {quote.rejected_reason ? ` — ${quote.rejected_reason}` : ''}
            </span>
          </div>
        ) : isExpired ? (
          <div className="rounded-lg bg-gray-100 border border-gray-200 px-4 py-2.5 flex items-center gap-2 text-xs sm:text-sm text-gray-700">
            <AlertCircle className="w-4 h-4 text-gray-600 shrink-0" />
            <span>
              <strong>Quotation Expired</strong> — validity period elapsed
              {quote.valid_until ? ` on ${format(new Date(quote.valid_until), 'dd MMM yyyy')}` : ''}.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {stages.map((stage, index) => (
              <div
                key={stage.label}
                className={`rounded-lg border px-3 py-2 flex items-center gap-2 text-xs ${
                  stage.state === 'done'
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                    : stage.state === 'current'
                      ? 'bg-orange-50/70 border-orange-300 text-orange-800 font-medium'
                      : 'bg-gray-50 border-gray-200 text-gray-500'
                }`}
              >
                {stage.state === 'done' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <span
                    className={`w-4 h-4 rounded-full text-[10px] inline-flex items-center justify-center shrink-0 tabular-nums ${
                      stage.state === 'current'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </span>
                )}
                <span className="truncate">{stage.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
