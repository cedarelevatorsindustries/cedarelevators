'use client'

import { useState } from 'react'
import { AdminInternalResponse } from '@/types/b2b/quote'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Send,
  XCircle,
  FileText,
  Lock,
  AlertTriangle,
  MessageSquareText,
  Plus,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

interface DecisionPanelProps {
  canEditPricing: boolean
  isReissue: boolean
  hasUnsavedChanges: boolean
  isSaving: boolean
  validUntilDays: number
  adminResponseMessage: string
  adminInternalNotes: string
  adminResponses?: AdminInternalResponse[]
  configWarnings?: string[]
  onValidUntilDaysChange: (days: number) => void
  onResponseMessageChange: (value: string) => void
  onInternalNotesChange: (value: string) => void
  onAddTimestampedInternalNote: (note: string) => Promise<void>
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
  adminResponses = [],
  configWarnings = [],
  onValidUntilDaysChange,
  onResponseMessageChange,
  onInternalNotesChange,
  onAddTimestampedInternalNote,
  onPreviewPdf,
  onIssueClick,
  onReject,
}: DecisionPanelProps) {
  const [newLogNote, setNewLogNote] = useState('')
  const [isAddingNote, setIsAddingNote] = useState(false)

  const handleLogInternalNote = async () => {
    const clean = newLogNote.trim()
    if (!clean || isAddingNote) return
    setIsAddingNote(true)
    try {
      await onAddTimestampedInternalNote(clean)
      setNewLogNote('')
    } finally {
      setIsAddingNote(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Customer Response Card (Public / Customer-Visible) */}
      <Card className="border-gray-200 shadow-none">
        <CardHeader className="border-b border-gray-100 bg-gray-50/60 py-4">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquareText className="w-4 h-4 text-orange-600" />
            <span>Customer Response</span>
          </CardTitle>
          <p className="text-xs text-gray-500 mt-0.5">
            This message may be shared with the customer in emails and quotation PDFs.
          </p>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <textarea
            value={adminResponseMessage}
            disabled={!canEditPricing}
            onChange={(e) => onResponseMessageChange(e.target.value)}
            placeholder="Delivery schedule, technical clarifications, payment/dispatch notes..."
            rows={3}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-y text-sm outline-none disabled:bg-gray-50"
          />

          {canEditPricing && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Quotation Validity (Days from Issue)
              </label>
              <input
                type="number"
                min={1}
                max={365}
                value={validUntilDays}
                onChange={(e) =>
                  onValidUntilDaysChange(
                    Math.min(365, Math.max(1, Number(e.target.value) || 30))
                  )
                }
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm tabular-nums"
              />
            </div>
          )}

          {configWarnings.length > 0 && canEditPricing && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1 text-xs text-amber-800">
              {configWarnings.map((w, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}

          {canEditPricing && (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={onPreviewPdf}
                disabled={isSaving}
                className="w-full border-gray-300 bg-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Preview Draft PDF
              </Button>

              <Button
                type="button"
                onClick={onIssueClick}
                disabled={isSaving || hasUnsavedChanges}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                {isReissue ? 'Reissue Quotation & Send' : 'Issue & Send Quotation'}
              </Button>

              {hasUnsavedChanges && (
                <p className="text-xs text-orange-700 text-center">
                  Save draft pricing before issuing this quotation.
                </p>
              )}

              <Button
                type="button"
                onClick={onReject}
                variant="outline"
                disabled={isSaving}
                className="w-full border-red-200 text-red-700 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject Request
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Private Internal Notes Card */}
      <Card className="border-gray-200 bg-slate-50/50 shadow-none">
        <CardHeader className="border-b border-gray-200/80 py-4">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-gray-600" />
            <span>Internal Notes</span>
          </CardTitle>
          <p className="text-xs text-gray-500 mt-0.5">
            Visible only to authorized Cedar administrators. Never sent to customers or PDFs.
          </p>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {canEditPricing && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Working Note (Saved with Draft Pricing)
              </label>
              <textarea
                value={adminInternalNotes}
                onChange={(e) => onInternalNotesChange(e.target.value)}
                placeholder="Margin notes, procurement remarks, internal costing context..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-y text-sm bg-white outline-none"
              />
            </div>
          )}

          {/* Timestamped Note Log Entry */}
          <div className="space-y-2 pt-2 border-t border-gray-200/70">
            <label className="block text-xs font-medium text-gray-700">
              Log New Timestamped Note
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newLogNote}
                onChange={(e) => setNewLogNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleLogInternalNote()
                  }
                }}
                placeholder="Add internal note with author & timestamp..."
                className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 outline-none focus:border-orange-500"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!newLogNote.trim() || isAddingNote}
                onClick={handleLogInternalNote}
                className="border-gray-300 bg-white shrink-0"
              >
                {isAddingNote ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5 mr-1" />
                )}
                Add
              </Button>
            </div>
          </div>

          {/* Previous Timestamped Notes */}
          {adminResponses.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto pt-1">
              {adminResponses.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-lg bg-white border border-gray-200 px-3 py-2 text-xs space-y-1"
                >
                  <p className="text-gray-800 whitespace-pre-wrap">{entry.response_note}</p>
                  <p className="text-[11px] text-gray-500">
                    {entry.responded_by || 'Administrator'} ·{' '}
                    {format(new Date(entry.responded_at), 'dd MMM yyyy, hh:mm a')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
