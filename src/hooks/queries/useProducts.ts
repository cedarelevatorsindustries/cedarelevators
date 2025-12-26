'use client'

import { useQuery, UseQueryResult } from '@tanstack/react-query'

/**
 * Product interface
 */
export interface Product {
    id: string
    name: string
    description?: string
    category?: string
    status: string
    created_at: string
    updated_at: string
    variants_count?: number
    total_inventory?: number
}

/**
 * Fetch products from API
 */
async function fetchProducts(filters: {
    search?: string
    category?: string
    status?: string
} = {}): Promise<Product[]> {
    const params = new URLSearchParams()

    if (filters.search) params.append('search', filters.search)
    if (filters.category && filters.category !== 'all') params.append('category', filters.category)
    if (filters.status && filters.status !== 'all') params.append('status', filters.status)

    const queryString = params.toString()
    const url = queryString ? `/api/admin/products?${queryString}` : '/api/admin/products'

    const response = await fetch(url)

    if (!response.ok) {
        throw new Error('Failed to fetch products')
    }

    const data = await response.json()
    return data.products || []
}

/**
 * Hook to fetch products with filters
 */
export function useProducts(filters: {
    search?: string
    category?: string
    status?: string
} = {}): UseQueryResult<Product[], Error> {
    return useQuery({
        queryKey: ['products', filters],
        queryFn: () => fetchProducts(filters),
        staleTime: 30000, // 30 seconds
        refetchOnWindowFocus: false,
    })
}

/**
 * Hook to fetch a single product by ID
 */
export function useProduct(productId: string | null): UseQueryResult<Product, Error> {
    return useQuery({
        queryKey: ['product', productId],
        queryFn: async () => {
            if (!productId) throw new Error('Product ID is required')

            const response = await fetch(`/api/admin/products/${productId}`)

            if (!response.ok) {
                throw new Error('Failed to fetch product')
            }

            const data = await response.json()
            return data.product
        },
        enabled: !!productId,
        staleTime: 30000,
        refetchOnWindowFocus: false,
    })
}
