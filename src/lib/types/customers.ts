export interface CustomerWithStats {
    id: string
    email: string
    status: string
    metadata?: {
        full_name?: string
        phone?: string
    }
    totalOrders: number
    totalSpent: number
    averageOrderValue: number
    lastOrderDate: string | null
    created_at: string
    updated_at: string
}

export interface CustomerFilters {
    status?: 'all' | 'active' | 'inactive'
    search?: string
}
