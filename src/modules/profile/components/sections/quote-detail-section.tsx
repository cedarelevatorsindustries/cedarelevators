'use client'

import { useState, useEffect } from 'react'
import { Quote, QuoteMessage, QuoteStatus } from '@/types/b2b/quote'
import {
  ArrowLeft, Download, CircleCheck, X, RefreshCw,
  FileText, Calendar, Building2, User, Mail, Phone,
  MessageSquare, Send, Paperclip, Package, TrendingUp,
  Clock, AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'

interface QuoteDetailSectionProps {
  quoteNumber: string
  onBack: () => void
}

export default function QuoteDetailSection({ quoteNumber, onBack }: QuoteDetailSectionProps) {
  const [newMessage, setNewMessage] = useState('')
  const [showChat, setShowChat] = useState(true)
  const [quote, setQuote] = useState<Quote | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSendingMessage, setIsSendingMessage] = useState(false)

  // Fetch quote data
  useEffect(() => {
    async function fetchQuote() {
      setIsLoading(true)
      try {
        const { getQuoteByNumber } = await import('@/lib/actions/quotes')
        const result = await getQuoteByNumber(quoteNumber)

        if (result.success && 'quote' in result && result.quote) {
          setQuote(result.quote as Quote)
        }
      } catch (error) {
        console.error('Error fetching quote:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuote()
  }, [quoteNumber])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !quote) return

    setIsSendingMessage(true)
    try {
      const { addQuoteMessage } = await import('@/lib/actions/quotes')
      const result = await addQuoteMessage(quote.id, newMessage)

      if (result.success) {
        // Refresh quote data
        const { getQuoteByNumber } = await import('@/lib/actions/quotes')
        const refreshResult = await getQuoteByNumber(quoteNumber)
        if (refreshResult.success && 'quote' in refreshResult && refreshResult.quote) {
          setQuote(refreshResult.quote as Quote)
        }
        setNewMessage('')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
    } finally {
      setIsSendingMessage(false)
    }
  }

  const handleUpdateStatus = async (newStatus: string) => {
    if (!quote) return

    try {
      const { updateQuoteStatus } = await import('@/lib/actions/quotes')
      const result = await updateQuoteStatus(quote.id, newStatus)

      if (result.success) {
        // Refresh quote data
        const { getQuoteByNumber } = await import('@/lib/actions/quotes')
        const refreshResult = await getQuoteByNumber(quoteNumber)
        if (refreshResult.success && 'quote' in refreshResult && refreshResult.quote) {
          setQuote(refreshResult.quote as Quote)
        }
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    }
  }

  const handleDownloadPDF = async () => {
    if (!quote) return

    try {
      const { generateQuotePDF } = await import('@/lib/actions/quotes')
      const result = await generateQuotePDF(quote.quote_number)

      if (result.success && result.url) {
        window.open(result.url, '_blank')
      }
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to download PDF')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quote...</p>
        </div>
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Quote not found</p>
        <button
          onClick={onBack}
          className="mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
        >
          Back to Quotes
        </button>
      </div>
    )
  }

  // Mock data for fallback - replace with actual API call
  const mockQuote: Quote = {
    id: '1',
    quote_number: 'Q10042',
    user_type: 'business',
    status: 'approved' as QuoteStatus,
    priority: 'medium',
    company_details: {
      company_name: 'CEDAR ELEVATORS INDUSTRIES',
      contact_name: 'Rajesh Kumar',
    },
    guest_email: 'rajesh@cedar.com',
    clerk_user_id: 'user_123',
    created_at: '2025-11-18T10:00:00Z',
    updated_at: '2025-11-18T10:00:00Z',
    valid_until: '2025-12-18T10:00:00Z',
    subtotal: 1036400,
    tax_total: 186552,
    discount_total: 148800,
    estimated_total: 1240000,
    bulk_pricing_requested: false,
    items: [
      {
        id: '1',
        quote_id: '1',
        variant_id: 'var1',
        product_id: 'prod1',
        product_name: 'Elevator Controller',
        quantity: 5,
        unit_price: 85000,
        total_price: 374000,
        discount_percentage: 12,
        bulk_pricing_requested: false,
        created_at: '2025-11-18T10:00:00Z',
      },
      {
        id: '2',
        quote_id: '1',
        variant_id: 'var2',
        product_id: 'prod2',
        product_name: 'Traction Machine',
        quantity: 3,
        unit_price: 240000,
        total_price: 662400,
        discount_percentage: 8,
        bulk_pricing_requested: false,
        created_at: '2025-11-18T10:00:00Z',
      },
    ],
    attachments: [
      {
        id: '1',
        quote_id: '1',
        file_name: 'Technical Drawing.pdf',
        file_url: '/attachments/tech-drawing.pdf',
        file_size: 1024000,
        mime_type: 'application/pdf',
        uploaded_at: '2025-11-18T10:00:00Z',
      },
      {
        id: '2',
        quote_id: '1',
        file_name: 'Payment Terms.pdf',
        file_url: '/attachments/payment-terms.pdf',
        file_size: 512000,
        mime_type: 'application/pdf',
        uploaded_at: '2025-11-18T10:00:00Z',
      },
    ],
    messages: [
      {
        id: '1',
        quote_id: '1',
        sender_type: 'user',
        sender_id: 'user1',
        sender_name: 'Rajesh Kumar',
        message: 'Can you give 2% extra discount?',
        created_at: '2025-11-18T11:00:00Z',
        is_internal: false,
      },
      {
        id: '2',
        quote_id: '1',
        sender_type: 'admin',
        sender_id: 'sales1',
        sender_name: 'Sales Team',
        message: 'Done! Revised quote attached.',
        created_at: '2025-11-18T12:00:00Z',
        is_internal: false,
      },
    ],
  }

  // Use actual quote data

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = () => {
    const configs: Record<QuoteStatus, { label: string; color: string; icon: any }> = {
      pending: { label: 'Pending', color: 'bg-orange-100 text-orange-700', icon: Clock },
      reviewing: { label: 'Under Review', color: 'bg-blue-100 text-blue-700', icon: MessageSquare },
      approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CircleCheck },
      rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: X },
      converted: { label: 'Converted', color: 'bg-purple-100 text-purple-700', icon: TrendingUp },
    }
    return configs[quote.status]
  }

  const statusConfig = getStatusBadge()
  const StatusIcon = statusConfig.icon

  // Message sending is now handled in the main component

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Quote #{quote.quote_number}
          </h1>
          <p className="text-gray-600 mt-1">
            Requested: {formatDate(quote.created_at)} • Valid until: {formatDate(quote.valid_until)}
          </p>
        </div>
        <span className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold', statusConfig.color)}>
          <StatusIcon size={18} />
          {statusConfig.label}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Info */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 size={20} />
              Company Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Company Name</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  {quote.company_details?.company_name || 'N/A'}
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                    Verified
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Contact Person</p>
                <p className="font-semibold text-gray-900">{quote.company_details?.contact_name || quote.guest_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="font-semibold text-gray-900">{quote.guest_email || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package size={20} />
                Products
              </h2>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Item
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                      Qty
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      Final Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {quote.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{item.product_name}</p>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-900 font-medium">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="px-6 py-4 text-right text-green-600 font-medium">
                        {item.discount_percentage}%
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">
                        {formatCurrency(item.total_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {quote.items?.map((item) => (
                <div key={item.id} className="p-4">
                  <p className="font-semibold text-gray-900 mb-3">{item.product_name}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-medium text-gray-900">{item.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Unit Price:</span>
                      <span className="text-gray-900">{formatCurrency(item.unit_price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount:</span>
                      <span className="text-green-600 font-medium">{item.discount_percentage}%</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(item.total_price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="max-w-md ml-auto space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(quote.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-medium text-green-600">-{formatCurrency(quote.discount_total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST (18%):</span>
                  <span className="font-medium text-gray-900">{formatCurrency(quote.tax_total)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-lg font-bold text-gray-900">Total:</span>
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(quote.estimated_total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Attachments */}
          {quote.attachments && quote.attachments.length > 0 && (
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Paperclip size={20} />
                Attachments
              </h2>
              <div className="space-y-2">
                {quote.attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FileText className="text-red-500" size={20} />
                    <span className="flex-1 font-medium text-gray-900">{attachment.file_name}</span>
                    <Download className="text-gray-400" size={18} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {quote.status === 'pending' && (
              <>
                <button
                  onClick={() => handleUpdateStatus('accepted')}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  <CircleCheck size={20} />
                  Accept Quote
                </button>
                <button
                  onClick={() => handleUpdateStatus('negotiation')}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  <MessageSquare size={20} />
                  Request Revision
                </button>
                <button
                  onClick={() => handleUpdateStatus('rejected')}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  <X size={20} />
                  Reject Quote
                </button>
              </>
            )}
            {quote.status === 'approved' && (
              <Link
                href="/checkout"
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                <Package size={20} />
                Convert to Order
              </Link>
            )}
            <button
              onClick={handleDownloadPDF}
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Download size={20} />
              Download PDF
            </button>
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden sticky top-6">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare size={20} />
                Messages
              </h2>
            </div>

            {/* Messages */}
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {quote.messages && quote.messages.length > 0 ? (
                quote.messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'p-3 rounded-lg',
                      message.is_internal
                        ? 'bg-blue-50 mr-4'
                        : 'bg-orange-50 ml-4'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-900">
                        {message.sender_name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDateTime(message.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{message.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 text-sm py-8">
                  No messages yet
                </p>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isSendingMessage}
                  className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingMessage ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
