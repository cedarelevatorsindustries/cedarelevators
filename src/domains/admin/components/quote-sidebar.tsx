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
      {/* Issued Revisions & PDFs */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 bg-gray-50/50">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Download className="w-4 h-4 text-orange-600" />
            Issued Revisions ({revisions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3 text-sm">
          {revisions.length === 0 ? (
            <p className="text-xs text-gray-500">
              No PDF revisions issued yet. Save pricing and click &ldquo;Issue Quotation&rdquo;.
            </p>
          ) : (
            revisions.map((rev) => (
              <div
                key={rev.id}
                className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between gap-2"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    Revision {rev.revision_number} • {formatINR(rev.grand_total)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Issued {format(new Date(rev.issued_at), 'dd MMM yyyy, hh:mm a')}
                    {rev.issued_by_name ? ` by ${rev.issued_by_name}` : ''}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onDownloadRevisionPdf(rev.revision_number)}
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
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 bg-gray-50/50">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-600" />
            Email Notifications ({notifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3 text-xs">
          {notifications.length === 0 ? (
            <p className="text-gray-500">No email notifications recorded yet.</p>
          ) : (
            notifications.map((notif) => (
              <div key={notif.id} className="p-3 border border-gray-200 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-gray-900">
                    {notif.event_type.replace(/_/g, ' ')}
                  </span>
                  {notif.status === 'sent' ? (
                    <span className="inline-flex items-center gap-1 text-green-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Sent
                    </span>
                  ) : notif.status === 'failed' ? (
                    <span className="inline-flex items-center gap-1 text-red-700 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> Failed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                      <Clock className="w-3.5 h-3.5" /> Pending
                    </span>
                  )}
                </div>
                <p className="text-gray-600 truncate">To: {notif.recipient_email}</p>
                {notif.last_error && (
                  <p className="text-red-600 bg-red-50 p-1.5 rounded">{notif.last_error}</p>
                )}
                {notif.status !== 'sent' && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isRetryingNotificationId === notif.id}
                    onClick={() => onRetryNotification(notif.id)}
                    className="w-full mt-1 h-7 text-xs"
                  >
                    <RefreshCw
                      className={`w-3 h-3 mr-1.5 ${
                        isRetryingNotificationId === notif.id ? 'animate-spin' : ''
                      }`}
                    />
                    Retry Email
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Audit Timeline */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 bg-gray-50/50">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <History className="w-4 h-4 text-gray-600" />
            Audit History
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3 max-h-80 overflow-y-auto">
          {auditLogs.length === 0 ? (
            <p className="text-xs text-gray-500">No audit entries recorded yet.</p>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="border-l-2 border-gray-200 pl-3 pb-1 text-xs space-y-0.5">
                <p className="font-semibold text-gray-900 capitalize">
                  {log.action_type.replace(/_/g, ' ')}
                </p>
                {log.notes && <p className="text-gray-600">{log.notes}</p>}
                <p className="text-gray-400">
                  {format(new Date(log.created_at), 'dd MMM yyyy, hh:mm a')}
                  {log.admin_name ? ` • ${log.admin_name}` : ''}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
