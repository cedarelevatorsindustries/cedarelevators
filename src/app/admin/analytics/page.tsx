/**
 * Analytics Dashboard Page
 * Advanced analytics and insights for admin
 */

'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, Users, Package, ShoppingCart, Calendar } from 'lucide-react'
import { toast } from 'sonner'

type DateRange = '7d' | '30d' | '90d' | 'custom'

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>('30d')
  const [salesMetrics, setSalesMetrics] = useState<any>(null)
  const [productMetrics, setProductMetrics] = useState<any>(null)
  const [customerMetrics, setCustomerMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    setLoading(true)

    try {
      const endDate = new Date()
      const startDate = new Date()
      
      if (dateRange === '7d') {
        startDate.setDate(endDate.getDate() - 7)
      } else if (dateRange === '30d') {
        startDate.setDate(endDate.getDate() - 30)
      } else if (dateRange === '90d') {
        startDate.setDate(endDate.getDate() - 90)
      }

      const [salesRes, productsRes, customersRes] = await Promise.all([
        fetch(`/api/admin/analytics/sales?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&period=daily`),
        fetch('/api/admin/analytics/products'),
        fetch(`/api/admin/analytics/customers?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`),
      ])

      const [salesData, productsData, customersData] = await Promise.all([
        salesRes.json(),
        productsRes.json(),
        customersRes.json(),
      ])

      if (salesData.success) setSalesMetrics(salesData.data.metrics)
      if (productsData.success) setProductMetrics(productsData.data)
      if (customersData.success) setCustomerMetrics(customersData.data)
    } catch (error: any) {
      toast.error('Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Track your business performance and insights
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex gap-2">
          <Button
            variant={dateRange === '7d' ? 'default' : 'outline'}
            onClick={() => setDateRange('7d')}
            size="sm"
          >
            7 Days
          </Button>
          <Button
            variant={dateRange === '30d' ? 'default' : 'outline'}
            onClick={() => setDateRange('30d')}
            size="sm"
          >
            30 Days
          </Button>
          <Button
            variant={dateRange === '90d' ? 'default' : 'outline'}
            onClick={() => setDateRange('90d')}
            size="sm"
          >
            90 Days
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Sales Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    ₹{salesMetrics?.totalRevenue?.toLocaleString() || 0}
                  </p>
                  <p className="text-sm text-green-600">
                    {salesMetrics?.revenueChange >= 0 ? '+' : ''}
                    {salesMetrics?.revenueChange?.toFixed(1) || 0}% from last period
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">
                    {salesMetrics?.totalOrders?.toLocaleString() || 0}
                  </p>
                  <p className="text-sm text-blue-600">
                    {salesMetrics?.ordersChange >= 0 ? '+' : ''}
                    {salesMetrics?.ordersChange?.toFixed(1) || 0}% from last period
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                  <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Order Value</p>
                  <p className="text-2xl font-bold">
                    ₹{salesMetrics?.averageOrderValue?.toFixed(2) || 0}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Product Metrics */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Insights
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{productMetrics?.totalProducts || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Products</p>
                <p className="text-2xl font-bold">{productMetrics?.activeProducts || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold text-orange-600">
                  {productMetrics?.lowStockProducts || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">
                  {productMetrics?.outOfStockProducts || 0}
                </p>
              </div>
            </div>
          </Card>

          {/* Customer Metrics */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customer Insights
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{customerMetrics?.totalCustomers || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">New Customers</p>
                <p className="text-2xl font-bold text-green-600">
                  {customerMetrics?.newCustomers || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Repeat Customers</p>
                <p className="text-2xl font-bold">{customerMetrics?.repeatCustomers || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Retention Rate</p>
                <p className="text-2xl font-bold">
                  {customerMetrics?.customerRetentionRate?.toFixed(1) || 0}%
                </p>
              </div>
            </div>
          </Card>

          {/* Top Selling Products */}
          {productMetrics?.topSellingProducts && productMetrics.topSellingProducts.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Top Selling Products</h2>
              <div className="space-y-3">
                {productMetrics.topSellingProducts.map((product: any, index: number) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.sales} units sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{product.revenue.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
