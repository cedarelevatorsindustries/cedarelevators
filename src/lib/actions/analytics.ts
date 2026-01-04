'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * Analytics Actions for Dashboard
 */

export interface DashboardStats {
    revenue: {
        current: number
        change: number
        changePercent: number
    }
    orders: {
        current: number
        change: number
        changePercent: number
    }
    aov: {
        current: number
        change: number
        changePercent: number
    }
    customers: {
        current: number
        change: number
        changePercent: number
    }
}

export interface RecentOrder {
    id: string
    order_number: string
    orderNumber?: string  // Alias
    customer_name: string
    customerName?: string  // Alias
    customer_email: string
    customerEmail?: string  // Alias
    total: number
    total_amount?: number  // Alias
    items_count?: number
    status: string
    created_at: string
    createdAt?: string  // Alias
}

export interface RecentActivity {
    id: string
    type: 'order' | 'customer' | 'product' | 'quote'
    title: string
    description: string
    timestamp: string
}

export interface LowStockItem {
    id: string
    name: string
    product_title?: string  // Alias
    sku: string
    currentStock: number
    current_stock?: number  // Alias
    threshold: number
    variantId?: string
    variant_id?: string  // Alias
    variant_name?: string
    status?: 'in_stock' | 'low_stock' | 'out_of_stock'
}

export async function getDashboardStats(): Promise<DashboardStats> {
    try {
        const supabase = createServerSupabaseClient()
        if (!supabase) {
            return getEmptyStats()
        }

        // Get date ranges
        const now = new Date()
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

        // Fetch current month orders
        const { data: currentOrders } = await supabase
            .from('orders')
            .select('total_amount, created_at')
            .gte('created_at', currentMonthStart.toISOString())
            .eq('payment_status', 'paid')

        // Fetch last month orders
        const { data: lastMonthOrders } = await supabase
            .from('orders')
            .select('total_amount, created_at')
            .gte('created_at', lastMonthStart.toISOString())
            .lte('created_at', lastMonthEnd.toISOString())
            .eq('payment_status', 'paid')

        // Fetch all customers count (current and last month)
        const { count: currentCustomerCount } = await supabase
            .from('customer_meta')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', currentMonthStart.toISOString())

        const { count: lastMonthCustomerCount } = await supabase
            .from('customer_meta')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', lastMonthStart.toISOString())
            .lte('created_at', lastMonthEnd.toISOString())

        // Calculate current month stats
        const currentRevenue = currentOrders?.reduce((sum, order) => sum + Number(order.total_amount || 0), 0) || 0
        const currentOrderCount = currentOrders?.length || 0
        const currentAov = currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0

        // Calculate last month stats
        const lastRevenue = lastMonthOrders?.reduce((sum, order) => sum + Number(order.total_amount || 0), 0) || 0
        const lastOrderCount = lastMonthOrders?.length || 0

        // Calculate changes
        const revenueChange = currentRevenue - lastRevenue
        const revenueChangePercent = lastRevenue > 0 ? ((revenueChange / lastRevenue) * 100).toFixed(1) : '0'
        
        const ordersChange = currentOrderCount - lastOrderCount
        const ordersChangePercent = lastOrderCount > 0 ? ((ordersChange / lastOrderCount) * 100).toFixed(1) : '0'

        const lastAov = lastOrderCount > 0 ? lastRevenue / lastOrderCount : 0
        const aovChange = currentAov - lastAov
        const aovChangePercent = lastAov > 0 ? ((aovChange / lastAov) * 100).toFixed(1) : '0'

        const customerChange = (currentCustomerCount || 0) - (lastMonthCustomerCount || 0)
        const customerChangePercent = (lastMonthCustomerCount || 0) > 0 
            ? ((customerChange / (lastMonthCustomerCount || 1)) * 100).toFixed(1) 
            : '0'

        return {
            revenue: {
                current: currentRevenue,
                change: revenueChange,
                changePercent: Number(revenueChangePercent),
            },
            orders: {
                current: currentOrderCount,
                change: ordersChange,
                changePercent: Number(ordersChangePercent),
            },
            aov: {
                current: currentAov,
                change: aovChange,
                changePercent: Number(aovChangePercent),
            },
            customers: {
                current: currentCustomerCount || 0,
                change: customerChange,
                changePercent: Number(customerChangePercent),
            },
        }
    } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        return getEmptyStats()
    }
}

function getEmptyStats(): DashboardStats {
    return {
        revenue: { current: 0, change: 0, changePercent: 0 },
        orders: { current: 0, change: 0, changePercent: 0 },
        aov: { current: 0, change: 0, changePercent: 0 },
        customers: { current: 0, change: 0, changePercent: 0 },
    }
}

