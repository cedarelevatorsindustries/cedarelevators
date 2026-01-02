'use server'

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
    return {
        revenue: {
            current: 0,
            change: 0,
            changePercent: 0,
        },
        orders: {
            current: 0,
            change: 0,
            changePercent: 0,
        },
        aov: {
            current: 0,
            change: 0,
            changePercent: 0,
        },
        customers: {
            current: 0,
            change: 0,
            changePercent: 0,
        },
    }
}

export async function getRecentOrders(limit: number = 5): Promise<RecentOrder[]> {
    return []
}

export async function getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    return []
}

export async function getLowStockItems(threshold: number = 10): Promise<LowStockItem[]> {
    return []
}
