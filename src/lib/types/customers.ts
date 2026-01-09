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

export type CustomerType = 'lead' | 'customer' | 'business' | 'individual'
export type VerificationStatus = 'incomplete' | 'pending' | 'approved' | 'rejected'

export interface CustomerFilters {
    status?: 'all' | 'active' | 'inactive'
    account_type?: 'individual' | 'business' | 'all'
    customer_type?: CustomerType | 'all'
    verification_status?: VerificationStatus | 'all'
    has_orders?: boolean
    has_quotes?: boolean
    search?: string
    date_range?: 'all' | 'last_7_days' | 'last_30_days' | 'last_90_days'
}



