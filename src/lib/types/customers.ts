import { Customer, CustomerType, VerificationStatus, CustomerFilters as B2BCustomerFilters } from '@/types/b2b/customer'

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

// Re-export types from canonical source
export type { CustomerType, VerificationStatus }

// Re-export CustomerFilters from canonical source
export type CustomerFilters = B2BCustomerFilters



