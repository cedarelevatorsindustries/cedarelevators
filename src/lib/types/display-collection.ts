// Collection interface for dynamic display
// This matches the format returned by getCollectionsForDisplay()
export interface DisplayCollection {
    id: string
    title: string
    description?: string | null
    slug: string
    displayLocation: string[]
    layout: string
    icon: string
    viewAllLink: string
    products: any[]  // Product array
    isActive: boolean
    sortOrder: number
    showViewAll: boolean
    emptyStateMessage?: string | null
    metadata?: Record<string, any>
}

