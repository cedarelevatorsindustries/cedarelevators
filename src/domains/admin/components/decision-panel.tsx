'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit2, Send, XCircle, FileText, Lock, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DecisionPanelProps {
  canEditPricing: boolean
  isReissue: boolean
  hasUnsavedChanges: boolean
  isSaving: boolean
  validUntilDays: number
  adminResponseMessage: string
  adminInternalNotes: string
  gstWarning?: string | null
  onValidUntilDaysChange: (days: number) => void
  onResponseMessageChange: (value: string) => void
  onInternalNotesChange: (value: string) => void
  onPreviewPdf: () => void
  onIssueClick: () => void
  onReject: () => void
}

export function DecisionPanel({
  canEditPricing,
  isReissue,
  hasUnsavedChanges,
  isSaving,
  validUntilDays,
  adminResponseMessage,
  adminInternalNotes,
  gstWarning,
  onValidUntilDaysChange,
  onResponseMessageChange,
  onInternalNotesChange,
  onPreviewPdf,
  onIssueClick,
  onReject,
}: DecisionPanelProps) {
  if (!canEditPricing) return null

  return (
    <Card className="border-orange-200 bg-orange-50/20 shadow-sm">
      <CardHeader className="border-b border-orange-100 bg-orange-50/50">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Edit2 className="w-5 h-5 text-orange-600" />
          Issuance &amp; Decision
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5 space-y-4">
        {gstWarning && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2.5 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
            <span>{gstWarning}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase text-gray-700 mb-1.5">
            Quotation Validity (Days)
          </label>
          <input
            type="number"
            min={1}
            max={365}
            value={validUntilDays}
            onChange={(e) => onValidUntilDaysChange(Math.min(365, Math.max(1, Number(e.target.value) || 30)))}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-gray-700 mb-1.5">
            Message to Customer (Shown in Email &amp; PDF)
          </label>
          <textarea
            value={adminResponseMessage}
            onChange={(e) => onResponseMessageChange(e.target.value)}
            placeholder="Delivery schedule, technical clarifications, or commercial notes..."
            rows={3}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 resize-none text-sm"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-700 mb-1.5">
            <Lock className="w-3.5 h-3.5 text-gray-500" />
            Internal Admin Notes (Private — Never Visible to Customer)
          </label>
          <textarea
            value={adminInternalNotes}
            onChange={(e) => onInternalNotesChange(e.target.value)}
            placeholder="Margin notes, procurement remarks, internal approval notes..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 resize-none text-sm bg-gray-50"
          />
        </div>

        <div className="space-y-2.5 pt-4 border-t border-orange-200">
          <Button
            type="button"
            variant="outline"
            onClick={onPreviewPdf}
            disabled={isSaving}
            className="w-full border-gray-300 bg-white"
          >
            <FileText className="w-4 h-4 mr-2" />
            Preview Quotation PDF
          </Button>

          <Button
            type="button"
            onClick={onIssueClick}
            disabled={isSaving || hasUnsavedChanges}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-5"
          >
            <Send className="w-4 h-4 mr-2" />
            {isReissue ? 'Reissue New Revision & Email' : 'Issue Quotation & Send Email'}
          </Button>

          {hasUnsavedChanges && (
            <p className="text-xs text-orange-700 text-center font-medium">
              Save your draft pricing changes before issuing the quotation.
            </p>
          )}

          <Button
            type="button"
            onClick={onReject}
            variant="outline"
            disabled={isSaving}
            className="w-full border-red-300 text-red-700 hover:bg-red-50 font-semibold"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject Quotation
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
