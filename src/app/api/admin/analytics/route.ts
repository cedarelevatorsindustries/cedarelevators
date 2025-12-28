import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerSupabase } from '@/lib/supabase/server'

/**
 * GET /api/admin/analytics - Get comprehensive analytics data
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Add admin role verification

    const supabase = await createServerSupabase()
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days

    const daysAgo = parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)

    // Revenue analytics
    const { data: revenueData } = await supabase
      .from('orders')
      .select('created_at, total_amount, payment_status')
      .gte('created_at', startDate.toISOString())
      .eq('payment_status', 'paid')
      .order('created_at')

    // Group revenue by date
    const revenueByDate: Record<string, number> = {}
    revenueData?.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString()
      revenueByDate[date] = (revenueByDate[date] || 0) + Number(order.total_amount)
    })

    const totalRevenue = Object.values(revenueByDate).reduce((sum, val) => sum + val, 0)
    const avgOrderValue = revenueData && revenueData.length > 0
      ? totalRevenue / revenueData.length
      : 0

    // Order analytics
    const { data: orderData } = await supabase
      .from('orders')
      .select('created_at, order_status, payment_status')
      .gte('created_at', startDate.toISOString())

    const ordersByStatus: Record<string, number> = {}
    const ordersByDate: Record<string, number> = {}

    orderData?.forEach(order => {
      // Count by status
      ordersByStatus[order.order_status] = (ordersByStatus[order.order_status] || 0) + 1
      
      // Count by date
      const date = new Date(order.created_at).toLocaleDateString()
      ordersByDate[date] = (ordersByDate[date] || 0) + 1
    })

    // Product performance
    const { data: productPerformance } = await supabase
      .from('order_items')
      .select(`
        product_id,
        product_name,
        quantity,
        unit_price,
        total_price
      `)
      .gte('created_at', startDate.toISOString())

    // Aggregate product data
    const productStats: Record<string, {
      name: string
      quantity: number
      revenue: number
    }> = {}

    productPerformance?.forEach(item => {
      const key = item.product_id || item.product_name
      if (!productStats[key]) {
        productStats[key] = {
          name: item.product_name,
          quantity: 0,
          revenue: 0,
        }
      }
      productStats[key].quantity += item.quantity
      productStats[key].revenue += Number(item.total_price)
    })

    const topProductsByRevenue = Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    const topProductsByQuantity = Object.values(productStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)

    // Customer analytics
    const { count: newCustomers } = await supabase
      .from('customer_meta')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())

    // Customer segments
    const { data: customerOrderCounts } = await supabase
      .from('orders')
      .select('clerk_user_id')
      .eq('payment_status', 'paid')

    const orderCountByCustomer: Record<string, number> = {}
    customerOrderCounts?.forEach(order => {
      const key = order.clerk_user_id || 'guest'
      orderCountByCustomer[key] = (orderCountByCustomer[key] || 0) + 1
    })

    const customerSegments = {
      new: Object.values(orderCountByCustomer).filter(count => count === 1).length,
      returning: Object.values(orderCountByCustomer).filter(count => count >= 2 && count <= 5).length,
      loyal: Object.values(orderCountByCustomer).filter(count => count > 5).length,
    }

    // Category performance
    const { data: products } = await supabase
      .from('products')
      .select('id, category')

    const productCategories: Record<string, string> = {}
    products?.forEach(p => {
      if (p.category) {
        productCategories[p.id] = p.category
      }
    })

    const categoryStats: Record<string, { revenue: number; quantity: number }> = {}
    productPerformance?.forEach(item => {
      const category = productCategories[item.product_id] || 'Uncategorized'
      if (!categoryStats[category]) {
        categoryStats[category] = { revenue: 0, quantity: 0 }
      }
      categoryStats[category].revenue += Number(item.total_price)
      categoryStats[category].quantity += item.quantity
    })

    const categoryPerformance = Object.entries(categoryStats)
      .map(([category, stats]) => ({
        category,
        revenue: stats.revenue,
        quantity: stats.quantity,
      }))
      .sort((a, b) => b.revenue - a.revenue)

    // Conversion metrics
    const { count: totalCarts } = await supabase
      .from('carts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())

    const { count: completedCarts } = await supabase
      .from('carts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())
      .not('completed_at', 'is', null)

    const conversionRate = totalCarts && totalCarts > 0
      ? (completedCarts || 0) / totalCarts * 100
      : 0

    return NextResponse.json({
      success: true,
      period: daysAgo,
      analytics: {
        revenue: {
          total: totalRevenue,
          byDate: Object.entries(revenueByDate).map(([date, amount]) => ({
            date,
            amount,
          })),
          avgOrderValue,
        },
        orders: {
          total: orderData?.length || 0,
          byDate: Object.entries(ordersByDate).map(([date, count]) => ({
            date,
            count,
          })),
          byStatus: ordersByStatus,
        },
        products: {
          topByRevenue: topProductsByRevenue,
          topByQuantity: topProductsByQuantity,
        },
        categories: categoryPerformance,
        customers: {
          new: newCustomers || 0,
          segments: customerSegments,
        },
        conversion: {
          rate: conversionRate.toFixed(2),
          totalCarts: totalCarts || 0,
          completedCarts: completedCarts || 0,
        },
      },
    })
  } catch (error: any) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
