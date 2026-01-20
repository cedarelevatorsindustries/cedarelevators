'use client'

import { useState } from 'react'
import { Package, TrendingUp, Truck, Banknote, ChevronRight, ArrowRight, Building2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import OrderStatusBadge from '../components/order-status-badge'

interface Order {
  id: string
  order_number: string
  created_at: string
  order_status: string
  total_amount: number
  order_items?: any[]
}

interface OrderSummary {
  totalOrders: number
  delivered: number
  inTransit: number
  totalSpent: number
}

interface OrderHistoryTemplateProps {
  orders: Order[]
  summary: OrderSummary
  accountType: 'individual' | 'business'
  isVerified: boolean
}

type OrderStatus = 'all' | 'processing' | 'delivered' | 'cancelled'

export default function OrderHistoryTemplate({
  orders,
  summary,
  accountType,
  isVerified,
}: OrderHistoryTemplateProps) {
  const [activeTab, setActiveTab] = useState<OrderStatus>('all')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  // Filter orders by status
  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter(order => order.order_status?.toLowerCase() === activeTab)

  const tabs: { id: OrderStatus; label: string; count: number }[] = [
    { id: 'all', label: 'All Orders', count: orders.length },
    { id: 'processing', label: 'Processing', count: orders.filter(o => o.order_status === 'processing').length },
    { id: 'delivered', label: 'Delivered', count: orders.filter(o => o.order_status === 'delivered').length },
    { id: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.order_status === 'cancelled').length },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-sm text-gray-600 mt-1">
          View and track your orders
        </p>
      </div>

      {/* Upgrade to Business Banner (Individual Users Only) */}
      {accountType === 'individual' && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Building2 className="text-purple-600" size={24} />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-purple-900 mb-1">Unlock Business Benefits</h3>
              <p className="text-purple-700 text-sm mb-4">
                Upgrade to a Business account to access wholesale pricing, bulk ordering, custom quotes, and priority support.
              </p>
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                Upgrade to Business <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-600">Total Orders</span>
            <Package className="text-gray-400" size={16} />
          </div>
          <p className="text-xl sm:text-3xl font-bold text-gray-900">{summary.totalOrders}</p>
        </div>

        <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-600">Delivered</span>
            <TrendingUp className="text-green-500" size={16} />
          </div>
          <p className="text-xl sm:text-3xl font-bold text-gray-900">{summary.delivered}</p>
        </div>

        <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-600">In Transit</span>
            <Truck className="text-blue-500" size={16} />
          </div>
          <p className="text-xl sm:text-3xl font-bold text-gray-900">{summary.inTransit}</p>
        </div>

        <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-600">Total Spent</span>
            <Banknote className="text-orange-500" size={16} />
          </div>
          <p className="text-xl sm:text-3xl font-bold text-gray-900">
            {formatCurrency(summary.totalSpent).replace('₹', '₹ ')}
          </p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex w-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-1 sm:px-6 py-3 text-[10px] sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs ${activeTab === tab.id
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-gray-100 text-gray-600'
                    }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List/Table */}
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Image
              src="/empty-states/no-result-found.png"
              alt="No orders found"
              width={200}
              height={200}
              className="mx-auto mb-6 opacity-75"
            />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No orders yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start shopping to see your orders here
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/catalog"
                className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
              >
                Browse Products
              </Link>
              {accountType === 'individual' && (
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                >
                  <Building2 size={18} />
                  Upgrade to Business
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Order Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Placed Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {order.order_number}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {formatDate(order.created_at)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <OrderStatusBadge status={order.order_status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-bold text-gray-900">
                          {formatCurrency(order.total_amount || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link
                          href={`/profile/orders/${order.id}`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          Track
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/profile/orders/${order.id}`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm mb-1">
                        {order.order_number}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <OrderStatusBadge status={order.order_status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(order.total_amount || 0)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600">
                      Track
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination info */}
      {filteredOrders.length > 0 && (
        <p className="text-sm text-gray-500 text-center">
          Showing 1 to {filteredOrders.length} of {filteredOrders.length} orders
        </p>
      )}
    </div>
  )
}
