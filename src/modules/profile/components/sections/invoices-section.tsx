'use client'

import { useState } from 'react'
import { FileText, Download, Eye, Search, Filter, CircleCheck, Clock, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Invoice {
  id: string
  invoiceNumber: string
  orderNumber: string
  date: string
  dueDate: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  gstAmount: number
  downloadUrl: string
}

interface InvoicesSectionProps {
  accountType: 'guest' | 'individual' | 'business'
  verificationStatus?: 'pending' | 'approved' | 'rejected' | 'incomplete'
}

export default function InvoicesSection({
  accountType,
  verificationStatus
}: InvoicesSectionProps) {
  const [invoices] = useState<Invoice[]>([
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      orderNumber: 'ORD-2024-123',
      date: '2024-01-15',
      dueDate: '2024-02-14',
      amount: 125000,
      gstAmount: 22500,
      status: 'paid',
      downloadUrl: '#'
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-002',
      orderNumber: 'ORD-2024-124',
      date: '2024-01-20',
      dueDate: '2024-02-19',
      amount: 85000,
      gstAmount: 15300,
      status: 'pending',
      downloadUrl: '#'
    },
    {
      id: '3',
      invoiceNumber: 'INV-2023-089',
      orderNumber: 'ORD-2023-456',
      date: '2023-12-10',
      dueDate: '2024-01-09',
      amount: 45000,
      gstAmount: 8100,
      status: 'overdue',
      downloadUrl: '#'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all')

  const isVerified = accountType === 'business' && verificationStatus === 'approved'

  if (!isVerified) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-xl p-8 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-yellow-500 rounded-lg">
                <FileText className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Business Verification Required
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Complete business verification to access invoice management and GST invoices.
                </p>
                <a
                  href="/profile/verification"
                  className="inline-block px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Complete Verification
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

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

  const getStatusBadge = (status: Invoice['status']) => {
    const configs = {
      paid: { label: 'Paid', color: 'bg-green-100 text-green-700', icon: CircleCheck },
      pending: { label: 'Pending', color: 'bg-orange-100 text-orange-700', icon: Clock },
      overdue: { label: 'Overdue', color: 'bg-red-100 text-red-700', icon: XCircle },
    }
    return configs[status]
  }

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0)
  const paidAmount = filteredInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0)
  const pendingAmount = filteredInvoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0)
  const overdueAmount = filteredInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Invoice Management</h2>
        <p className="text-sm text-gray-600 mt-1">
          View and download all your invoices with GST details
        </p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Total</span>
              <FileText className="text-gray-400" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
            <p className="text-xs text-gray-500 mt-1">{filteredInvoices.length} invoices</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700">Paid</span>
              <CircleCheck className="text-green-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-green-900">{formatCurrency(paidAmount)}</p>
          </div>

          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-orange-700">Pending</span>
              <Clock className="text-orange-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-orange-900">{formatCurrency(pendingAmount)}</p>
          </div>

          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-red-700">Overdue</span>
              <XCircle className="text-red-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-red-900">{formatCurrency(overdueAmount)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by Invoice ID or Order Number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        {/* Invoices Table - Desktop */}
        <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Invoice ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">GST</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => {
                  const statusConfig = getStatusBadge(invoice.status)
                  const StatusIcon = statusConfig.icon

                  return (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-orange-600">
                          {invoice.invoiceNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {invoice.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(invoice.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(invoice.dueDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatCurrency(invoice.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatCurrency(invoice.gstAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', statusConfig.color)}>
                          <StatusIcon size={14} />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoices Cards - Mobile */}
        <div className="md:hidden space-y-4">
          {filteredInvoices.map((invoice) => {
            const statusConfig = getStatusBadge(invoice.status)
            const StatusIcon = statusConfig.icon

            return (
              <div key={invoice.id} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-sm font-semibold text-orange-600">
                      {invoice.invoiceNumber}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{invoice.orderNumber}</p>
                  </div>
                  <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', statusConfig.color)}>
                    <StatusIcon size={14} />
                    {statusConfig.label}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Date:</span>
                    <span className="text-gray-900 font-medium">{formatDate(invoice.date)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="text-gray-900 font-medium">{formatDate(invoice.dueDate)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amount:</span>
                    <span className="text-gray-900 font-semibold">{formatCurrency(invoice.amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">GST:</span>
                    <span className="text-gray-900">{formatCurrency(invoice.gstAmount)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                    <Eye size={16} />
                    View
                  </button>
                  <button className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                    <Download size={16} />
                    Download
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No invoices found
            </h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Your invoices will appear here once you place orders'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
