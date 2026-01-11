"use client"

import { useState, useEffect, use, useMemo } from "react"
import { Quote, QuoteStatus, QuoteItem } from "@/types/b2b/quote"
import {
    getAdminQuoteById,
    updateQuoteStatus,
    updateQuotePricing,
    updateQuoteItemPricing,
    approveQuote,
    rejectQuote,
    convertQuoteToOrder
} from "@/lib/actions/admin-quotes"
import {
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    ArrowLeft,
    Package,
    Loader2,
    Building2,
    User,
    Star,
    Eye,
    Edit2,
    Save,
    X,
    Download,
    AlertTriangle,
    DollarSign,
    Phone,
    Mail,
    BadgeCheck,
    Calendar,
    ShoppingCart,
    MessageSquare,
    FileWarning
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDistanceToNow, format } from "date-fns"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AdminQuoteDetailProps {
    params: Promise<{ id: string }>
}

// Status configuration
const getStatusConfig = (status: QuoteStatus) => {
    switch (status) {
        case 'pending':
            return { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Clock, label: 'Pending' }
        case 'reviewing':
            return { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Eye, label: 'Under Review' }
        case 'approved':
            return { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle, label: 'Approved' }
        case 'rejected':
            return { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Rejected' }
        case 'converted':
            return { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: ShoppingCart, label: 'Converted' }
        case 'expired':
            return { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Clock, label: 'Expired' }
        default:
            return { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: FileText, label: status }
    }
}

export default function AdminQuoteDetailPage({ params }: AdminQuoteDetailProps) {
    const { id } = use(params)
    const router = useRouter()
    const [quote, setQuote] = useState<Quote | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    // Editing states
    const [isEditingPricing, setIsEditingPricing] = useState(false)
    const [editedItems, setEditedItems] = useState<QuoteItem[]>([])

    // Admin decision panel state
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

    // Calculate totals from edited items
    const calculatedTotals = useMemo(() => {
        const subtotal = editedItems.reduce((sum, item) => sum + ((item.unit_price || 0) * (item.quantity || 0)), 0)
        const discount = editedItems.reduce((sum, item) => {
            const itemTotal = (item.unit_price || 0) * (item.quantity || 0)
            const discountAmount = itemTotal * ((item.discount_percentage || 0) / 100)
            return sum + discountAmount
        }, 0)
        const subtotalAfterDiscount = subtotal - discount
        const tax = subtotalAfterDiscount * 0.18 // 18% GST
        const total = subtotalAfterDiscount + tax

        return { subtotal, discount, tax, total }
    }, [editedItems])

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
                tax_total: calculatedTotals.tax,
                estimated_total: calculatedTotals.total
            })
            toast.success('Pricing saved')
            setIsEditingPricing(false)
            loadQuote()
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

        setIsSaving(true)
        try {
            // Save pricing first if in edit mode
            if (isEditingPricing) {
                await handleSavePricing()
            }

            const result = await approveQuote(quote.id, {
                validUntilDays,
                adminNotes: adminResponseMessage || `Quote approved with total ₹${calculatedTotals.total.toLocaleString()}`
            })

            if (result.success) {
                toast.success('Quote approved!')
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
        if (!quote || !rejectReason.trim()) {
            toast.error('Please provide a rejection reason')
            return
        }

        setIsSaving(true)
        try {
            const result = await rejectQuote(quote.id, rejectReason)
            if (result.success) {
                toast.success('Quote rejected')
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
                shipping_address_id: '',
                delivery_method: 'standard'
            })
            if (result.success) {
                toast.success('Quote converted to order!')
                setShowConvertModal(false)
                loadQuote()
            } else {
                toast.error(result.error || 'Failed to convert')
            }
        } catch (error) {
            toast.error('Failed to convert quote')
        } finally {
            setIsSaving(false)
        }
    }

    // === RENDER ===

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
        )
    }

    if (!quote) {
        return (
            <div className="text-center py-20">
                <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900">Quote not found</h3>
            </div>
        )
    }

    const statusConfig = getStatusConfig(quote.status)
    const StatusIcon = statusConfig.icon
    const canEditPricing = quote.status === 'reviewing'
    const canApprove = quote.status === 'reviewing'

    // Per spec: Only verified business users can convert to order
    // account_type can be: 'guest' | 'individual' | 'business' | 'verified'
    // 'verified' means business with verification completed
    const isVerifiedBusiness = quote.account_type === 'verified'
    const canConvert = quote.status === 'approved' && isVerifiedBusiness
    const isUnverifiedBusiness = quote.account_type === 'business' // business but not yet verified
    const isIndividual = quote.account_type === 'individual'
    const isGuest = quote.account_type === 'guest' || !quote.account_type

    return (
        <div className="space-y-6" data-testid="admin-quote-detail">
            {/* Back Button */}
            <Link
                href="/admin/quotes"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Quotes
            </Link>

            {/* === SECTION 1: HEADER === */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-gray-900">Quote #{quote.quote_number}</h1>
                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${statusConfig.color}`}>
                                <StatusIcon className="w-4 h-4" />
                                {statusConfig.label}
                            </span>
                            {quote.account_type === 'verified' && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                    <BadgeCheck className="w-3 h-3" />
                                    Verified
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Created {formatDistanceToNow(new Date(quote.created_at), { addSuffix: true })}
                            </span>
                            {quote.valid_until && (
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    Valid until {format(new Date(quote.valid_until), 'MMM d, yyyy')}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Primary CTA */}
                    <div className="flex items-center gap-2">
                        {quote.status === 'pending' && (
                            <Button
                                onClick={handleStartReview}
                                disabled={isSaving}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                                Start Review
                            </Button>
                        )}
                        {canApprove && (
                            <>
                                <Button
                                    onClick={handleApprove}
                                    disabled={isSaving}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve
                                </Button>
                                <Button
                                    onClick={() => setShowRejectModal(true)}
                                    variant="outline"
                                    className="border-red-200 text-red-700 hover:bg-red-50"
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject
                                </Button>
                            </>
                        )}
                        {canConvert && (
                            <Button
                                onClick={() => setShowConvertModal(true)}
                                disabled={isSaving}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Convert to Order
                            </Button>
                        )}
                        {quote.status === 'approved' && isUnverifiedBusiness && (
                            <span className="text-sm text-amber-600 flex items-center gap-1">
                                <FileWarning className="w-4 h-4" />
                                Business verification required to place order
                            </span>
                        )}
                        {quote.status === 'approved' && isIndividual && (
                            <span className="text-sm text-blue-600 flex items-center gap-1">
                                <User className="w-4 h-4" />
                                Individual accounts cannot place orders
                            </span>
                        )}
                        {quote.status === 'approved' && isGuest && (
                            <span className="text-sm text-gray-600 flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                Quote sent via email
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* === SECTION 2: REQUESTER INFO === */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                {quote.account_type === 'business' || quote.account_type === 'verified' ? (
                                    <Building2 className="w-5 h-5 text-purple-600" />
                                ) : (
                                    <User className="w-5 h-5 text-blue-600" />
                                )}
                                Requester Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium text-gray-900">
                                        {quote.guest_name || quote.company_details?.contact_name || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Account Type</p>
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${quote.account_type === 'verified' ? 'bg-green-100 text-green-700' :
                                        quote.account_type === 'business' ? 'bg-purple-100 text-purple-700' :
                                            quote.account_type === 'individual' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                        }`}>
                                        {quote.account_type === 'verified' && <BadgeCheck className="w-3 h-3" />}
                                        {(quote.account_type || 'guest').charAt(0).toUpperCase() + (quote.account_type || 'guest').slice(1)}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                        <Mail className="w-3 h-3" /> Email
                                    </p>
                                    <p className="font-medium text-gray-900">{quote.guest_email || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                        <Phone className="w-3 h-3" /> Phone
                                    </p>
                                    <p className="font-medium text-gray-900">
                                        {quote.guest_phone || quote.company_details?.contact_phone || 'N/A'}
                                    </p>
                                </div>
                                {quote.company_details?.company_name && (
                                    <>
                                        <div>
                                            <p className="text-sm text-gray-500">Company</p>
                                            <p className="font-medium text-gray-900">{quote.company_details.company_name}</p>
                                        </div>
                                        {quote.company_details.gst_number && (
                                            <div>
                                                <p className="text-sm text-gray-500">GST Number</p>
                                                <p className="font-medium text-gray-900">{quote.company_details.gst_number}</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* === SECTION 3: QUOTE ITEMS === */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Package className="w-5 h-5 text-orange-600" />
                                Requested Items ({editedItems.length})
                            </CardTitle>
                            {canEditPricing && !isEditingPricing && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsEditingPricing(true)}
                                    className="border-orange-200 text-orange-700 hover:bg-orange-50"
                                >
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Set Pricing
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Product</th>
                                            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Qty</th>
                                            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Unit Price</th>
                                            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Discount %</th>
                                            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {editedItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                                                            {item.product_thumbnail ? (
                                                                <img src={item.product_thumbnail} alt="" className="w-full h-full object-cover rounded" />
                                                            ) : (
                                                                <Package className="w-4 h-4 text-gray-400" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900 text-sm">{item.product_name}</p>
                                                            {item.product_sku && <p className="text-xs text-gray-500">SKU: {item.product_sku}</p>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-center font-semibold">{item.quantity}</td>
                                                <td className="px-4 py-4 text-right">
                                                    {isEditingPricing ? (
                                                        <input
                                                            type="number"
                                                            value={item.unit_price || 0}
                                                            onChange={(e) => handleItemPriceChange(item.id, 'unit_price', Number(e.target.value))}
                                                            className="w-24 px-2 py-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                                                        />
                                                    ) : (
                                                        <span className="font-medium">
                                                            {item.unit_price ? `₹${item.unit_price.toLocaleString()}` : '—'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    {isEditingPricing ? (
                                                        <input
                                                            type="number"
                                                            value={item.discount_percentage || 0}
                                                            onChange={(e) => handleItemPriceChange(item.id, 'discount_percentage', Number(e.target.value))}
                                                            className="w-16 px-2 py-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                                                            min="0"
                                                            max="100"
                                                        />
                                                    ) : (
                                                        <span>{item.discount_percentage || 0}%</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-right font-semibold">
                                                    ₹{(item.total_price || 0).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {isEditingPricing && (
                                <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsEditingPricing(false)
                                            setEditedItems(quote.items || [])
                                        }}
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSavePricing}
                                        disabled={isSaving}
                                        className="bg-orange-600 hover:bg-orange-700 text-white"
                                    >
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                        Save Pricing
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* === SECTION 5: NOTES & ATTACHMENTS === */}
                    {(quote.notes || (quote.attachments && quote.attachments.length > 0)) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-blue-600" />
                                    Customer Notes & Attachments
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {quote.notes && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
                                    </div>
                                )}
                                {quote.attachments && quote.attachments.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-700">Attachments:</p>
                                        {quote.attachments.map((attachment) => (
                                            <a
                                                key={attachment.id}
                                                href={attachment.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <Download className="w-4 h-4 text-gray-500" />
                                                <span className="flex-1 text-sm text-gray-700 truncate">{attachment.file_name}</span>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* === SECTION 6: ADMIN DECISION PANEL === */}
                    {canEditPricing && (
                        <Card className="border-orange-200 bg-orange-50/30">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Edit2 className="w-5 h-5 text-orange-600" />
                                    Admin Decision Panel
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Response Message (Sent to Customer)
                                    </label>
                                    <textarea
                                        value={adminResponseMessage}
                                        onChange={(e) => setAdminResponseMessage(e.target.value)}
                                        placeholder="Enter a message that will be visible to the customer..."
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Internal Notes (Admin Only)
                                    </label>
                                    <textarea
                                        value={adminInternalNotes}
                                        onChange={(e) => setAdminInternalNotes(e.target.value)}
                                        placeholder="Internal notes for admin reference only..."
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Valid Until (Days from approval)
                                    </label>
                                    <select
                                        value={validUntilDays}
                                        onChange={(e) => setValidUntilDays(Number(e.target.value))}
                                        className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    >
                                        <option value={7}>7 days</option>
                                        <option value={14}>14 days</option>
                                        <option value={30}>30 days</option>
                                        <option value={60}>60 days</option>
                                        <option value={90}>90 days</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 pt-4 border-t">
                                    <Button
                                        onClick={handleApprove}
                                        disabled={isSaving}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Approve Quote
                                    </Button>
                                    <Button
                                        onClick={() => setShowRejectModal(true)}
                                        variant="outline"
                                        className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Reject Quote
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* === SECTION 4: PRICING SUMMARY === */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-green-600" />
                                Quote Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">₹{calculatedTotals.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Discount</span>
                                    <span>-₹{calculatedTotals.discount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">GST (18%)</span>
                                    <span className="font-medium">₹{calculatedTotals.tax.toLocaleString()}</span>
                                </div>
                                <div className="pt-3 border-t-2 border-gray-200 flex justify-between">
                                    <span className="font-bold text-lg">Total</span>
                                    <span className="font-bold text-xl text-orange-600">
                                        ₹{calculatedTotals.total.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {quote.status === 'pending' && (
                                <Button
                                    onClick={handleStartReview}
                                    disabled={isSaving}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Start Review
                                </Button>
                            )}
                            {canConvert && (
                                <Button
                                    onClick={() => setShowConvertModal(true)}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    Convert to Order
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => window.print()}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Quote Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quote Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Quote ID</span>
                                <span className="font-medium">#{quote.quote_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Created</span>
                                <span className="font-medium">
                                    {format(new Date(quote.created_at), 'MMM d, yyyy')}
                                </span>
                            </div>
                            {quote.approved_at && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Approved</span>
                                    <span className="font-medium text-green-700">
                                        {format(new Date(quote.approved_at), 'MMM d, yyyy')}
                                    </span>
                                </div>
                            )}
                            {quote.converted_order_id && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Order ID</span>
                                    <Link href={`/admin/orders/${quote.converted_order_id}`} className="text-orange-600 hover:underline">
                                        View Order →
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Quote</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Provide a reason for rejection. This will be visible to the customer.
                        </p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Enter rejection reason..."
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 resize-none"
                        />
                        <div className="flex gap-3 mt-4">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    setShowRejectModal(false)
                                    setRejectReason('')
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleReject}
                                disabled={isSaving || !rejectReason.trim()}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                            >
                                {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                Reject Quote
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Convert Modal */}
            {showConvertModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Convert to Order</h3>
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-emerald-800">
                                This will create an order from this approved quote. The customer will be notified.
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Items</span>
                                <span className="font-medium">{quote.items?.length || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Total</span>
                                <span className="font-bold text-orange-600">₹{quote.estimated_total.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowConvertModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConvert}
                                disabled={isSaving}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                Convert to Order
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
