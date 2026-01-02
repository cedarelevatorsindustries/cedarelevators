"use client"

import { useState } from "react"
import { Quote, QuoteStatus, UserType, QuoteMessage } from "@/types/b2b/quote"
import { addQuoteMessage, convertQuoteToOrder } from "@/lib/actions/quotes"
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
    ShoppingCart,
    Download,
    Building2
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDistanceToNow, format } from "date-fns"
import { toast } from "sonner"

interface QuoteDetailClientProps {
    quote: Quote
    userType: UserType
}

const getStatusConfig = (status: QuoteStatus) => {
    switch (status) {
        case 'pending':
            return { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Clock, label: 'Pending Review' }
        case 'reviewing':
            return { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: FileText, label: 'Under Review' }
        case 'approved':
            return { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle, label: 'Approved' }
        case 'rejected':
            return { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Rejected' }
        case 'converted':
            return { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: ShoppingCart, label: 'Converted to Order' }
        default:
            return { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: FileText, label: status }
    }
}

export default function QuoteDetailClient({ quote, userType }: QuoteDetailClientProps) {
    const router = useRouter()
    const [message, setMessage] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [isConverting, setIsConverting] = useState(false)
    const [messages, setMessages] = useState<QuoteMessage[]>(quote.messages || [])

    const statusConfig = getStatusConfig(quote.status)
    const StatusIcon = statusConfig.icon

    const handleSendMessage = async () => {
        if (!message.trim()) return

        setIsSending(true)
        try {
            const result = await addQuoteMessage(quote.id, message)
            if (result.success) {
                setMessages([...messages, {
                    id: Date.now().toString(),
                    quote_id: quote.id,
                    sender_type: 'user',
                    message,
                    is_internal: false,
                    created_at: new Date().toISOString()
                }])
                setMessage('')
                toast.success('Message sent')
            } else {
                toast.error(result.error || 'Failed to send message')
            }
        } catch (error) {
            toast.error('Failed to send message')
        } finally {
            setIsSending(false)
        }
    }

    const handleConvertToOrder = async () => {
        setIsConverting(true)
        try {
            const result = await convertQuoteToOrder(quote.id)
            if (result.success) {
                toast.success('Quote converted to order! Redirecting to cart...')
                router.push('/cart')
            } else {
                toast.error(result.error || 'Failed to convert quote')
            }
        } catch (error) {
            toast.error('Failed to convert quote')
        } finally {
            setIsConverting(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Back Button */}
            <Link
                href="/quotes"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Quotes
            </Link>

            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${statusConfig.color.split(' ')[0]}`}>
                            <StatusIcon className={`w-7 h-7 ${statusConfig.color.split(' ')[1]}`} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Quote #{quote.quote_number}</h1>
                            <p className="text-gray-500">
                                Created {formatDistanceToNow(new Date(quote.created_at), { addSuffix: true })}
                            </p>
                        </div>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${statusConfig.color}`}>
                        {statusConfig.label}
                    </span>
                </div>

                {/* Quote Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                    <div>
                        <p className="text-sm text-gray-500">Items</p>
                        <p className="text-lg font-semibold text-gray-900">{quote.items?.length || 0}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Priority</p>
                        <p className="text-lg font-semibold text-gray-900 capitalize">{quote.priority}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Valid Until</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {quote.valid_until ? format(new Date(quote.valid_until), 'MMM d, yyyy') : 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Estimated Total</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {quote.estimated_total > 0 ? `₹${quote.estimated_total.toLocaleString()}` : 'Pending'}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                {quote.status === 'approved' && (
                    <div className="mt-6 pt-4 border-t border-gray-100">
                        <button
                            onClick={handleConvertToOrder}
                            disabled={isConverting}
                            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            {isConverting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <ShoppingCart className="w-5 h-5" />
                            )}
                            Convert to Order
                        </button>
                    </div>
                )}
            </div>

            {/* Company Details (Business users) */}
            {quote.company_details && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Building2 className="w-5 h-5 text-gray-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Company Details</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {quote.company_details.company_name && (
                            <div>
                                <p className="text-sm text-gray-500">Company Name</p>
                                <p className="font-medium text-gray-900">{quote.company_details.company_name}</p>
                            </div>
                        )}
                        {quote.company_details.gst_number && (
                            <div>
                                <p className="text-sm text-gray-500">GST Number</p>
                                <p className="font-medium text-gray-900">{quote.company_details.gst_number}</p>
                            </div>
                        )}
                        {quote.company_details.contact_name && (
                            <div>
                                <p className="text-sm text-gray-500">Contact Name</p>
                                <p className="font-medium text-gray-900">{quote.company_details.contact_name}</p>
                            </div>
                        )}
                        {quote.company_details.contact_phone && (
                            <div>
                                <p className="text-sm text-gray-500">Contact Phone</p>
                                <p className="font-medium text-gray-900">{quote.company_details.contact_phone}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Quote Items */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900">Quote Items</h2>
                </div>
                <div className="divide-y divide-gray-100">
                    {quote.items && quote.items.length > 0 ? (
                        quote.items.map((item) => (
                            <div key={item.id} className="p-4 flex items-center gap-4">
                                {/* Thumbnail */}
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

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900 truncate">{item.product_name}</h4>
                                    {item.product_sku && (
                                        <p className="text-sm text-gray-500">SKU: {item.product_sku}</p>
                                    )}
                                    {item.bulk_pricing_requested && (
                                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                                            Bulk Pricing Requested
                                        </span>
                                    )}
                                </div>

                                {/* Quantity and Price */}
                                <div className="text-right">
                                    <p className="font-medium text-gray-900">Qty: {item.quantity}</p>
                                    {item.unit_price > 0 && (
                                        <p className="text-sm text-gray-500">
                                            ₹{item.unit_price.toLocaleString()} each
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            No items in this quote
                        </div>
                    )}
                </div>
            </div>

            {/* Notes */}
            {quote.notes && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Your Notes</h2>
                    <p className="text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
                </div>
            )}

            {/* Admin Notes */}
            {quote.admin_notes && (
                <div className="bg-blue-50 rounded-xl border border-blue-200 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-blue-900 mb-3">Response from Cedar</h2>
                    <p className="text-blue-800 whitespace-pre-wrap">{quote.admin_notes}</p>
                    {quote.admin_response_at && (
                        <p className="text-sm text-blue-600 mt-3">
                            Responded {formatDistanceToNow(new Date(quote.admin_response_at), { addSuffix: true })}
                        </p>
                    )}
                </div>
            )}

            {/* Attachments */}
            {quote.attachments && quote.attachments.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h2>
                    <div className="space-y-2">
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
                </div>
            )}

            {/* Messages */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                </div>

                {/* Message List */}
                <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                    {messages.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">
                            No messages yet. Send a message to our team below.
                        </p>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[75%] rounded-xl px-4 py-3 ${msg.sender_type === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-800'
                                        }`}
                                >
                                    <p className="text-sm">{msg.message}</p>
                                    <p className={`text-xs mt-1 ${msg.sender_type === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-100">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={isSending || !message.trim()}
                            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
