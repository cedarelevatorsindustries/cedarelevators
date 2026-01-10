"use client"

import { useState, useMemo } from 'react'
import { Product, ProductCategory, Order } from "@/lib/types/domain"
import {
  Package,
  Search,
  Download,
  Eye,
  FileText,
  RotateCcw,
  Truck,
  X,
  ShoppingCart,
  FileSpreadsheet
} from 'lucide-react'
import { convertToLocale } from "@/lib/utils/currency/money"
import { logger } from "@/lib/services/logger"
import {
  getOrderStatus,
  getPaymentStatus,
  getStatusBadgeColor,
  getPaymentBadgeColor,
  formatStatusLabel,
  formatPaymentLabel,
  formatOrderDate,
  calculateOrderSummary,
  filterOrdersByStatus,
  filterOrdersByDateRange,
  searchOrders,
  getOrderItemCount,
  canCancelOrder,
  canReorderOrder,
  canTrackOrder,
  type OrderStatus,
} from '@/lib/utils/orders/helpers'

interface OrderHistorySectionProps {
  orders: Order[]
  accountType: 'guest' | 'individual' | 'business'
}

export default function OrderHistorySection({ orders, accountType }: OrderHistorySectionProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all')
  const [dateFilter, setDateFilter] = useState<number | null>(null)
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())

  const isBusinessUser = accountType === 'business'

  // Calculate summary
  const summary = useMemo(() => calculateOrderSummary(orders), [orders])

  // Apply filters
  const filteredOrders = useMemo(() => {
    let result = orders

    // Status filter
    result = filterOrdersByStatus(result, statusFilter)

    // Date filter
    if (dateFilter) {
      result = filterOrdersByDateRange(result, dateFilter)
    }

    // Search filter
    result = searchOrders(result, searchQuery)

    return result
  }, [orders, statusFilter, dateFilter, searchQuery])

  // Toggle order selection
  const toggleOrderSelection = (orderId: string) => {
    const newSelection = new Set(selectedOrders)
    if (newSelection.has(orderId)) {
      newSelection.delete(orderId)
    } else {
      newSelection.add(orderId)
    }
    setSelectedOrders(newSelection)
  }

  // Select all orders
  const selectAllOrders = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set())
    } else {
      setSelectedOrders(new Set(filteredOrders.map(o => o.id)))
    }
  }

  // Handle bulk reorder
  const handleBulkReorder = () => {
    logger.info('Bulk reorder attempt', { orderIds: Array.from(selectedOrders) })
    // TODO: Implement bulk reorder logic
  }

  // Handle export
  const handleExport = () => {
    logger.info('Export orders initiated')
    // TODO: Implement export logic
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
        <p className="text-gray-600 mt-1">
          View and manage all your orders
        </p>
      </div>

      {/* Status Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-hide" aria-label="Tabs">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'processing', label: 'Processing' },
            { id: 'shipped', label: 'Shipped' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${statusFilter === tab.id
                  ? 'border-[#F97316] text-[#F97316]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Bar */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by Order ID, Product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-[#F97316] focus:border-transparent text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Date Filter */}
        <div className="w-full md:w-auto">
          <select
            value={dateFilter || ''}
            onChange={(e) => setDateFilter(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full md:w-auto px-4 py-2.5 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 focus:ring-2 focus:ring-[#F97316] outline-none"
          >
            <option value="">All Time</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="180">Last 6 months</option>
            <option value="365">Last year</option>
          </select>
        </div>



        {/* B2B Actions */}
        {isBusinessUser && selectedOrders.size > 0 && (
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={selectedOrders.size === filteredOrders.length}
                onChange={selectAllOrders}
                className="w-4 h-4 text-[#F97316] rounded focus:ring-[#F97316]"
              />
              <span className="text-sm font-medium text-gray-900">
                {selectedOrders.size} order{selectedOrders.size > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleBulkReorder}
                className="px-4 py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#ea580c] transition-colors text-sm font-medium flex items-center gap-2"
              >
                <RotateCcw size={16} />
                Reorder Selected
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <FileSpreadsheet size={16} />
                Export
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Orders Table/List */}
      {filteredOrders.length === 0 ? (
        <EmptyState searchQuery={searchQuery} statusFilter={statusFilter} />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {isBusinessUser && (
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                        onChange={selectAllOrders}
                        className="w-4 h-4 text-[#F97316] rounded focus:ring-[#F97316]"
                      />
                    </th>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <OrderTableRow
                    key={order.id}
                    order={order}
                    isBusinessUser={isBusinessUser}
                    isSelected={selectedOrders.has(order.id)}
                    onToggleSelect={() => toggleOrderSelection(order.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredOrders.map((order) => (
              <OrderMobileCard
                key={order.id}
                order={order}
                isBusinessUser={isBusinessUser}
                isSelected={selectedOrders.has(order.id)}
                onToggleSelect={() => toggleOrderSelection(order.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Order Table Row Component
function OrderTableRow({
  order,
  isBusinessUser,
  isSelected,
  onToggleSelect,
}: {
  order: Order
  isBusinessUser: boolean
  isSelected: boolean
  onToggleSelect: () => void
}) {
  const status = getOrderStatus(order)
  const paymentStatus = getPaymentStatus(order)
  const itemCount = getOrderItemCount(order)

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {isBusinessUser && (
        <td className="px-4 py-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="w-4 h-4 text-[#F97316] rounded focus:ring-[#F97316]"
          />
        </td>
      )}
      <td className="px-4 py-4">
        <div className="font-medium text-gray-900">#{order.display_id}</div>
      </td>
      <td className="px-4 py-4 text-gray-600">
        {formatOrderDate(order.created_at)}
      </td>
      <td className="px-4 py-4 text-gray-600">
        {itemCount} {itemCount === 1 ? 'item' : 'items'}
      </td>
      <td className="px-4 py-4 font-medium text-gray-900">
        {convertToLocale(order.total || 0, order.currency_code || 'INR')}
      </td>
      <td className="px-4 py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(status)}`}>
          {formatStatusLabel(status)}
        </span>
      </td>
      <td className="px-4 py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentBadgeColor(paymentStatus)}`}>
          {formatPaymentLabel(paymentStatus)}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center justify-end gap-2">
          <a
            href={`/profile/orders/${order.id}`}
            className="p-2 text-gray-600 hover:text-[#F97316] transition-colors"
            title="View Details"
          >
            <Eye size={18} />
          </a>
          {canTrackOrder(order) && (
            <button
              className="p-2 text-gray-600 hover:text-[#F97316] transition-colors"
              title="Track Order"
            >
              <Truck size={18} />
            </button>
          )}
          {canReorderOrder(order) && (
            <button
              className="p-2 text-gray-600 hover:text-[#F97316] transition-colors"
              title="Reorder"
            >
              <RotateCcw size={18} />
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

// Order Mobile Card Component
function OrderMobileCard({
  order,
  isBusinessUser,
  isSelected,
  onToggleSelect,
}: {
  order: Order
  isBusinessUser: boolean
  isSelected: boolean
  onToggleSelect: () => void
}) {
  const status = getOrderStatus(order)
  const paymentStatus = getPaymentStatus(order)
  const itemCount = getOrderItemCount(order)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {isBusinessUser && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="w-4 h-4 text-[#F97316] rounded focus:ring-[#F97316] mt-1"
            />
          )}
          <div>
            <div className="font-semibold text-gray-900">#{order.display_id}</div>
            <div className="text-sm text-gray-600">{formatOrderDate(order.created_at)}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(status)}`}>
            {formatStatusLabel(status)}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Items:</span>
          <span className="font-medium text-gray-900">{itemCount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total:</span>
          <span className="font-semibold text-gray-900">
            {convertToLocale(order.total || 0, order.currency_code || 'INR')}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Payment:</span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPaymentBadgeColor(paymentStatus)}`}>
            {formatPaymentLabel(paymentStatus)}
          </span>
        </div>
      </div>

      <div className="flex gap-2 pt-3 border-t border-gray-200">
        <a
          href={`/profile/orders/${order.id}`}
          className="flex-1 px-4 py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#ea580c] transition-colors text-sm font-medium text-center"
        >
          View Details
        </a>
        {canReorderOrder(order) && (
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
            Reorder
          </button>
        )}
      </div>
    </div>
  )
}

// Empty State Component
function EmptyState({ searchQuery, statusFilter }: { searchQuery: string; statusFilter: string }) {
  return (
    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
      <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {searchQuery || statusFilter !== 'all' ? 'No orders found' : 'No orders yet'}
      </h3>
      <p className="text-gray-600 mb-6">
        {searchQuery || statusFilter !== 'all'
          ? 'Try adjusting your filters or search query'
          : 'Start shopping to see your orders here'}
      </p>
      {!searchQuery && statusFilter === 'all' && (
        <a
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#F97316] text-white rounded-lg hover:bg-[#ea580c] transition-colors font-medium"
        >
          <ShoppingCart size={20} />
          Start Shopping
        </a>
      )}
    </div>
  )
}

