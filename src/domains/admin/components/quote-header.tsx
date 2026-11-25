'use client'

import { Quote } from '@/types/b2b/quote'
import { ArrowLeft, Calendar, Eye, FileText, Loader2, Send, Download } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getRequestTypeBadge } from './quote-helpers'

interface QuoteHeaderProps {
  quote: Quote
  statusConfig: { color: string; icon: any; label: string }
  userTypeBadge: { color: string; label: string; icon: any }
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
  const StatusIcon = statusConfig.icon
  const reqBadge = getRequestTypeBadge(quote.request_type)
  const ReqIcon = reqBadge.icon

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <Link
        href="/admin/quotes"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Quotations
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-mono">
              #{quote.quote_number}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.color}`}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              {statusConfig.label}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${reqBadge.color}`}
            >
              <ReqIcon className="w-3.5 h-3.5" />
              {reqBadge.label}
            </span>
            {(quote.current_revision || 0) > 0 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-900 text-white">
                Revision {quote.current_revision}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Submitted {format(new Date(quote.created_at), 'dd MMM yyyy, hh:mm a')}
            </span>
            {quote.issued_at && (
              <span className="text-green-700 font-medium">
                Issued {format(new Date(quote.issued_at), 'dd MMM yyyy')}
              </span>
            )}
            {quote.valid_until && (
              <span className="text-gray-700">
                Valid Until: {format(new Date(quote.valid_until), 'dd MMM yyyy')}
              </span>
            )}
          </div>
        </div>

        {/* Operational Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {canReview && (
            <Button
              onClick={onStartReview}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              Mark Under Review
            </Button>
          )}

          <Button variant="outline" onClick={onPreviewPdf} className="border-gray-300">
            <FileText className="w-4 h-4 mr-2" />
            Preview PDF
          </Button>

          {(quote.current_revision || 0) > 0 && (
            <Button variant="outline" onClick={onDownloadLatestPdf} className="border-gray-300">
              <Download className="w-4 h-4 mr-2" />
              Issued PDF (Rev {quote.current_revision})
            </Button>
          )}

          {canIssue && (
            <Button
              onClick={onIssueClick}
              disabled={isSaving || hasUnsavedChanges}
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold"
            >
              <Send className="w-4 h-4 mr-2" />
              {isReissue ? `Reissue Revision ${(quote.current_revision || 1) + 1}` : 'Issue Quotation'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
