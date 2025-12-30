"use client"

import { useState } from "react"
import { OrdersTable } from "@/modules/admin/orders/orders-table"
import { OrdersFilters } from "@/modules/admin/orders/orders-filters"
import { OrdersEmptyState } from "@/modules/admin/common/empty-states"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Download, RefreshCw, Package, Clock, Truck, CircleCheck } from "lucide-react"
import { useOrders, useOrderStats } from "@/hooks/queries/useOrders"
import { toast } from "sonner"

interface OrderFilters {
  search: string
  status: string
  paymentStatus: string
  dateFrom: string
  dateTo: string
  customer: string
}


// Mock Order Data
const mockOrders: any[] = [
  {
    id: "ord_1",
    order_number: "ORD-001",
    guest_name: "Rajesh Kumar",
    guest_email: "rajesh@example.com",
    order_status: "processing",
    payment_status: "paid",
    total_amount: 45000,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    shipping_address: {
      address_line1: "123 Main St",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      country: "India"
    },
    order_items: [
      { id: "item_1", product_name: "Luxury Home Elevator", quantity: 1, total_price: 45000 }
    ]
  },
  {
    id: "ord_2",
    order_number: "ORD-002",
    guest_name: "Priya Sharma",
    guest_email: "priya@example.com",
    order_status: "pending",
    payment_status: "unpaid",
    total_amount: 15000,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    shipping_address: {
      address_line1: "45 Park Avenue",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560001",
      country: "India"
    },
    order_items: [
      { id: "item_2", product_name: "Hydraulic Pump", quantity: 1, total_price: 15000 }
    ]
  },
  {
    id: "ord_3",
    order_number: "ORD-003",
    guest_name: "Amit Patel",
    guest_email: "amit@example.com",
    order_status: "delivered",
    payment_status: "paid",
    total_amount: 125000,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    shipping_address: {
      address_line1: "789 Lake View",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "380001",
      country: "India"
    },
    order_items: [
      { id: "item_3", product_name: "Glass Elevator Cabin", quantity: 1, total_price: 125000 }
    ]
  },
  {
    id: "ord_4",
    order_number: "ORD-004",
    guest_name: "Sneha Gupta",
    guest_email: "sneha@example.com",
    order_status: "shipped",
    payment_status: "paid",
    total_amount: 8500,
    created_at: new Date(Date.now() - 259200000).toISOString(),
    shipping_address: {
      address_line1: "12 Civil Lines",
      city: "Delhi",
      state: "Delhi",
      pincode: "110001",
      country: "India"
    },
    order_items: [
      { id: "item_4", product_name: "Elevator Buttons Set", quantity: 5, total_price: 8500 }
    ]
  },
  {
    id: "ord_5",
    order_number: "ORD-005",
    guest_name: "Vikram Singh",
    guest_email: "vikram@example.com",
    order_status: "cancelled",
    payment_status: "refunded",
    total_amount: 32000,
    created_at: new Date(Date.now() - 400000000).toISOString(),
    shipping_address: {
      address_line1: "99 Pink City Rd",
      city: "Jaipur",
      state: "Rajasthan",
      pincode: "302001",
      country: "India"
    },
    order_items: [
      { id: "item_5", product_name: "Door Mechanism", quantity: 2, total_price: 32000 }
    ]
  }
]

// Mock Stats based on mockOrders
const mockStats = {
  total: 5,
  pending: 1,
  processing: 1,
  shipped: 1,
  delivered: 1
}

export default function OrdersPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<OrderFilters>({
    search: '',
    status: 'all',
    paymentStatus: 'all',
    dateFrom: '',
    dateTo: '',
    customer: ''
  })

  // Use mock data instead of hooks
  const orders = mockOrders
  const stats = mockStats
  const isLoading = false
  const isLoadingStats = false

  // Placeholder refetch
  const refetchOrders = async () => {
    toast.success('Orders refreshed (Demo)')
  }

  const handleFilterChange = (newFilters: OrderFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleRefresh = async () => {
    await refetchOrders()
  }

  const handleExport = async () => {
    try {
      toast.info('Export functionality coming soon')
    } catch (error) {
      console.error('Error exporting orders:', error)
      toast.error('Failed to export orders')
    }
  }

  const hasOrders = orders.length > 0

  return (
    <div className="space-y-8" data-testid="orders-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Orders</h1>
          <p className="text-lg text-gray-600 mt-2">
            Manage customer orders and fulfillment
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {hasOrders && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading || isLoadingStats}
              className="border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300"
              data-testid="refresh-orders-button"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${(isLoading || isLoadingStats) ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
          <Button
            variant="outline"
            className="border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300"
            onClick={handleExport}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          {/* Create Order Button Removed as per request */}
        </div>
      </div>

      {/* Order Statistics */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-5">
          <Card className="border-0 shadow-sm bg-gradient-to-b from-white to-orange-50 border-orange-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-gray-900">{stats.total || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-b from-white to-yellow-50 border-yellow-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-gray-900">{stats.pending || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-b from-white to-purple-50 border-purple-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Processing</CardTitle>
              <Package className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-gray-900">{stats.processing || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-b from-white to-orange-50 border-orange-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Shipped</CardTitle>
              <Truck className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-gray-900">{stats.shipped || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-b from-white to-green-50 border-green-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Delivered</CardTitle>
              <CircleCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-gray-900">{stats.delivered || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-6">
          <div className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      ) : hasOrders ? (
        <>
          <OrdersFilters
            filters={filters}
            onFiltersChange={handleFilterChange}
            totalOrders={orders.length}
          />
          <OrdersTable
            orders={orders}
            onRefresh={refetchOrders}
          />
        </>
      ) : (
        <OrdersEmptyState />
      )}
    </div>
  )
}
