'use client'

import { useState, useEffect, use, useMemo, useCallback } from 'react'
import { Quote, QuoteItem, QuoteAuditLog } from '@/types/b2b/quote'
import {
  getAdminQuoteById,
  getQuoteAuditLog,
  updateQuoteStatus,
  saveQuoteCommercialPricing,
  issueQuotation,
  rejectQuote,
  retryQuoteNotification,
} from '@/lib/actions/admin-quotes'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, Loader2 } from 'lucide-react'
import { calculateQuoteTotals, formatINR } from '@/lib/utils/quote-pricing'
import { canIssueQuoteStatus } from '@/lib/quote-state-machine'

import {
  QuoteHeader,
  BusinessInformation,
  QuoteItemsPricing,
  CustomerNotesAttachments,
  DecisionPanel,
  QuoteSidebar,
  getStatusConfig,
  getUserTypeBadge,
} from '../../../../../domains/admin/components'

interface AdminQuoteDetailProps {
  params: Promise<{ id: string }>
}

export default function AdminQuoteDetailPage({ params }: AdminQuoteDetailProps) {
  const { id } = use(params)
  const router = useRouter()

  const [quote, setQuote] = useState<Quote | null>(null)
  const [auditLogs, setAuditLogs] = useState<QuoteAuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isRetryingNotifId, setIsRetryingNotifId] = useState<string | null>(null)

  const [editedItems, setEditedItems] = useState<QuoteItem[]>([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Commercial settings
  const [taxEnabled, setTaxEnabled] = useState(true)
  const [taxRate, setTaxRate] = useState(18)
  const [overallDiscountType, setOverallDiscountType] = useState<'fixed' | 'percentage'>('fixed')
  const [overallDiscountValue, setOverallDiscountValue] = useState(0)
  const [customGeneralAmount, setCustomGeneralAmount] = useState(0)
  const [termsAndConditions, setTermsAndConditions] = useState('')
  const [validUntilDays, setValidUntilDays] = useState(30)
  const [adminResponseMessage, setAdminResponseMessage] = useState('')
  const [adminInternalNotes, setAdminInternalNotes] = useState('')
  const [gstWarning, setGstWarning] = useState<string | null>(null)

  // Confirmation Modals
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const loadQuote = useCallback(async () => {
    try {
      const [result, auditResult] = await Promise.all([
        getAdminQuoteById(id),
        getQuoteAuditLog(id),
      ])

      if (result.success && result.quote) {
        const q = result.quote
        setQuote(q)
        setEditedItems(q.items || [])
        setAdminResponseMessage(q.admin_response_message || '')
        setAdminInternalNotes(q.admin_internal_notes || '')
        setTermsAndConditions(
          q.terms_and_conditions || result.storeConfig?.quote_terms_and_conditions || ''
        )
        setValidUntilDays(result.storeConfig?.default_quote_validity_days || 30)

        const resolvedTaxEnabled =
          q.tax_enabled !== undefined && q.tax_enabled !== null
            ? Boolean(q.tax_enabled)
            : result.taxConfig
              ? Boolean(result.taxConfig.gst_enabled)
              : true

        const resolvedTaxRate =
          Number(q.tax_rate) > 0
            ? Number(q.tax_rate)
            : Number(result.taxConfig?.default_gst_percentage || 18)

        setTaxEnabled(resolvedTaxEnabled)
        setTaxRate(resolvedTaxRate)
        setOverallDiscountType((q.overall_discount_type as 'fixed' | 'percentage') || 'fixed')
        setOverallDiscountValue(Number(q.overall_discount_value || 0))
        if ((q.items || []).length === 0) {
          setCustomGeneralAmount(Number(q.subtotal || 0))
        }

        const effectiveGstin = result.taxConfig?.store_gstin || result.storeConfig?.gst_number
        if (!effectiveGstin) {
          setGstWarning('Store GSTIN is not configured in Tax/Store Settings.')
        } else {
          setGstWarning(null)
        }

        setHasUnsavedChanges(false)
      } else {
        toast.error('Quotation not found')
        router.push('/admin/quotes')
      }

      if (auditResult.success && auditResult.logs) {
        setAuditLogs(auditResult.logs)
      }
    } catch (error) {
      console.error('Error loading quote:', error)
      toast.error('Failed to load quotation')
    } finally {
      setIsLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    loadQuote()
  }, [loadQuote])

  const calculatedTotals = useMemo(() => {
    const inputs =
      editedItems.length > 0
        ? editedItems.map((i) => ({
            id: i.id,
            quantity: Number(i.quantity) || 1,
            unit_price: Number(i.unit_price) || 0,
            discount_percentage: Number(i.discount_percentage) || 0,
          }))
        : customGeneralAmount > 0
          ? [{ quantity: 1, unit_price: customGeneralAmount, discount_percentage: 0 }]
          : []

    return calculateQuoteTotals({
      items: inputs,
      overallDiscountType,
      overallDiscountValue,
      taxEnabled,
      taxRate,
    })
  }, [editedItems, customGeneralAmount, overallDiscountType, overallDiscountValue, taxEnabled, taxRate])

  const isTerminal = ['rejected', 'converted', 'expired'].includes(quote?.status || '')
  const canEditPricing = !isTerminal
  const canReview = ['submitted', 'pending'].includes(quote?.status || '')
  const canIssue = canIssueQuoteStatus(quote?.status)
  const isReissue =
    (quote?.current_revision || 0) > 0 || quote?.status === 'quoted' || quote?.status === 'approved'

  const handleStartReview = async () => {
    if (!quote) return
    setIsSaving(true)
    const result = await updateQuoteStatus(quote.id, 'reviewing')
    setIsSaving(false)
    if (result.success) {
      toast.success('Quotation moved to Under Review')
      loadQuote()
    } else {
      toast.error(result.error || 'Failed to update status')
    }
  }

  const handleItemChange = (
    itemId: string,
    field: 'unit_price' | 'discount_percentage' | 'quantity',
    value: number
  ) => {
    setHasUnsavedChanges(true)
    setEditedItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, [field]: value } : item))
    )
  }

  const handleSavePricing = async () => {
    if (!quote) return
    setIsSaving(true)
    try {
      const result = await saveQuoteCommercialPricing(quote.id, {
        items: editedItems.map((i) => ({
          id: i.id,
          quantity: i.quantity,
          unit_price: Number(i.unit_price) || 0,
          discount_percentage: Number(i.discount_percentage) || 0,
        })),
        overallDiscountType,
        overallDiscountValue,
        taxEnabled,
        taxRate,
        termsAndConditions,
        customerMessage: adminResponseMessage,
        internalNotes: adminInternalNotes,
        customAmountForGeneralEnquiry: customGeneralAmount,
      })

      if (result.success) {
        toast.success('Draft pricing saved')
        setHasUnsavedChanges(false)
        await loadQuote()
      } else {
        toast.error(result.error || 'Failed to save pricing')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreviewPdf = () => {
    if (!quote) return
    if (hasUnsavedChanges) {
      toast.info('Save pricing first so preview reflects your latest edits.')
      return
    }
    window.open(`/api/admin/quotes/${quote.id}/pdf?preview=1`, '_blank', 'noopener,noreferrer')
  }

  const handleDownloadRevisionPdf = (revisionNumber?: number) => {
    if (!quote) return
    const q = revisionNumber ? `?revision=${revisionNumber}` : ''
    window.open(`/api/admin/quotes/${quote.id}/pdf${q}`, '_blank', 'noopener,noreferrer')
  }

  const handleIssueConfirmed = async () => {
    if (!quote) return
    setIsSaving(true)
    try {
      const result = await issueQuotation(quote.id, {
        validUntilDays,
        termsAndConditions,
        customerMessage: adminResponseMessage,
        internalNotes: adminInternalNotes,
        taxEnabled,
        taxRate,
        overallDiscountType,
        overallDiscountValue,
        notifyCustomer: true,
        customAmountForGeneralEnquiry: customGeneralAmount,
      })

      if (result.success) {
        toast.success(`Quotation Revision ${result.revisionNumber} issued and sent to customer!`)
        setShowIssueModal(false)
        await loadQuote()
      } else {
        toast.error(result.error || 'Failed to issue quotation')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleReject = async () => {
    if (!quote) return
    if (!rejectReason || rejectReason.trim().length < 3) {
      toast.error('Please enter a rejection reason (at least 3 characters)')
      return
    }
    setIsSaving(true)
    try {
      const result = await rejectQuote(quote.id, rejectReason.trim(), true)
      if (result.success) {
        toast.success('Quotation rejected and customer notified')
        setShowRejectModal(false)
        setRejectReason('')
        await loadQuote()
      } else {
        toast.error(result.error || 'Failed to reject quotation')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleRetryNotification = async (notificationId: string) => {
    if (!quote) return
    setIsRetryingNotifId(notificationId)
    try {
      const result = await retryQuoteNotification(quote.id, notificationId)
      if (result.success) {
        toast.success('Email notification sent successfully')
      } else {
        toast.error(result.error || 'Retry failed')
      }
      await loadQuote()
    } finally {
      setIsRetryingNotifId(null)
    }
  }

  if (isLoading || !quote) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    )
  }

  const statusConfig = getStatusConfig(quote.status)
  const userTypeBadge = getUserTypeBadge(quote.account_type)

  return (
    <div className="space-y-6 pb-12" data-testid="admin-quote-detail">
      <QuoteHeader
        quote={quote}
        statusConfig={statusConfig}
        userTypeBadge={userTypeBadge}
        isSaving={isSaving}
        canReview={canReview}
        canIssue={canIssue}
        isReissue={isReissue}
        hasUnsavedChanges={hasUnsavedChanges}
        onStartReview={handleStartReview}
        onPreviewPdf={handlePreviewPdf}
        onDownloadLatestPdf={() => handleDownloadRevisionPdf(quote.current_revision)}
        onIssueClick={() => setShowIssueModal(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <BusinessInformation quote={quote} />

          <QuoteItemsPricing
            items={editedItems}
            canEditPricing={canEditPricing}
            hasUnsavedChanges={hasUnsavedChanges}
            isSaving={isSaving}
            calculatedTotals={calculatedTotals}
            taxEnabled={taxEnabled}
            taxRate={taxRate}
            overallDiscountType={overallDiscountType}
            overallDiscountValue={overallDiscountValue}
            customGeneralAmount={customGeneralAmount}
            termsAndConditions={termsAndConditions}
            onTaxToggle={(val) => {
              setHasUnsavedChanges(true)
              setTaxEnabled(val)
            }}
            onTaxRateChange={(val) => {
              setHasUnsavedChanges(true)
              setTaxRate(val)
            }}
            onOverallDiscountChange={(t, v) => {
              setHasUnsavedChanges(true)
              setOverallDiscountType(t)
              setOverallDiscountValue(v)
            }}
            onCustomGeneralAmountChange={(val) => {
              setHasUnsavedChanges(true)
              setCustomGeneralAmount(val)
            }}
            onTermsChange={(val) => {
              setHasUnsavedChanges(true)
              setTermsAndConditions(val)
            }}
            onItemChange={handleItemChange}
            onSavePricing={handleSavePricing}
          />

          <CustomerNotesAttachments quote={quote} />
        </div>

        <div className="space-y-6">
          <DecisionPanel
            canEditPricing={canEditPricing}
            isReissue={isReissue}
            hasUnsavedChanges={hasUnsavedChanges}
            isSaving={isSaving}
            validUntilDays={validUntilDays}
            adminResponseMessage={adminResponseMessage}
            adminInternalNotes={adminInternalNotes}
            gstWarning={gstWarning}
            onValidUntilDaysChange={setValidUntilDays}
            onResponseMessageChange={(v) => {
              setHasUnsavedChanges(true)
              setAdminResponseMessage(v)
            }}
            onInternalNotesChange={(v) => {
              setHasUnsavedChanges(true)
              setAdminInternalNotes(v)
            }}
            onPreviewPdf={handlePreviewPdf}
            onIssueClick={() => setShowIssueModal(true)}
            onReject={() => setShowRejectModal(true)}
          />

          <QuoteSidebar
            quote={quote}
            auditLogs={auditLogs}
            isRetryingNotificationId={isRetryingNotifId}
            onDownloadRevisionPdf={handleDownloadRevisionPdf}
            onRetryNotification={handleRetryNotification}
          />
        </div>
      </div>

      {/* Confirm Issue Quotation Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white">
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {isReissue
                    ? `Reissue Quotation (Revision ${(quote.current_revision || 1) + 1})`
                    : 'Confirm Quotation Issuance'}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setShowIssueModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-600">
                This will generate the official PDF ({formatINR(calculatedTotals.grand_total)}), store an immutable revision snapshot, mark the quotation as <strong>Quoted</strong>, and email the customer.
              </p>
              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-700 space-y-1">
                <p><strong>Grand Total:</strong> {formatINR(calculatedTotals.grand_total)}</p>
                <p><strong>Validity:</strong> {validUntilDays} days from today</p>
                <p><strong>Recipient:</strong> {quote.requester_email || quote.guest_email}</p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowIssueModal(false)}
                  disabled={isSaving}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleIssueConfirmed}
                  disabled={isSaving}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {isSaving ? 'Issuing...' : 'Confirm & Issue'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white">
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Reject Quotation</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowRejectModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-600">
                Provide a clear reason for rejecting this request. This reason will be included in the customer notification.
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none text-sm"
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowRejectModal(false)}
                  disabled={isSaving}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={isSaving}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {isSaving ? 'Rejecting...' : 'Confirm Reject'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
