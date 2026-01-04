import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // TODO: Add admin role verification
    // const supabase = await createServerSupabase()
    // const { data: adminProfile } = await supabase
    //   .from('admin_profiles')
    //   .select('role, is_active')
    //   .eq('user_id', userId)
    //   .single()
    // 
    // if (!adminProfile || !adminProfile.is_active) {
    //   return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    // }
    
    const supabase = await createServerSupabase()
    
    // Get total orders
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
    
    // Get total revenue (only paid orders)
    const { data: orders } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('payment_status', 'paid')
    
    const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0
    
    // Get pending orders
    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('order_status', 'pending')
    
    // Get total customers (from customer_meta table)
    const { count: totalCustomers } = await supabase
      .from('customer_meta')
      .select('*', { count: 'exact', head: true })
    
    // Get total products
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
    
    // Get active products
    const { count: activeProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
    
    // Get low stock products (stock < 10)
    const { count: lowStockProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .lt('stock_quantity', 10)
      .eq('status', 'active')
    
    // Get recent orders (last 10)
    const { data: recentOrders } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        total_amount,
        order_status,
        payment_status,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(10)
    
    // Get sales trend (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { data: salesTrend } = await supabase
      .from('orders')
      .select('created_at, total_amount')
      .eq('payment_status', 'paid')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at')
    
    // Group sales by date
    const salesByDate: Record<string, number> = {}
    salesTrend?.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString()
      salesByDate[date] = (salesByDate[date] || 0) + Number(order.total_amount)
    })
    
    // Get order status breakdown
    const { data: ordersByStatus } = await supabase
      .from('orders')
      .select('order_status')
    
    const statusBreakdown: Record<string, number> = {}
    ordersByStatus?.forEach(order => {
      statusBreakdown[order.order_status] = (statusBreakdown[order.order_status] || 0) + 1
    })
    
    // Get top selling products (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { data: topProducts } = await supabase
      .from('order_items')
      .select(`
        product_id,
        product_name,
        quantity
      `)
      .gte('created_at', thirtyDaysAgo.toISOString())
    
    // Aggregate top products
    const productSales: Record<string, { name: string; quantity: number }> = {}
    topProducts?.forEach(item => {
      const key = item.product_id || item.product_name
      if (!productSales[key]) {
        productSales[key] = { name: item.product_name, quantity: 0 }
      }
      productSales[key].quantity += item.quantity
    })
    
    const topSellingProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)
    
    // Get business verification pending count
    const { count: pendingVerifications } = await supabase
      .from('business_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('verification_status', 'pending')
    
    // Get total business accounts
    const { count: totalBusinesses } = await supabase
      .from('business_profiles')
      .select('*', { count: 'exact', head: true })
    
    // Get verified businesses count
    const { count: verifiedBusinesses } = await supabase
      .from('business_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('verification_status', 'verified')
    
    return NextResponse.json({
      success: true,
      stats: {
        totalOrders: totalOrders || 0,
        totalRevenue: totalRevenue,
        pendingOrders: pendingOrders || 0,
        totalCustomers: totalCustomers || 0,
        totalProducts: totalProducts || 0,
        activeProducts: activeProducts || 0,
        lowStockProducts: lowStockProducts || 0,
        pendingVerifications: pendingVerifications || 0,
        totalBusinesses: totalBusinesses || 0,
        verifiedBusinesses: verifiedBusinesses || 0,
      },
      recentOrders,
      salesTrend: Object.entries(salesByDate).map(([date, amount]) => ({
        date,
        amount,
      })),
      orderStatusBreakdown: statusBreakdown,
      topSellingProducts,
    })
    
  } catch (error: any) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}

