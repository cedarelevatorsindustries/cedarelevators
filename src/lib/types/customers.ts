import { Customer } from '@/types/b2b/customer'

// CustomerStats for dashboard/stats display
export interface CustomerStats {
    total: number
    active: number
    inactive: number
    new_this_month: number
}

// CustomerWithStats extends the Customer type to ensure compatibility
export interface CustomerWithStats extends Customer {
    // Additional stats properties (using different naming for backwards compatibility)
    totalOrders: number
    totalSpent: number
    averageOrderValue: number
    lastOrderDate: string | null
}

export interface CustomerFilters {
    status?: 'all' | 'active' | 'inactive'
    search?: string
}