export async function getRecentOrders(limit: number = 5): Promise<RecentOrder[]> {
    try {
        const supabase = createServerSupabaseClient()
        if (!supabase) return []

        const { data: orders } = await supabase
            .from('orders')
            .select('id, order_number, guest_name, guest_email, total_amount, order_status, created_at')
            .order('created_at', { ascending: false })
            .limit(limit)

        if (!orders) return []

        return orders.map(order => ({
            id: order.id,
            order_number: order.order_number,
            orderNumber: order.order_number,
            customer_name: order.guest_name || 'Unknown',
            customerName: order.guest_name || 'Unknown',
            customer_email: order.guest_email || '',
            customerEmail: order.guest_email || '',
            total: Number(order.total_amount || 0),
            total_amount: Number(order.total_amount || 0),
            status: order.order_status,
            created_at: order.created_at,
            createdAt: order.created_at,
        }))
    } catch (error) {
        console.error('Error fetching recent orders:', error)
        return []
    }
}

export async function getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    try {
        const supabase = createServerSupabaseClient()
        if (!supabase) return []

        const { data: activities } = await supabase
            .from('admin_activity_logs')
            .select('id, action, resource_type, details, created_at')
            .order('created_at', { ascending: false })
            .limit(limit)

        if (!activities || activities.length === 0) {
            // Fallback: Generate activities from recent changes
            return await generateRecentActivities(supabase, limit)
        }

        return activities.map(activity => ({
            id: activity.id,
            type: mapResourceTypeToActivityType(activity.resource_type),
            title: formatActivityTitle(activity.action, activity.resource_type),
            description: formatActivityDescription(activity),
            timestamp: activity.created_at,
        }))
    } catch (error) {
        console.error('Error fetching recent activity:', error)
        return []
    }
}

async function generateRecentActivities(supabase: any, limit: number): Promise<RecentActivity[]> {
    const activities: RecentActivity[] = []

    try {
        // Get recent orders
        const { data: orders } = await supabase
            .from('orders')
            .select('id, order_number, created_at, order_status')
            .order('created_at', { ascending: false })
            .limit(3)

        orders?.forEach((order: any) => {
            activities.push({
                id: order.id,
                type: 'order',
                title: 'New Order',
                description: `Order ${order.order_number} was ${order.order_status}`,
                timestamp: order.created_at,
            })
        })

        // Get recent quotes
        const { data: quotes } = await supabase
            .from('quotes')
            .select('id, quote_number, created_at, status')
            .order('created_at', { ascending: false })
            .limit(3)

        quotes?.forEach((quote: any) => {
            activities.push({
                id: quote.id,
                type: 'quote',
                title: 'New Quote Request',
                description: `Quote ${quote.quote_number} is ${quote.status}`,
                timestamp: quote.created_at,
            })
        })

        // Get recent products
        const { data: products } = await supabase
            .from('products')
            .select('id, name, created_at')
            .order('created_at', { ascending: false })
            .limit(2)

        products?.forEach((product: any) => {
            activities.push({
                id: product.id,
                type: 'product',
                title: 'Product Added',
                description: `Product "${product.name}" was added`,
                timestamp: product.created_at,
            })
        })

        // Sort by timestamp and limit
        return activities
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit)
    } catch (error) {
        console.error('Error generating activities:', error)
        return []
    }
}

function mapResourceTypeToActivityType(resourceType: string): 'order' | 'customer' | 'product' | 'quote' {
    switch (resourceType.toLowerCase()) {
        case 'order':
            return 'order'
        case 'customer':
            return 'customer'
        case 'product':
            return 'product'
        case 'quote':
            return 'quote'
        default:
            return 'product'
    }
}

function formatActivityTitle(action: string, resourceType: string): string {
    const actionMap: Record<string, string> = {
        create: 'Created',
        update: 'Updated',
        delete: 'Deleted',
    }
    return `${actionMap[action.toLowerCase()] || action} ${resourceType}`
}

function formatActivityDescription(activity: any): string {
    const details = activity.details || {}
    return details.description || `${activity.action} on ${activity.resource_type}`
}

export async function getLowStockItems(threshold: number = 10): Promise<LowStockItem[]> {
    try {
        const supabase = createServerSupabaseClient()
        if (!supabase) return []

        const { data: products } = await supabase
            .from('products')
            .select('id, name, sku, stock_quantity')
            .lte('stock_quantity', threshold)
            .order('stock_quantity', { ascending: true })
            .limit(10)

        if (!products) return []

        return products.map(product => ({
            id: product.id,
            name: product.name,
            product_title: product.name,
            sku: product.sku || 'N/A',
            currentStock: product.stock_quantity || 0,
            current_stock: product.stock_quantity || 0,
            threshold,
            status: product.stock_quantity === 0 ? 'out_of_stock' : 'low_stock',
        }))
    } catch (error) {
        console.error('Error fetching low stock items:', error)
        return []
    }
}

