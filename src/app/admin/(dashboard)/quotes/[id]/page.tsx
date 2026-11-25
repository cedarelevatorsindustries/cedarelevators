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
  addAdminNote,
} from '@/lib/actions/admin-quotes'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, Loader2, FileText } from 'lucide-react'
import { format, addDays } from 'date-fns'
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
} from '../../../../../domains/admin/components'

interface AdminQuoteDetailProps {
  params: Promise<{ id: string }>
}

interface TaxConfigState {
  gst_enabled: boolean
  default_gst_percentage: number
  store_gstin?: string | null
  store_state?: string | null
  use_cgst_sgst_igst?: boolean
}

interface StoreConfigState {
  store_name: string
  gst_number?: string | null
  support_email?: string | null
  support_phone?: string | null
  default_quote_validity_days?: number | null
  quote_terms_and_conditions?: string | null
}

export default function AdminQuoteDetailPage({ params }: AdminQuoteDetailProps) {
  const { id } = use(params)
  const router = useRouter()

  const [quote, setQuote] = useState<Quote | null>(null)
  const [auditLogs, setAuditLogs] = useState<QuoteAuditLog[]>([])
  const [taxConfig, setTaxConfig] = useState<TaxConfigState | undefined>(undefined)
  const [storeConfig, setStoreConfig] = useState<StoreConfigState | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isRetryingNotifId, setIsRetryingNotifId] = useState<string | null>(null)

  const [editedItems, setEditedItems] = useState<QuoteItem[]>([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Commercial settings driven by store & tax configuration
  const [taxEnabled, setTaxEnabled] = useState(false)
  const [taxRate, setTaxRate] = useState(0)
  const [overallDiscountType, setOverallDiscountType] = useState<'fixed' | 'percentage'>('fixed')
  const [overallDiscountValue, setOverallDiscountValue] = useState(0)
  const [customGeneralAmount, setCustomGeneralAmount] = useState(0)
  const [termsAndConditions, setTermsAndConditions] = useState('')
  const [validUntilDays, setValidUntilDays] = useState(30)
  const [adminResponseMessage, setAdminResponseMessage] = useState('')
  const [adminInternalNotes, setAdminInternalNotes] = useState('')

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
        setTaxConfig(result.taxConfig)
        setStoreConfig(result.storeConfig)
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
            : Boolean(result.taxConfig?.gst_enabled)

        const resolvedTaxRate =
          Number(q.tax_rate) > 0
            ? Number(q.tax_rate)
            : Number(result.taxConfig?.default_gst_percentage || 0)

        setTaxEnabled(resolvedTaxEnabled)
        setTaxRate(resolvedTaxRate)
        setOverallDiscountType((q.overall_discount_type as 'fixed' | 'percentage') || 'fixed')
        setOverallDiscountValue(Number(q.overall_discount_value || 0))
        if ((q.items || []).length === 0) {
          setCustomGeneralAmount(Number(q.subtotal || 0))
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

  // Derive original customer-submitted quantities cleanly from earliest qty audit event if adjusted previously
  const submittedQuantities = useMemo(() => {
    const origMap: Record<string, number> = {}
    for (const item of quote?.items || []) {
      origMap[item.id] = item.quantity
    }
    const chronological = [...auditLogs].reverse()
    for (const log of chronological) {
      const changes = (log.metadata as any)?.qty_changes
      if (Array.isArray(changes)) {
        for (const ch of changes) {
          if (ch?.item_id && typeof ch?.previous_quantity === 'number') {
            // Preserve the very first quantity before any admin adjustment
            if (origMap[ch.item_id] === (quote?.items || []).find((i) => i.id === ch.item_id)?.quantity) {
              origMap[ch.item_id] = ch.previous_quantity
            }
          }
        }
      }
    }
    return origMap
  }, [quote?.items, auditLogs])

  const configWarnings = useMemo(() => {
    const warnings: string[] = []
    if (!storeConfig || !storeConfig.store_name) {
      warnings.push('Company profile is missing in Admin Store Settings.')
    }
    if (!taxConfig) {
      warnings.push('Tax settings are not configured in Admin Tax Settings.')
    }
    const effectiveGstin = taxConfig?.store_gstin || storeConfig?.gst_number
    if (taxEnabled && !effectiveGstin) {
      warnings.push('Store GSTIN is not configured in Tax/Store Settings.')
    }
    if (taxEnabled && (!Number.isFinite(taxRate) || taxRate <= 0)) {
      warnings.push('GST rate must be greater than 0% when GST is enabled.')
    }
    return warnings
  }, [storeConfig, taxConfig, taxEnabled, taxRate])

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
      await loadQuote()
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

  const handleAddTimestampedInternalNote = async (noteText: string) => {
    if (!quote) return
    const result = await addAdminNote(quote.id, noteText, true)
    if (result.success) {
      toast.success('Internal note added')
      await loadQuote()
    } else {
      toast.error(result.error || 'Failed to save note')
    }
  }

  const handlePreviewPdf = () => {
    if (!quote) return
    if (hasUnsavedChanges) {
      toast.info('Save draft pricing first so the preview reflects your latest edits.')
      return
    }
    window.open(`/api/admin/quotes/${quote.id}/pdf?preview=1`, '_blank', 'noopener,noreferrer')
  }

  const handleDownloadRevisionPdf = (revisionNumber?: number) => {
    if (!quote) return
    const q = revisionNumber ? `?revision=${revisionNumber}` : ''
    window.open(`/api/admin/quotes/${quote.id}/pdf${q}`, '_blank', 'noopener,noreferrer')
  }

  const handleOpenIssueModal = () => {
    if (!quote) return
    if (hasUnsavedChanges) {
      toast.error('Save your draft pricing changes before issuing this quotation.')
      return
    }
    const recipientEmail = (quote.requester_email || quote.guest_email || '').trim()
    if (!recipientEmail) {
      toast.error('Customer email address is required before issuing a quotation.')
      return
    }
    if (editedItems.length > 0) {
      const missingPriceItem = editedItems.find((i) => !i.unit_price || Number(i.unit_price) <= 0)
      if (missingPriceItem) {
        toast.error(`Enter unit price (> 0) for "${missingPriceItem.product_name}" and save pricing.`)
        return
      }
    } else if (calculatedTotals.grand_total <= 0) {
      toast.error('Enter a valid quoted amount (> 0) for this general enquiry and save pricing.')
      return
    }
    if (configWarnings.length > 0) {
      toast.error(configWarnings[0])
      return
    }
    setShowIssueModal(true)
  }

  const handleIssueConfirmed = async () => {
    if (!quote || isSaving) return
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
        toast.success(`Quotation Revision ${result.revisionNumber} issued and sent to customer.`)
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
      toast.error('Please enter a rejection reason (at least 3 characters).')
      return
    }
    setIsSaving(true)
    try {
      const result = await rejectQuote(quote.id, rejectReason.trim(), true)
      if (result.success) {
        toast.success('Quotation rejected and customer notified.')
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
        toast.success('Email notification sent.')
      } else {
        toast.error(result.error || 'Email retry failed')
      }
      await loadQuote()
    } finally {
      setIsRetryingNotifId(null)
    }
  }

  if (isLoading || !quote) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-7 h-7 animate-spin text-orange-600" />
      </div>
    )
  }

  const statusConfig = getStatusConfig(quote.status)
  const customerName =
    quote.requester_name || quote.guest_name || quote.company_details?.contact_name || 'Customer'
  const companyName = quote.company_name || quote.company_details?.company_name || null
  const customerEmail = quote.requester_email || quote.guest_email || ''
  const projectedValidUntil = addDays(new Date(), validUntilDays)

  return (
    <div className="space-y-6 pb-12" data-testid="admin-quote-detail">
      <QuoteHeader
        quote={quote}
        statusConfig={statusConfig}
        isSaving={isSaving}
        canReview={canReview}
        canIssue={canIssue}
        isReissue={isReissue}
        hasUnsavedChanges={hasUnsavedChanges}
        onStartReview={handleStartReview}
        onPreviewPdf={handlePreviewPdf}
        onDownloadLatestPdf={() => handleDownloadRevisionPdf(quote.current_revision)}
        onIssueClick={handleOpenIssueModal}
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Main Column */}
        <div className="xl:col-span-8 space-y-6">
          <BusinessInformation quote={quote} />

          <QuoteItemsPricing
            items={editedItems}
            submittedQuantities={submittedQuantities}
            canEditPricing={canEditPricing}
            hasUnsavedChanges={hasUnsavedChanges}
            isSaving={isSaving}
            calculatedTotals={calculatedTotals}
            taxConfig={taxConfig}
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

        {/* Secondary Column */}
        <div className="xl:col-span-4 space-y-6">
          <DecisionPanel
            canEditPricing={canEditPricing}
            isReissue={isReissue}
            hasUnsavedChanges={hasUnsavedChanges}
            isSaving={isSaving}
            validUntilDays={validUntilDays}
            adminResponseMessage={adminResponseMessage}
            adminInternalNotes={adminInternalNotes}
            adminResponses={quote.admin_responses || []}
            configWarnings={configWarnings}
            onValidUntilDaysChange={setValidUntilDays}
            onResponseMessageChange={(v) => {
              setHasUnsavedChanges(true)
              setAdminResponseMessage(v)
            }}
            onInternalNotesChange={(v) => {
              setHasUnsavedChanges(true)
              setAdminInternalNotes(v)
            }}
            onAddTimestampedInternalNote={handleAddTimestampedInternalNote}
            onPreviewPdf={handlePreviewPdf}
            onIssueClick={handleOpenIssueModal}
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
          <Card className="w-full max-w-lg bg-white border-gray-200">
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isReissue
                    ? `Confirm Reissue (Revision ${(quote.current_revision || 1) + 1})`
                    : 'Confirm Issue & Send Quotation'}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setShowIssueModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">
                This will generate and verify the official quotation PDF, store an immutable revision snapshot, mark the quotation as <strong>Quoted</strong>, and email the customer.
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs sm:text-sm text-gray-700 space-y-2">
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">Quotation Number</span>
                  <span className="font-mono font-medium text-gray-900">#{quote.quote_number}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">Customer</span>
                  <span className="font-medium text-gray-900 text-right">
                    {customerName}
                    {companyName ? ` (${companyName})` : ''}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">Email Destination</span>
                  <span className="font-medium text-gray-900 text-right break-all">
                    {customerEmail}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">Valid Until</span>
                  <span className="font-medium text-gray-900">
                    {format(projectedValidUntil, 'dd MMM yyyy')} ({validUntilDays} days)
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between gap-2 items-baseline">
                  <span className="font-medium text-gray-900">Grand Total</span>
                  <span className="text-base font-semibold text-orange-600 tabular-nums">
                    {formatINR(calculatedTotals.grand_total)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreviewPdf}
                  disabled={isSaving}
                  className="border-gray-300"
                >
                  <FileText className="w-4 h-4 mr-1.5" />
                  Preview Draft PDF
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowIssueModal(false)}
                  disabled={isSaving}
                  className="sm:ml-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleIssueConfirmed}
                  disabled={isSaving}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {isSaving ? 'Issuing Quotation...' : 'Confirm & Issue'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white border-gray-200">
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Reject Quotation Request</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowRejectModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-600">
                Provide a clear reason for declining this request. This explanation will be included in the customer update.
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none text-sm outline-none"
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
