"use client"

import { useState, useEffect, use, useMemo } from "react"
import { Quote, QuoteStatus, QuotePriority, QuoteMessage, QuoteItem } from "@/types/b2b/quote"
import {
    getAdminQuoteById,
    updateQuoteStatus,
    updateQuotePriority,
    updateQuotePricing,
    updateQuoteItemPricing,
    addAdminQuoteMessage,
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
    Send,
    Loader2,
    MessageSquare,
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
    TrendingUp,
    Calendar,
    ShoppingCart
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDistanceToNow, format } from "date-fns"
import { toast } from "sonner"
import { Button } from "@/components/ui/admin-ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/admin-ui/card"

interface AdminQuoteDetailProps {
    params: Promise<{ id: string }>
}

const getStatusConfig = (status: QuoteStatus) => {
    switch (status) {
        case 'pending':
            return { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Clock, label: 'Pending Review', action: 'Start Review' }
        case 'reviewing':
            return { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Eye, label: 'Reviewing', action: 'Approve Quote' }
        case 'approved':
            return { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle, label: 'Approved', action: 'Convert to Order' }
        case 'rejected':
            return { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Rejected', action: null }
        case 'converted':
            return { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: ShoppingCart, label: 'Converted to Order', action: null }
        default:
            return { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: FileText, label: status, action: null }
    }
}

const getPriorityConfig = (priority: QuotePriority) => {
    switch (priority) {
        case 'high':
            return { color: 'text-red-600', bg: 'bg-red-100 border-red-200', label: 'High Priority' }
        case 'medium':
            return { color: 'text-orange-600', bg: 'bg-orange-100 border-orange-200', label: 'Medium Priority' }
        case 'low':
            return { color: 'text-gray-600', bg: 'bg-gray-100 border-gray-200', label: 'Low Priority' }
        default:
            return { color: 'text-gray-600', bg: 'bg-gray-100 border-gray-200', label: priority }
    }
}

export default function AdminQuoteDetailPage({ params }: AdminQuoteDetailProps) {
    const { id } = use(params)
    const router = useRouter()
    const [quote, setQuote] = useState<Quote | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    // Editing states
    const [isEditingItems, setIsEditingItems] = useState(false)
    const [editedItems, setEditedItems] = useState<QuoteItem[]>([])

    // Message state
    const [message, setMessage] = useState('')
    const [isInternalMessage, setIsInternalMessage] = useState(false)
    const [isSendingMessage, setIsSendingMessage] = useState(false)
    const [messages, setMessages] = useState<QuoteMessage[]>([])

    // Action states
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [rejectReason, setRejectReason] = useState('')
    const [showConvertModal, setShowConvertModal] = useState(false)

    // Priority editing
    const [isEditingPriority, setIsEditingPriority] = useState(false)
    const [selectedPriority, setSelectedPriority] = useState<QuotePriority>('medium')

    useEffect(() => {
        loadQuote()
    }, [id])

    const loadQuote = async () => {
        try {
            const result = await getAdminQuoteById(id)
            if (result.success && result.quote) {
                setQuote(result.quote)
                setMessages(result.quote.messages || [])
                setEditedItems(result.quote.items || [])
                setSelectedPriority(result.quote.priority)
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
        const subtotal = editedItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)
        const discount = editedItems.reduce((sum, item) => {
            const itemTotal = item.unit_price * item.quantity
            const discountAmount = itemTotal * (item.discount_percentage / 100)
            return sum + discountAmount
        }, 0)
        const subtotalAfterDiscount = subtotal - discount
        const tax = subtotalAfterDiscount * 0.18 // 18% GST
        const total = subtotalAfterDiscount + tax

        return {
            subtotal,
            discount,
            tax,
            total
        }
    }, [editedItems])

    const handleStartReview = async () => {
        if (!quote) return
        setIsSaving(true)
        try {
            const result = await updateQuoteStatus(quote.id, 'reviewing')
            if (result.success) {
                toast.success('Quote status updated to Reviewing')
                loadQuote()
            } else {
                toast.error(result.error || 'Failed to update status')
            }
        } catch (error) {
            toast.error('Failed to update status')
        } finally {
            setIsSaving(false)
        }
    }

    const handleApprove = async () => {
        if (!quote) return
        
        // Validation
        if (editedItems.some(item => !item.unit_price || item.unit_price === 0)) {
            toast.error('All items must have pricing before approval')
            return
        }

        if (calculatedTotals.total === 0) {
            toast.error('Quote must have a valid total before approval')
            return
        }

        setIsSaving(true)
        try {
            // First save pricing if edited
            if (isEditingItems) {
                await handleSaveItemPricing()
            }

            const result = await approveQuote(quote.id, {
                validUntilDays: 30,
                adminNotes: `Approved quote with total ₹${calculatedTotals.total.toLocaleString()}`
            })
            
            if (result.success) {
                toast.success('Quote approved successfully!')
                loadQuote()
            } else {
                toast.error(result.error || 'Failed to approve quote')
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
                toast.error(result.error || 'Failed to reject quote')
            }
        } catch (error) {
            toast.error('Failed to reject quote')
        } finally {
            setIsSaving(false)
        }
    }

    const handleItemPriceChange = (itemId: string, field: 'unit_price' | 'discount_percentage', value: number) => {
        setEditedItems(items =>
            items.map(item => {
                if (item.id === itemId) {
                    const updated = { ...item, [field]: value }
                    // Recalculate total_price
                    const subtotal = updated.unit_price * updated.quantity
                    const discount = subtotal * (updated.discount_percentage / 100)
                    updated.total_price = subtotal - discount
                    return updated
                }
                return item
            })
        )
    }

    const handleSaveItemPricing = async () => {
        if (!quote) return
        setIsSaving(true)
        try {
            // Update each item
            for (const item of editedItems) {
                await updateQuoteItemPricing(item.id, {
                    unit_price: item.unit_price,
                    discount_percentage: item.discount_percentage,
                    total_price: item.total_price
                })
            }

            // Update quote totals
            await updateQuotePricing(quote.id, {
                subtotal: calculatedTotals.subtotal,
                discount_total: calculatedTotals.discount,
                tax_total: calculatedTotals.tax,
                estimated_total: calculatedTotals.total
            })

            toast.success('Pricing updated successfully')
            setIsEditingItems(false)
            loadQuote()
        } catch (error) {
            toast.error('Failed to update pricing')
        } finally {
            setIsSaving(false)
        }
    }

    const handleSendMessage = async () => {
        if (!quote || !message.trim()) return
        setIsSendingMessage(true)
        try {
            const result = await addAdminQuoteMessage(quote.id, message, isInternalMessage)
            if (result.success) {
                setMessages([...messages, {
                    id: Date.now().toString(),
                    quote_id: quote.id,
                    sender_type: 'admin',
                    sender_name: 'Cedar Team',
                    message,
                    is_internal: isInternalMessage,
                    created_at: new Date().toISOString()
                }])
                setMessage('')
                toast.success(isInternalMessage ? 'Internal note added' : 'Message sent to customer')
            } else {
                toast.error(result.error || 'Failed to send message')
            }
        } catch (error) {
            toast.error('Failed to send message')
        } finally {
            setIsSendingMessage(false)
        }
    }

    const handlePriorityUpdate = async () => {
        if (!quote) return
        setIsSaving(true)
        try {
            const result = await updateQuotePriority(quote.id, selectedPriority)
            if (result.success) {
                toast.success('Priority updated')
                setIsEditingPriority(false)
                loadQuote()
            } else {
                toast.error(result.error || 'Failed to update priority')
            }
        } catch (error) {
            toast.error('Failed to update priority')
        } finally {
            setIsSaving(false)
        }
    }

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
    const priorityConfig = getPriorityConfig(quote.priority)
    const StatusIcon = statusConfig.icon

    return (
        <div className="space-y-6" data-testid="admin-quote-detail">
            {/* Back Button */}
            <Link
                href="/admin/quotes"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Quotes
            </Link>

            {/* A. STICKY QUOTE HEADER */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm p-6 -mx-6 mb-6" data-testid="quote-header">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">Quote #{quote.quote_number}</h1>
                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${statusConfig.color}`}>
                                <StatusIcon className="w-4 h-4" />
                                {statusConfig.label}
                            </span>
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

                    {/* Priority Badge with Edit */}
                    <div className="flex items-center gap-3">
                        {isEditingPriority ? (
                            <div className="flex items-center gap-2">
                                <select
                                    value={selectedPriority}
                                    onChange={(e) => setSelectedPriority(e.target.value as QuotePriority)}
                                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                                <Button size="sm" onClick={handlePriorityUpdate} disabled={isSaving}>
                                    <Save className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setIsEditingPriority(false)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsEditingPriority(true)}
                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${priorityConfig.bg} ${priorityConfig.color} hover:opacity-80`}
                            >
                                <TrendingUp className="w-4 h-4" />
                                {priorityConfig.label}
                            </button>
                        )}

                        {/* Primary CTA (Context-aware) */}
                        {statusConfig.action && quote.status === 'pending' && (
                            <Button
                                onClick={handleStartReview}
                                disabled={isSaving}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                data-testid="start-review-btn"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                                Start Review
                            </Button>
                        )}

                        {statusConfig.action && quote.status === 'reviewing' && (
                            <Button
                                onClick={handleApprove}
                                disabled={isSaving}
                                className="bg-green-600 hover:bg-green-700 text-white"
                                data-testid="approve-quote-btn"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                                Approve Quote
                            </Button>
                        )}

                        {quote.status === 'reviewing' && (
                            <Button
                                onClick={() => setShowRejectModal(true)}
                                variant="outline"
                                className="border-red-200 text-red-700 hover:bg-red-50"
                                data-testid="reject-quote-btn"
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                            </Button>
                        )}

                        {statusConfig.action && quote.status === 'approved' && quote.user_type === 'verified' && (
                            <Button
                                onClick={() => setShowConvertModal(true)}
                                disabled={isSaving}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                data-testid="convert-to-order-btn"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShoppingCart className="w-4 h-4 mr-2" />}
                                Convert to Order
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* B. CUSTOMER CONTEXT PANEL */}
                    <Card data-testid="customer-context-panel">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                {quote.user_type === 'business' || quote.user_type === 'verified' ? (
                                    <Building2 className="w-5 h-5 text-purple-600" />
                                ) : (
                                    <User className="w-5 h-5 text-blue-600" />
                                )}
                                Customer Information
                                {quote.user_type === 'verified' && (
                                    <BadgeCheck className="w-5 h-5 text-green-600" title="Verified Business" />
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Customer Name</p>
                                    <p className="font-medium text-gray-900 flex items-center gap-2">
                                        {quote.guest_name || quote.company_details?.contact_name || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Account Type</p>
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                                        quote.user_type === 'verified' ? 'bg-green-100 text-green-700' :
                                        quote.user_type === 'business' ? 'bg-purple-100 text-purple-700' :
                                        quote.user_type === 'individual' ? 'bg-blue-100 text-blue-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {quote.user_type === 'verified' && <BadgeCheck className="w-3 h-3" />}
                                        {quote.user_type.charAt(0).toUpperCase() + quote.user_type.slice(1)}
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
                                    <p className="font-medium text-gray-900">{quote.guest_phone || quote.company_details?.contact_phone || 'N/A'}</p>
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
                            {quote.clerk_user_id && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <Link
                                        href={`/admin/customers/${quote.clerk_user_id}`}
                                        className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                                    >
                                        View Customer Profile →
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* C. QUOTE ITEMS TABLE */}
                    <Card data-testid="quote-items-table">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Package className="w-5 h-5 text-orange-600" />
                                Quote Items ({editedItems.length})
                            </CardTitle>
                            {!isEditingItems && quote.status === 'reviewing' && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsEditingItems(true)}
                                    className="border-orange-200 text-orange-700 hover:bg-orange-50"
                                >
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Edit Pricing
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
                                                        <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                                                            {item.product_thumbnail ? (
                                                                <img src={item.product_thumbnail} alt={item.product_name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                    <Package className="w-5 h-5" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{item.product_name}</p>
                                                            {item.product_sku && (
                                                                <p className="text-xs text-gray-500">SKU: {item.product_sku}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <span className="font-semibold text-gray-900">{item.quantity}</span>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    {isEditingItems ? (
                                                        <input
                                                            type="number"
                                                            value={item.unit_price}
                                                            onChange={(e) => handleItemPriceChange(item.id, 'unit_price', Number(e.target.value))}
                                                            className="w-24 px-2 py-1 text-right border border-gray-200 rounded"
                                                        />
                                                    ) : (
                                                        <span className="font-medium text-gray-900">
                                                            {item.unit_price > 0 ? `₹${item.unit_price.toLocaleString()}` : '—'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    {isEditingItems ? (
                                                        <input
                                                            type="number"
                                                            value={item.discount_percentage}
                                                            onChange={(e) => handleItemPriceChange(item.id, 'discount_percentage', Number(e.target.value))}
                                                            className="w-16 px-2 py-1 text-right border border-gray-200 rounded"
                                                            min="0"
                                                            max="100"
                                                        />
                                                    ) : (
                                                        <span className="text-gray-700">{item.discount_percentage}%</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <span className="font-semibold text-gray-900">
                                                        ₹{item.total_price.toLocaleString()}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {isEditingItems && (
                                <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsEditingItems(false)
                                            setEditedItems(quote.items || [])
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSaveItemPricing}
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

                    {/* Customer Notes */}
                    {quote.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Customer Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Attachments */}
                    {quote.attachments && quote.attachments.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Attachments ({quote.attachments.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-2">
                                    {quote.attachments.map((attachment) => (
                                        <a
                                            key={attachment.id}
                                            href={attachment.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <Download className="w-5 h-5 text-gray-500" />
                                            <span className="flex-1 text-gray-700 truncate">{attachment.file_name}</span>
                                            {attachment.file_size && (
                                                <span className="text-sm text-gray-400">
                                                    {(attachment.file_size / 1024 / 1024).toFixed(2)} MB
                                                </span>
                                            )}
                                        </a>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* E. UNIFIED COMMUNICATION TIMELINE */}
                    <Card data-testid="communication-timeline">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-blue-600" />
                                Communication & Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Message List */}
                            <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                                {messages.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">
                                        No messages yet. Start communication with the customer below.
                                    </p>
                                ) : (
                                    messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[75%] rounded-xl px-4 py-3 ${
                                                    msg.is_internal
                                                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                                        : msg.sender_type === 'admin'
                                                        ? 'bg-orange-600 text-white'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {msg.is_internal && (
                                                    <p className="text-xs font-medium mb-1">📌 Internal Note</p>
                                                )}
                                                <p className="text-sm">{msg.message}</p>
                                                <p
                                                    className={`text-xs mt-1 ${
                                                        msg.is_internal
                                                            ? 'text-yellow-600'
                                                            : msg.sender_type === 'admin'
                                                            ? 'text-orange-200'
                                                            : 'text-gray-500'
                                                    }`}
                                                >
                                                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Message Input */}
                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                    <label className="flex items-center gap-2 text-sm text-gray-600">
                                        <input
                                            type="checkbox"
                                            checked={isInternalMessage}
                                            onChange={(e) => setIsInternalMessage(e.target.checked)}
                                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                        />
                                        Internal note (not visible to customer)
                                    </label>
                                </div>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder={isInternalMessage ? "Add internal note..." : "Type a message to customer..."}
                                        className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                    />
                                    <Button
                                        onClick={handleSendMessage}
                                        disabled={isSendingMessage || !message.trim()}
                                        className="bg-orange-600 hover:bg-orange-700 text-white"
                                    >
                                        {isSendingMessage ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Send className="w-5 h-5" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* D. QUOTE SUMMARY PANEL */}
                    <Card data-testid="quote-summary-panel">
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
                                    <span className="font-medium text-gray-900">₹{calculatedTotals.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Discount</span>
                                    <span>-₹{calculatedTotals.discount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">GST (18%)</span>
                                    <span className="font-medium text-gray-900">₹{calculatedTotals.tax.toLocaleString()}</span>
                                </div>
                                <div className="pt-3 border-t-2 border-gray-200 flex justify-between">
                                    <span className="font-bold text-gray-900 text-lg">Total</span>
                                    <span className="font-bold text-2xl text-orange-600">
                                        ₹{calculatedTotals.total.toLocaleString()}
                                    </span>
                                </div>
                                {quote.valid_until && (
                                    <div className="pt-3 border-t border-gray-100 text-sm text-gray-600">
                                        Valid until: {format(new Date(quote.valid_until), 'MMM d, yyyy')}
                                    </div>
                                )}
                                {isEditingItems && (
                                    <div className="pt-3 border-t border-gray-100">
                                        <p className="text-xs text-amber-600 flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" />
                                            Save pricing to update totals
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* F. ACTIONS PANEL */}
                    <Card data-testid="actions-panel">
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
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
                            
                            {quote.status === 'reviewing' && (
                                <>
                                    <Button
                                        onClick={handleApprove}
                                        disabled={isSaving}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Approve Quote
                                    </Button>
                                    <Button
                                        onClick={() => setShowRejectModal(true)}
                                        variant="outline"
                                        className="w-full border-red-200 text-red-700 hover:bg-red-50"
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Reject Quote
                                    </Button>
                                </>
                            )}

                            {quote.status === 'approved' && quote.user_type === 'verified' && (
                                <Button
                                    onClick={() => setShowConvertModal(true)}
                                    disabled={isSaving}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    Convert to Order
                                </Button>
                            )}

                            <div className="pt-3 border-t border-gray-200">
                                <p className="text-xs text-gray-500 mb-2">Additional Options</p>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => window.print()}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download PDF
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quote Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quote Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Quote ID</span>
                                <span className="font-medium text-gray-900">#{quote.quote_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Created</span>
                                <span className="font-medium text-gray-900">
                                    {format(new Date(quote.created_at), 'MMM d, yyyy h:mm a')}
                                </span>
                            </div>
                            {quote.admin_response_at && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Last Updated</span>
                                    <span className="font-medium text-gray-900">
                                        {format(new Date(quote.admin_response_at), 'MMM d, yyyy h:mm a')}
                                    </span>
                                </div>
                            )}
                            {quote.approved_at && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Approved</span>
                                    <span className="font-medium text-green-700">
                                        {format(new Date(quote.approved_at), 'MMM d, yyyy h:mm a')}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Quote</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Please provide a reason for rejecting this quote. This will be visible to the customer.
                        </p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Enter rejection reason..."
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
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
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Reject Quote
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Convert to Order Modal */}
            {showConvertModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Convert to Order</h3>
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    <strong>Note:</strong> This feature will create an order from the approved quote. 
                                    The customer will be notified and the order will be ready for processing.
                                </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Items</span>
                                    <span className="font-medium">{quote.items?.length || 0}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Total Amount</span>
                                    <span className="font-bold text-orange-600">₹{quote.estimated_total.toLocaleString()}</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500">
                                This action cannot be undone. The quote will be marked as converted.
                            </p>
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
                                onClick={async () => {
                                    setIsSaving(true)
                                    try {
                                        const result = await convertQuoteToOrder(quote.id, {
                                            shipping_address_id: '',
                                            delivery_method: 'standard'
                                        })
                                        if (result.success) {
                                            toast.success('Quote converted to order successfully!')
                                            setShowConvertModal(false)
                                            loadQuote()
                                        } else {
                                            toast.error(result.error || 'Failed to convert quote')
                                        }
                                    } catch (error) {
                                        toast.error('Failed to convert quote')
                                    } finally {
                                        setIsSaving(false)
                                    }
                                }}
                                disabled={isSaving}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Convert to Order
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
