"use client"

import { useState, useEffect, use, useMemo } from "react"
import { Quote, QuoteItem } from "@/types/b2b/quote"
import {
    getAdminQuoteById,
    updateQuoteStatus,
    updateQuotePricing,
    updateQuoteItemPricing,
    approveQuote,
    rejectQuote,
    convertQuoteToOrder
} from "@/lib/actions/admin-quotes"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X } from "lucide-react"

// Import modular components
import {
    QuoteHeader,
    BusinessInformation,
    QuoteItemsPricing,
    CustomerNotesAttachments,
    DecisionPanel,
    QuoteSidebar,
    getStatusConfig,
    getUserTypeBadge
} from "../../../../../domains/admin/components"

interface AdminQuoteDetailProps {
    params: Promise<{ id: string }>
}

export default function AdminQuoteDetailPage({ params }: AdminQuoteDetailProps) {
    const { id } = use(params)
    const router = useRouter()

    // State
    const [quote, setQuote] = useState<Quote | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [editedItems, setEditedItems] = useState<QuoteItem[]>([])
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [adminResponseMessage, setAdminResponseMessage] = useState('')
    const [adminInternalNotes, setAdminInternalNotes] = useState('')
    const [validUntilDays, setValidUntilDays] = useState(30)

    // Modal states
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [rejectReason, setRejectReason] = useState('')
    const [showConvertModal, setShowConvertModal] = useState(false)

    useEffect(() => {
        loadQuote()
    }, [id])

    const loadQuote = async () => {
        try {
            const result = await getAdminQuoteById(id)
            if (result.success && result.quote) {
                setQuote(result.quote)
                setEditedItems(result.quote.items || [])
                setAdminResponseMessage(result.quote.admin_response_message || '')
                setAdminInternalNotes(result.quote.admin_internal_notes || '')
            } else {
                toast.error('Quote not found')
                router.push('/admin/quotes')
            }
        } catch (error) {
            console.error('Error loading quote:', error)
            toast.error('Failed to load quote')
        } finally {
            setIsLoading(false)
        }
    }

    // Tax state - derived from existing tax or default to true
    const [taxEnabled, setTaxEnabled] = useState(true)

    // Initialize tax state based on loaded quote
    useEffect(() => {
        if (quote) {
            // If quote has subtotal but no tax, assume tax is disabled
            if (quote.subtotal > 0 && quote.tax_total === 0) {
                setTaxEnabled(false)
            }
        }
    }, [quote?.id]) // Run only when quote ID changes/loads

    // Calculate totals from edited items
    const calculatedTotals = useMemo(() => {
        const subtotal = editedItems.reduce((sum, item) => sum + ((item.unit_price || 0) * (item.quantity || 0)), 0)
        const discount = editedItems.reduce((sum, item) => {
            const itemTotal = (item.unit_price || 0) * (item.quantity || 0)
            const discountAmount = itemTotal * ((item.discount_percentage || 0) / 100)
            return sum + discountAmount
        }, 0)
        const subtotalAfterDiscount = subtotal - discount
        const tax = taxEnabled ? subtotalAfterDiscount * 0.18 : 0 // 18% GST if enabled
        const total = subtotalAfterDiscount + tax

        return { subtotal, discount, tax, total }
    }, [editedItems, taxEnabled])

    // User type checks
    const isUnverifiedBusiness = quote?.account_type === 'business'
    const isVerifiedBusiness = quote?.account_type === 'verified'
    const isIndividual = quote?.account_type === 'individual'
    const isGuest = !quote?.account_type || quote?.account_type === 'guest'

    // Permission checks
    // Allow editing for pending, reviewing, and any non-finalized guest quotes
    const isFinalized = ['approved', 'rejected', 'converted', 'expired'].includes(quote?.status || '')
    const canEditPricing =
        quote?.status === 'pending' ||
        quote?.status === 'reviewing' ||
        quote?.status === 'draft' ||
        (isGuest && !isFinalized)

    const canApprove = quote?.status === 'reviewing' || (isGuest && !isFinalized)
    const canConvert = quote?.status === 'approved' && quote?.account_type === 'verified'

    // === ACTIONS ===

    const handleStartReview = async () => {
        if (!quote) return
        setIsSaving(true)
        try {
            const result = await updateQuoteStatus(quote.id, 'reviewing')
            if (result.success) {
                toast.success('Review started')
                loadQuote()
            } else {
                toast.error(result.error || 'Failed to start review')
            }
        } catch (error) {
            toast.error('Failed to start review')
        } finally {
            setIsSaving(false)
        }
    }

    const handleItemPriceChange = (itemId: string, field: 'unit_price' | 'discount_percentage', value: number) => {
        setHasUnsavedChanges(true)
        setEditedItems(items =>
            items.map(item => {
                if (item.id === itemId) {
                    const updated = { ...item, [field]: value }
                    const subtotal = updated.unit_price * updated.quantity
                    const discountAmt = subtotal * (updated.discount_percentage / 100)
                    updated.total_price = subtotal - discountAmt
                    return updated
                }
                return item
            })
        )
    }

    const handleSavePricing = async () => {
        if (!quote) return
        setIsSaving(true)
        try {
            for (const item of editedItems) {
                await updateQuoteItemPricing(item.id, {
                    unit_price: item.unit_price,
                    discount_percentage: item.discount_percentage,
                    total_price: item.total_price
                })
            }
            await updateQuotePricing(quote.id, {
                subtotal: calculatedTotals.subtotal,
                discount_total: calculatedTotals.discount,
                tax_total: calculatedTotals.tax, // will be 0 if disabled
                estimated_total: calculatedTotals.total
            })

            // Update the quote object with new totals and items without full reload
            // This preserves the editedItems and prevents the UI from resetting
            setQuote(prev => prev ? {
                ...prev,
                items: editedItems,
                subtotal: calculatedTotals.subtotal,
                discount_total: calculatedTotals.discount,
                tax_total: calculatedTotals.tax,
                estimated_total: calculatedTotals.total,
                updated_at: new Date().toISOString()
            } : null)

            toast.success('Pricing saved successfully')
            setHasUnsavedChanges(false)
            // Don't call loadQuote() - keep editedItems as is to prevent reset
        } catch (error) {
            toast.error('Failed to save pricing')
        } finally {
            setIsSaving(false)
        }
    }

    const handleApprove = async () => {
        if (!quote) return

        // Validate pricing
        if (editedItems.some(item => !item.unit_price || item.unit_price === 0)) {
            toast.error('All items must have pricing before approval')
            return
        }

        // Check for unsaved changes
        if (hasUnsavedChanges) {
            toast.error('Please save pricing changes before approving')
            return
        }

        setIsSaving(true)
        try {
            const result = await approveQuote(quote.id, {
                validUntilDays,
                adminNotes: adminResponseMessage || `Quote approved with total ₹${calculatedTotals.total.toLocaleString()}`
            })

            if (result.success) {
                toast.success('Quote approved and email sent to customer!')
                loadQuote()
            } else {
                toast.error(result.error || 'Failed to approve')
            }
        } catch (error) {
            toast.error('Failed to approve quote')
        } finally {
            setIsSaving(false)
        }
    }

    const handleReject = async () => {
        if (!quote) return
        // Rejection reason is now optional (not required)

        setIsSaving(true)
        try {
            const result = await rejectQuote(quote.id, rejectReason || 'No reason provided')
            if (result.success) {
                toast.success('Quote rejected and email sent to customer')
                setShowRejectModal(false)
                setRejectReason('')
                loadQuote()
            } else {
                toast.error(result.error || 'Failed to reject')
            }
        } catch (error) {
            toast.error('Failed to reject quote')
        } finally {
            setIsSaving(false)
        }
    }

    const handleConvert = async () => {
        if (!quote) return
        setIsSaving(true)
        try {
            const result = await convertQuoteToOrder(quote.id, {
                delivery_method: 'standard',
                payment_method: 'bank_transfer'
            })
            if (result.success && result.orderId) {
                toast.success('Quote converted to order!')
                setShowConvertModal(false)
                router.push(`/admin/orders/${result.orderId}`)
            } else {
                toast.error(result.error || 'Failed to convert')
            }
        } catch (error) {
            toast.error('Failed to convert quote')
        } finally {
            setIsSaving(false)
        }
    }

    // Loading state
    if (isLoading || !quote) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading quote...</p>
                </div>
            </div>
        )
    }

    const statusConfig = getStatusConfig(quote.status)
    const userTypeBadge = getUserTypeBadge(quote.account_type)

    return (
        <div className="space-y-6" data-testid="admin-quote-detail">
            {/* Header */}
            <QuoteHeader
                quote={quote}
                statusConfig={statusConfig}
                userTypeBadge={userTypeBadge}
                canApprove={canApprove}
                canConvert={canConvert}
                isUnverifiedBusiness={isUnverifiedBusiness}
                isIndividual={isIndividual}
                isGuest={isGuest}
                isSaving={isSaving}
                onStartReview={handleStartReview}
                onApprove={handleApprove}
                onReject={() => setShowRejectModal(true)}
                onConvert={() => setShowConvertModal(true)}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Business Information */}
                    <BusinessInformation quote={quote} />

                    {/* Quote Items & Pricing */}
                    <QuoteItemsPricing
                        items={editedItems}
                        canEditPricing={canEditPricing}
                        hasUnsavedChanges={hasUnsavedChanges}
                        isSaving={isSaving}
                        isPending={quote.status === 'pending'}
                        calculatedTotals={calculatedTotals}
                        taxEnabled={taxEnabled}
                        onTaxToggle={setTaxEnabled}
                        onItemPriceChange={handleItemPriceChange}
                        onSavePricing={handleSavePricing}
                        onStartReview={handleStartReview}
                    />

                    {/* Customer Notes & Attachments */}
                    <CustomerNotesAttachments quote={quote} />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <QuoteSidebar
                        quote={quote}
                        canConvert={canConvert}
                        isSaving={isSaving}
                        onStartReview={handleStartReview}
                        onConvert={() => setShowConvertModal(true)}
                    />

                    {/* Decision Panel - Moved here */}
                    <DecisionPanel
                        canEditPricing={canEditPricing}
                        isUnverifiedBusiness={isUnverifiedBusiness}
                        hasUnsavedChanges={hasUnsavedChanges}
                        isSaving={isSaving}
                        adminResponseMessage={adminResponseMessage}
                        adminInternalNotes={adminInternalNotes}
                        onResponseMessageChange={setAdminResponseMessage}
                        onInternalNotesChange={setAdminInternalNotes}
                        onApprove={handleApprove}
                        onReject={() => setShowRejectModal(true)}
                    />
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md mx-4">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Reject Quote</h3>
                                <Button variant="ghost" size="sm" onClick={() => setShowRejectModal(false)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Enter rejection reason..."
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
                            />
                            <div className="flex gap-3 mt-4">
                                <Button variant="outline" onClick={() => setShowRejectModal(false)} className="flex-1">
                                    Cancel
                                </Button>
                                <Button onClick={handleReject} disabled={isSaving} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                                    Reject Quote
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Convert Modal */}
            {showConvertModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md mx-4">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Convert to Order</h3>
                                <Button variant="ghost" size="sm" onClick={() => setShowConvertModal(false)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            <p className="text-gray-600 mb-4">
                                Are you sure you want to convert this quote to an order? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => setShowConvertModal(false)} className="flex-1">
                                    Cancel
                                </Button>
                                <Button onClick={handleConvert} disabled={isSaving} className="flex-1 bg-[#FF6B35] hover:bg-[#FF5722] text-white">
                                    Convert to Order
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
