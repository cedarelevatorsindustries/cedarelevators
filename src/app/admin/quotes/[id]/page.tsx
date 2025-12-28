"use client"

import { useState, useEffect, use } from "react"
import { Quote, QuoteStatus, QuotePriority, QuoteMessage } from "@/types/b2b/quote"
import {
    getAdminQuoteById,
    updateQuoteStatus,
    updateQuotePriority,
    updateQuotePricing,
    updateQuoteItemPricing,
    addAdminQuoteMessage
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
    DollarSign
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
            return { color: 'bg-orange-100 text-orange-700', label: 'Pending Review' }
        case 'in_review':
            return { color: 'bg-blue-100 text-blue-700', label: 'Under Review' }
        case 'negotiation':
            return { color: 'bg-purple-100 text-purple-700', label: 'In Negotiation' }
        case 'revised':
            return { color: 'bg-indigo-100 text-indigo-700', label: 'Quote Revised' }
        case 'accepted':
            return { color: 'bg-green-100 text-green-700', label: 'Accepted' }
        case 'rejected':
            return { color: 'bg-red-100 text-red-700', label: 'Rejected' }
        case 'converted':
            return { color: 'bg-emerald-100 text-emerald-700', label: 'Converted to Order' }
        default:
            return { color: 'bg-gray-100 text-gray-700', label: status }
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
    const [pricing, setPricing] = useState({
        subtotal: 0,
        discount_total: 0,
        tax_total: 0,
        estimated_total: 0
    })

    // Message state
    const [message, setMessage] = useState('')
    const [isInternalMessage, setIsInternalMessage] = useState(false)
    const [isSendingMessage, setIsSendingMessage] = useState(false)
    const [messages, setMessages] = useState<QuoteMessage[]>([])

    // Status update
    const [selectedStatus, setSelectedStatus] = useState<QuoteStatus>('pending')
    const [adminNotes, setAdminNotes] = useState('')

    useEffect(() => {
        loadQuote()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    const loadQuote = async () => {
        try {
            const result = await getAdminQuoteById(id)
            if (result.success && result.quote) {
                setQuote(result.quote)
                setMessages(result.quote.messages || [])
                setSelectedStatus(result.quote.status)
                setAdminNotes(result.quote.admin_notes || '')
                setPricing({
                    subtotal: result.quote.subtotal,
                    discount_total: result.quote.discount_total,
                    tax_total: result.quote.tax_total,
                    estimated_total: result.quote.estimated_total
                })
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

    const handleStatusUpdate = async () => {
        if (!quote) return
        setIsSaving(true)
        try {
            const result = await updateQuoteStatus(quote.id, selectedStatus, adminNotes)
            if (result.success) {
                toast.success(`Status updated to ${selectedStatus}`)
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

    const handlePricingUpdate = async () => {
        if (!quote) return
        setIsSaving(true)
        try {
            const result = await updateQuotePricing(quote.id, pricing)
            if (result.success) {
                toast.success('Pricing updated')
                setIsEditingPricing(false)
                loadQuote()
            } else {
                toast.error(result.error || 'Failed to update pricing')
            }
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

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quote #{quote.quote_number}</h1>
                    <p className="text-gray-600 mt-1">
                        Created {formatDistanceToNow(new Date(quote.created_at), { addSuffix: true })}
                    </p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusConfig.color}`}>
                    {statusConfig.label}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                {quote.user_type === 'business' || quote.user_type === 'verified' ? (
                                    <Building2 className="w-5 h-5 text-purple-600" />
                                ) : (
                                    <User className="w-5 h-5 text-blue-600" />
                                )}
                                Customer Details
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
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium text-gray-900">{quote.guest_email || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="font-medium text-gray-900">{quote.guest_phone || quote.company_details?.contact_phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">User Type</p>
                                    <p className="font-medium text-gray-900 capitalize">{quote.user_type}</p>
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

                    {/* Quote Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Package className="w-5 h-5 text-orange-600" />
                                Quote Items ({quote.items?.length || 0})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y divide-gray-100">
                                {quote.items && quote.items.length > 0 ? (
                                    quote.items.map((item) => (
                                        <div key={item.id} className="py-4 flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                                                {item.product_thumbnail ? (
                                                    <img
                                                        src={item.product_thumbnail}
                                                        alt={item.product_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <Package className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-gray-900 truncate">{item.product_name}</h4>
                                                {item.product_sku && (
                                                    <p className="text-sm text-gray-500">SKU: {item.product_sku}</p>
                                                )}
                                                {item.bulk_pricing_requested && (
                                                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                                                        Bulk Pricing
                                                    </span>
                                                )}
                                            </div>

                                            <div className="text-center">
                                                <p className="text-sm text-gray-500">Qty</p>
                                                <p className="font-semibold text-gray-900">{item.quantity}</p>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">Unit Price</p>
                                                <p className="font-semibold text-gray-900">
                                                    {item.unit_price > 0 ? `₹${item.unit_price.toLocaleString()}` : '—'}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="py-8 text-center text-gray-500">No items in this quote</p>
                                )}
                            </div>
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

                    {/* Messages */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-blue-600" />
                                Communication
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Message List */}
                            <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                                {messages.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">
                                        No messages yet. Send a message to the customer below.
                                    </p>
                                ) : (
                                    messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[75%] rounded-xl px-4 py-3 ${msg.is_internal
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
                                                <p className={`text-xs mt-1 ${msg.is_internal ? 'text-yellow-600' :
                                                        msg.sender_type === 'admin' ? 'text-orange-200' : 'text-gray-500'
                                                    }`}>
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
                    {/* Status Update */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Update Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value as QuoteStatus)}
                                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="pending">Pending</option>
                                <option value="in_review">In Review</option>
                                <option value="negotiation">Negotiation</option>
                                <option value="revised">Revised (Price Updated)</option>
                                <option value="accepted">Accepted</option>
                                <option value="rejected">Rejected</option>
                            </select>

                            <textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Add admin notes (visible to customer)..."
                                rows={3}
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                            />

                            <Button
                                onClick={handleStatusUpdate}
                                disabled={isSaving}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Update Status
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Pricing */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-green-600" />
                                Pricing
                            </CardTitle>
                            {!isEditingPricing && (
                                <Button variant="ghost" size="sm" onClick={() => setIsEditingPricing(true)}>
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            {isEditingPricing ? (
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm text-gray-500">Subtotal</label>
                                        <input
                                            type="number"
                                            value={pricing.subtotal}
                                            onChange={(e) => setPricing({ ...pricing, subtotal: Number(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Discount</label>
                                        <input
                                            type="number"
                                            value={pricing.discount_total}
                                            onChange={(e) => setPricing({ ...pricing, discount_total: Number(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Tax (GST)</label>
                                        <input
                                            type="number"
                                            value={pricing.tax_total}
                                            onChange={(e) => setPricing({ ...pricing, tax_total: Number(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 font-semibold">Total</label>
                                        <input
                                            type="number"
                                            value={pricing.estimated_total}
                                            onChange={(e) => setPricing({ ...pricing, estimated_total: Number(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg font-semibold"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handlePricingUpdate}
                                            disabled={isSaving}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                        >
                                            <Save className="w-4 h-4 mr-1" />
                                            Save
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsEditingPricing(false)}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">₹{quote.subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span>-₹{quote.discount_total.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tax (GST)</span>
                                        <span className="font-medium">₹{quote.tax_total.toLocaleString()}</span>
                                    </div>
                                    <div className="pt-3 border-t border-gray-200 flex justify-between">
                                        <span className="font-semibold text-gray-900">Total</span>
                                        <span className="font-bold text-lg text-gray-900">
                                            ₹{quote.estimated_total.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quote Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quote Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Priority</span>
                                <span className="font-medium capitalize">{quote.priority}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Valid Until</span>
                                <span className="font-medium">
                                    {quote.valid_until ? format(new Date(quote.valid_until), 'MMM d, yyyy') : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Created</span>
                                <span className="font-medium">
                                    {format(new Date(quote.created_at), 'MMM d, yyyy h:mm a')}
                                </span>
                            </div>
                            {quote.admin_response_at && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Last Updated</span>
                                    <span className="font-medium">
                                        {format(new Date(quote.admin_response_at), 'MMM d, yyyy h:mm a')}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
