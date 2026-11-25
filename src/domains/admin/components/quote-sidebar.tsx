'use client'

import { Quote, QuoteAuditLog } from '@/types/b2b/quote'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Mail, RefreshCw, History, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { formatINR } from '@/lib/utils/quote-pricing'

interface QuoteSidebarProps {
  quote: Quote
  auditLogs?: QuoteAuditLog[]
  isRetryingNotificationId?: string | null
  onDownloadRevisionPdf: (revisionNumber?: number) => void
  onRetryNotification: (notificationId: string) => void
}

const NOTIFICATION_EVENT_LABELS: Record<string, string> = {
  customer_submission_confirmation: 'Submission Confirmation Email',
  admin_new_quote_alert: 'Admin New Quote Alert',
  customer_quote_issued: 'Issued Quotation Email',
  customer_quote_rejected: 'Rejection Notification Email',
}

function getAuditMeta(actionType: string): { label: string; category: string } {
  const map: Record<string, { label: string; category: string }> = {
    created: { label: 'Quotation Submitted', category: 'Submission' },
    opened_for_review: { label: 'Review Started', category: 'Workflow' },
    status_changed: { label: 'Status Updated', category: 'Workflow' },
    pricing_updated: { label: 'Pricing Updated', category: 'Pricing' },
    item_pricing_updated: { label: 'Line Item Updated', category: 'Pricing' },
    internal_note_added: { label: 'Internal Note Added', category: 'Note' },
    message_sent: { label: 'Customer Response Updated', category: 'Communication' },
    pdf_generated: { label: 'Quotation PDF Generated', category: 'Document' },
    issued: { label: 'Quotation Issued', category: 'Workflow' },
    reissued: { label: 'Quotation Reissued', category: 'Workflow' },
    rejected: { label: 'Quotation Rejected', category: 'Workflow' },
    expired: { label: 'Quotation Expired', category: 'System' },
    email_sent: { label: 'Email Sent', category: 'Email' },
    email_failed: { label: 'Email Delivery Failed', category: 'Email' },
    email_attempted: { label: 'Email Attempted', category: 'Email' },
    customer_viewed: { label: 'Customer Viewed Quotation', category: 'Customer' },
    customer_pdf_downloaded: { label: 'Customer Downloaded PDF', category: 'Customer' },
  }
  return map[actionType] || { label: actionType.replace(/_/g, ' '), category: 'Event' }
}

export function QuoteSidebar({
  quote,
  auditLogs = [],
  isRetryingNotificationId,
  onDownloadRevisionPdf,
  onRetryNotification,
}: QuoteSidebarProps) {
  const revisions = quote.revisions || []
  const notifications = quote.notifications || []

  return (
    <div className="space-y-6">
      {/* Issued Documents & Revision History */}
      <Card className="border-gray-200 shadow-none">
        <CardHeader className="border-b border-gray-100 bg-gray-50/60 py-4">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Download className="w-4 h-4 text-orange-600" />
            <span>Documents &amp; Revisions ({revisions.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3 text-sm">
          {revisions.length === 0 ? (
            <p className="text-xs text-gray-500 leading-relaxed">
              No official PDF revisions issued yet. Save pricing and use{' '}
              <strong>Issue &amp; Send Quotation</strong> when ready.
            </p>
          ) : (
            revisions.map((rev, idx) => (
              <div
                key={rev.id}
                className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 tabular-nums">
                      Revision {rev.revision_number} · {formatINR(rev.grand_total)}
                    </p>
                    {idx === 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px]">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Issued {format(new Date(rev.issued_at), 'dd MMM yyyy, hh:mm a')}
                    {rev.issued_by_name ? ` · ${rev.issued_by_name}` : ''}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onDownloadRevisionPdf(rev.revision_number)}
                  className="shrink-0 bg-white border-gray-300"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  PDF
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Notification Delivery Status */}
      <Card className="border-gray-200 shadow-none">
        <CardHeader className="border-b border-gray-100 bg-gray-50/60 py-4">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-600" />
            <span>Notification Status ({notifications.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3 text-xs">
          {notifications.length === 0 ? (
            <p className="text-gray-500">No email notifications recorded yet.</p>
          ) : (
            notifications.map((notif) => (
              <div key={notif.id} className="p-3 border border-gray-200 rounded-lg space-y-1.5 bg-white">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-gray-900">
                    {NOTIFICATION_EVENT_LABELS[notif.event_type] ||
                      notif.event_type.replace(/_/g, ' ')}
                  </span>
                  {notif.status === 'sent' ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-medium shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Sent
                    </span>
                  ) : notif.status === 'failed' ? (
                    <span className="inline-flex items-center gap-1 text-red-700 font-medium shrink-0">
                      <AlertCircle className="w-3.5 h-3.5" /> Failed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-700 font-medium shrink-0">
                      <Clock className="w-3.5 h-3.5" /> Pending
                    </span>
                  )}
                </div>

                <p className="text-gray-600 truncate">To: {notif.recipient_email}</p>
                <p className="text-[11px] text-gray-400">
                  {notif.sent_at
                    ? `Sent ${format(new Date(notif.sent_at), 'dd MMM yyyy, hh:mm a')}`
                    : `Last attempt ${format(
                        new Date(notif.updated_at || notif.created_at),
                        'dd MMM yyyy, hh:mm a'
                      )}`}
                  {notif.attempts > 1 ? ` · ${notif.attempts} attempts` : ''}
                </p>

                {notif.last_error && (
                  <p className="text-red-700 bg-red-50 border border-red-100 p-2 rounded">
                    {notif.last_error}
                  </p>
                )}

                {notif.status !== 'sent' && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isRetryingNotificationId === notif.id}
                    onClick={() => onRetryNotification(notif.id)}
                    className="w-full mt-1 h-8 text-xs border-gray-300"
                  >
                    <RefreshCw
                      className={`w-3 h-3 mr-1.5 ${
                        isRetryingNotificationId === notif.id ? 'animate-spin' : ''
                      }`}
                    />
                    Retry Email Delivery
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card className="border-gray-200 shadow-none">
        <CardHeader className="border-b border-gray-100 bg-gray-50/60 py-4">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <History className="w-4 h-4 text-gray-600" />
            <span>Activity History ({auditLogs.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3 max-h-96 overflow-y-auto">
          {auditLogs.length === 0 ? (
            <p className="text-xs text-gray-500">No activity recorded yet.</p>
          ) : (
            auditLogs.map((log) => {
              const meta = getAuditMeta(log.action_type)
              return (
                <div
                  key={log.id}
                  className="border-l-2 border-gray-200 pl-3 pb-1 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-gray-900">{meta.label}</span>
                    <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px]">
                      {meta.category}
                    </span>
                  </div>
                  {log.notes && <p className="text-gray-600 leading-relaxed">{log.notes}</p>}
                  <p className="text-[11px] text-gray-400">
                    {format(new Date(log.created_at), 'dd MMM yyyy, hh:mm a')}
                    {log.admin_name ? ` · ${log.admin_name}` : ''}
                  </p>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
