/**
 * Analytics Calculations & Metrics
 * Business logic for analytics dashboard
 */

import { createServerSupabase } from '@/lib/supabase/server'

export interface SalesMetrics {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  revenueChange: number
  ordersChange: number
}

export interface ProductMetrics {
  totalProducts: number
  activeProducts: number
  lowStockProducts: number
  outOfStockProducts: number
  topSellingProducts: Array<{
    id: string
    name: string
    sales: number
    revenue: number
  }>
}

export interface CustomerMetrics {
  totalCustomers: number
  newCustomers: number
  repeatCustomers: number
  customerRetentionRate: number
  businessVsIndividual: {
    business: number
    individual: number
  }
}

/**
 * Calculate sales metrics
 */
export async function calculateSalesMetrics(
  startDate: Date,
  endDate: Date
): Promise<SalesMetrics> {
  const supabase = await createServerSupabase()

  // Current period
  const { data: orders } = await supabase
    .from('orders')
    .select('total_amount, created_at')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .eq('payment_status', 'paid')

  const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0
  const totalOrders = orders?.length || 0
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Previous period for comparison
  const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const previousStartDate = new Date(startDate)
  previousStartDate.setDate(previousStartDate.getDate() - periodDays)

  const { data: previousOrders } = await supabase
    .from('orders')
    .select('total_amount')
    .gte('created_at', previousStartDate.toISOString())
    .lt('created_at', startDate.toISOString())
    .eq('payment_status', 'paid')

  const previousRevenue = previousOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0
  const previousOrdersCount = previousOrders?.length || 0

  const revenueChange = previousRevenue > 0
    ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
    : 0
  const ordersChange = previousOrdersCount > 0
    ? ((totalOrders - previousOrdersCount) / previousOrdersCount) * 100
    : 0

  return {
    totalRevenue,
    totalOrders,
    averageOrderValue,
    revenueChange,
    ordersChange,
  }
}

/**
 * Calculate product metrics
 */
export async function calculateProductMetrics(): Promise<ProductMetrics> {
  const supabase = await createServerSupabase()

  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  const { count: activeProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { count: lowStockProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .gt('stock_quantity', 0)
    .lte('stock_quantity', 10)

  const { count: outOfStockProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('stock_quantity', 0)

  // Top selling products (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: topProducts } = await supabase
    .from('order_items')
    .select(`
      product_id,
      quantity,
      price,
      products:product_id (
        id,
        name
      )
    `)
    .gte('created_at', thirtyDaysAgo.toISOString())

  // Aggregate top selling products
  const productSales = topProducts?.reduce((acc: any, item: any) => {
    const productId = item.product_id
    if (!acc[productId]) {
      acc[productId] = {
        id: productId,
        name: item.products?.name || 'Unknown',
        sales: 0,
        revenue: 0,
      }
    }
    acc[productId].sales += item.quantity
    acc[productId].revenue += item.price * item.quantity
    return acc
  }, {})

  const topSellingProducts = Object.values(productSales || {})
    .sort((a: any, b: any) => b.sales - a.sales)
    .slice(0, 10)

  return {
    totalProducts: totalProducts || 0,
    activeProducts: activeProducts || 0,
    lowStockProducts: lowStockProducts || 0,
    outOfStockProducts: outOfStockProducts || 0,
    topSellingProducts: topSellingProducts as any,
  }
}

/**
 * Calculate customer metrics
 */
export async function calculateCustomerMetrics(
  startDate: Date,
  endDate: Date
): Promise<CustomerMetrics> {
  const supabase = await createServerSupabase()

  const { count: totalCustomers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .in('role', ['customer', 'business'])

  const { count: newCustomers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .in('role', ['customer', 'business'])
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  // Repeat customers (customers with more than 1 order)
  const { data: customerOrders } = await supabase
    .from('orders')
    .select('user_id')
    .not('user_id', 'is', null)

  const ordersByCustomer = customerOrders?.reduce((acc: any, order) => {
    acc[order.user_id] = (acc[order.user_id] || 0) + 1
    return acc
  }, {})

  const repeatCustomers = Object.values(ordersByCustomer || {}).filter(
    (count: any) => count > 1
  ).length

  const customerRetentionRate = totalCustomers && totalCustomers > 0
    ? (repeatCustomers / totalCustomers) * 100
    : 0

  // Business vs Individual
  const { count: businessCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'business')

  const { count: individualCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'customer')

  return {
    totalCustomers: totalCustomers || 0,
    newCustomers: newCustomers || 0,
    repeatCustomers,
    customerRetentionRate,
    businessVsIndividual: {
      business: businessCount || 0,
      individual: individualCount || 0,
    },
  }
}

/**
 * Get revenue trends (daily/weekly/monthly)
 */
export async function getRevenueTrends(
  period: 'daily' | 'weekly' | 'monthly',
  startDate: Date,
  endDate: Date
): Promise<Array<{ date: string; revenue: number; orders: number }>> {
  const supabase = await createServerSupabase()

  const { data: orders } = await supabase
    .from('orders')
    .select('total_amount, created_at')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .eq('payment_status', 'paid')
    .order('created_at', { ascending: true })

  if (!orders || orders.length === 0) return []

  // Group by period
  const trends = orders.reduce((acc: any, order) => {
    const date = new Date(order.created_at)
    let key: string

    if (period === 'daily') {
      key = date.toISOString().split('T')[0]
    } else if (period === 'weekly') {
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      key = weekStart.toISOString().split('T')[0]
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    }

    if (!acc[key]) {
      acc[key] = { date: key, revenue: 0, orders: 0 }
    }
    acc[key].revenue += order.total_amount
    acc[key].orders += 1
    return acc
  }, {})

  return Object.values(trends)
}

