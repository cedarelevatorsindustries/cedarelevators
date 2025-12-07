'use client'

import { useState, useEffect } from 'react'
import { Quote, QuoteMessage } from '@/types/b2b/quote'
import { 
  ArrowLeft, Download, CheckCircle, X, RefreshCw, 
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

        if (result.success && result.quote) {
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
        if (refreshResult.success && refreshResult.quote) {
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
        if (refreshResult.success && refreshResult.quote) {
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
          <p className="text-gray-600 dark:text-gray-400">Loading quote...</p>
        </div>
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Quote not found</p>
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
  company_id: 'comp1',
  customer_id: 'cust1',
  company_name: 'CEDAR ELEVATORS INDUSTRIES',
  customer_name: 'Rajesh Kumar',
  customer_email: 'rajesh@cedar.com',
  status: 'accepted',
  requested_date: '2025-11-18T10:00:00Z',
  valid_until: '2025-12-18T10:00:00Z',
  items: [
    {
      id: '1',
      product_id: 'prod1',
      variant_id: 'var1',
      product_name: 'Elevator Controller',
      quantity: 5,
      unit_price: 85000,
      total_price: 425000,
      discount_percentage: 12,
      total: 374000,
    },
    {
      id: '2',
      product_id: 'prod2',
      variant_id: 'var2',
      product_name: 'Traction Machine',
      quantity: 3,
      unit_price: 240000,
      total_price: 720000,
      discount_percentage: 8,
      total: 662400,
    },
  ],
  subtotal: 1036400,
  tax_total: 186552,
  discount_total: 148800,
  total: 1240000,
  attachments: [
    {
      id: '1',
      name: 'Technical Drawing.pdf',
      url: '/attachments/tech-drawing.pdf',
      size: 1024000,
      type: 'pdf',
    },
    {
      id: '2',
      name: 'Payment Terms.pdf',
      url: '/attachments/payment-terms.pdf',
      size: 512000,
      type: 'pdf',
    },
  ],
  messages: [
    {
      id: '1',
      quote_id: '1',
      user_id: 'user1',
      user_name: 'Rajesh Kumar',
      user_avatar: undefined,
      message: 'Can you give 2% extra discount?',
      created_at: '2025-11-18T11:00:00Z',
      is_internal: false,
    },
    {
      id: '2',
      quote_id: '1',
      user_id: 'sales1',
      user_name: 'Sales Team',
      user_avatar: undefined,
      message: 'Done! Revised quote attached.',
      created_at: '2025-11-18T12:00:00Z',
      is_internal: false,
    },
  ],
  created_at: '2025-11-18T10:00:00Z',
  updated_at: '2025-11-18T10:00:00Z',
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
    const configs = {
      pending: { label: 'Pending', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400', icon: Clock },
      negotiation: { label: 'Negotiation', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400', icon: MessageSquare },
      revised: { label: 'Revised', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400', icon: RefreshCw },
      accepted: { label: 'Accepted', color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400', icon: CheckCircle },
      rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400', icon: X },
      expired: { label: 'Expired', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400', icon: AlertCircle },
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
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quote #{quote.quote_number}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Requested: {formatDate(quote.requested_date)} • Valid until: {formatDate(quote.valid_until)}
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
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Building2 size={20} />
              Company Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Company Name</p>
                <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  {quote.company_name}
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-xs rounded-full">
                    Verified
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Contact Person</p>
                <p className="font-semibold text-gray-900 dark:text-white">{quote.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
                <p className="font-semibold text-gray-900 dark:text-white">{quote.customer_email}</p>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Package size={20} />
                Products
              </h2>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                      Item
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                      Qty
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                      Final Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {quote.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900 dark:text-white">{item.product_name}</p>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-900 dark:text-white font-medium">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-400">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="px-6 py-4 text-right text-green-600 dark:text-green-400 font-medium">
                        {item.discount_percentage}%
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {quote.items.map((item) => (
                <div key={item.id} className="p-4">
                  <p className="font-semibold text-gray-900 dark:text-white mb-3">{item.product_name}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{item.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Unit Price:</span>
                      <span className="text-gray-900 dark:text-white">{formatCurrency(item.unit_price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Discount:</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">{item.discount_percentage}%</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="font-semibold text-gray-900 dark:text-white">Total:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(item.total)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <div className="max-w-md ml-auto space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(quote.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Discount:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">-{formatCurrency(quote.discount_total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">GST (18%):</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(quote.tax_total)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">Total:</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(quote.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Attachments */}
          {quote.attachments && quote.attachments.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Paperclip size={20} />
                Attachments
              </h2>
              <div className="space-y-2">
                {quote.attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FileText className="text-red-500" size={20} />
                    <span className="flex-1 font-medium text-gray-900 dark:text-white">{attachment.name}</span>
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
                  <CheckCircle size={20} />
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
            {quote.status === 'accepted' && (
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
              className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Download size={20} />
              Download PDF
            </button>
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden sticky top-6">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
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
                        ? 'bg-blue-50 dark:bg-blue-900/20 mr-4'
                        : 'bg-orange-50 dark:bg-orange-900/20 ml-4'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">
                        {message.user_name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDateTime(message.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{message.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-8">
                  No messages yet
                </p>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
