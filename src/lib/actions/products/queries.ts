"use server"

import { createAdminClient } from "@/lib/supabase/server"
import { getCached } from "@/lib/cache/redis"
import { CACHE_KEYS, DEFAULT_TTL } from "@/lib/utils/cache-keys"
import type { Product, ProductFilters } from "@/lib/types/products"

/**
 * Fetch products with filters and pagination
 * Uses admin client to bypass RLS and show all product statuses
 */
export async function getProducts(filters: ProductFilters = {}, page = 1, limit = 20) {
    // Generate cache key based on filters and pagination
    const cacheKey = CACHE_KEYS.PRODUCTS.LIST(JSON.stringify({ filters, page, limit }))

    return getCached(
        cacheKey,
        async () => {
            return await getProductsUncached(filters, page, limit)
        },
        DEFAULT_TTL.PRODUCTS // 15 minutes
    )
}

async function getProductsUncached(filters: ProductFilters = {}, page = 1, limit = 20) {
    const supabase = createAdminClient()

    let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

    if (filters.search) {
        const searchTerm = filters.search.trim()

        const { data: variantMatches } = await supabase
            .from('product_variants')
            .select('product_id')
            .ilike('sku', `%${searchTerm}%`)

        const productIdsFromVariants = variantMatches?.map(v => v.product_id) || []

        if (productIdsFromVariants.length > 0) {
            query = query.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%,id.in.(${productIdsFromVariants.join(',')})`)
        } else {
            query = query.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%`)
        }
    }

    if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
    }

    if (filters.category) {
        query = query.eq('category', filters.category)
    }

    if (filters.is_featured !== undefined) {
        query = query.eq('is_featured', filters.is_featured)
    }

    const { data, error, count } = await query

    if (error) {
        console.error('Error fetching products:', error)
        throw new Error('Failed to fetch products')
    }

    return {
        products: data as Product[],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
    }
}

/**
 * Fetch single product by ID
 * Uses admin client to bypass RLS
 */
export async function getProduct(id: string) {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching product:', error)
        return null
    }

    return data as Product
}

/**
 * Fetch product with variants and classifications
 */
export async function getProductWithVariants(id: string) {
    const cacheKey = CACHE_KEYS.PRODUCTS.DETAIL(id)

    return getCached(
        cacheKey,
        async () => {
            return await getProductWithVariantsUncached(id)
        },
        DEFAULT_TTL.PRODUCTS
    )
}

async function getProductWithVariantsUncached(id: string) {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            product_variants (
                id,
                name,
                sku,
                price,
                compare_at_price,
                cost_per_item,
                inventory_quantity,
                status,
                image_url,
                options,
                created_at,
                updated_at
            ),
            product_applications (
                application_id,
                applications (id, title, handle)
            ),
            product_categories (
                category_id,
                categories (id, title, slug)
            ),
            product_subcategories (
                subcategory_id,
                subcategories:subcategory_id (id, title, slug)
            ),
            product_elevator_types (
                elevator_type_id,
                elevator_types (id, title, slug)
            ),
            product_collections (
                collection_id,
                collections (id, title, slug)
            )
        `)
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching product with variants:', error)
        return null
    }

    // Transform the data to include classification arrays
    const transformedData = {
        ...data,
        applications: data.product_applications?.map((pa: any) => pa.applications).filter(Boolean) || [],
        categories: data.product_categories?.map((pc: any) => pc.categories).filter(Boolean) || [],
        subcategories: data.product_subcategories?.map((ps: any) => ps.subcategories).filter(Boolean) || [],
        elevator_types: data.product_elevator_types?.map((pet: any) => pet.elevator_types).filter(Boolean) || [],
        collections: data.product_collections?.map((pc: any) => pc.collections).filter(Boolean) || []
    }

    return transformedData
}

/**
 * Fetch product variants only
 */
export async function getProductVariants(productId: string) {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching product variants:', error)
        return []
    }

    return data
}

/**
 * Fetch product elevator type associations
 */
export async function getProductElevatorTypes(productId: string) {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('product_elevator_types')
        .select('elevator_type_id')
        .eq('product_id', productId)

    if (error) {
        console.error('Error fetching product elevator types:', error)
        return []
    }

    return data.map(item => item.elevator_type_id)
}

/**
 * Fetch product collection associations
 */
export async function getProductCollections(productId: string) {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('product_collections')
        .select('collection_id')
        .eq('product_id', productId)
        .order('position', { ascending: true })

    if (error) {
        console.error('Error fetching product collections:', error)
        return []
    }

    return data.map(item => item.collection_id)
}

/**
 * Fetch products by IDs
 */
export async function getProductsByIds(ids: string[]) {
    if (!ids.length) return []

    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', ids)

    if (error) {
        console.error('Error fetching products by IDs:', error)
        return []
    }

    const productMap = new Map(data.map(p => [p.id, p]))
    return ids.map(id => productMap.get(id)).filter(Boolean) as Product[]
}

/**
 * Get product statistics
 */
export async function getProductStats() {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('products')
        .select('status, stock_quantity')

    if (error) {
        console.error('Error fetching product stats:', error)
        return {
            total: 0,
            active: 0,
            draft: 0,
            archived: 0,
            out_of_stock: 0,
            low_stock: 0
        }
    }

    const stats = data.reduce((acc, product) => {
        acc.total++
        if (product.status === 'active') acc.active++
        if (product.status === 'draft') acc.draft++
        if (product.status === 'archived') acc.archived++
        if (product.stock_quantity === 0) acc.out_of_stock++
        if (product.stock_quantity > 0 && product.stock_quantity < 10) acc.low_stock++
        return acc
    }, {
        total: 0,
        active: 0,
        draft: 0,
        archived: 0,
        out_of_stock: 0,
        low_stock: 0
    })

    return stats
}

// Backwards compatibility aliases for API routes
export const fetchProducts = getProducts
export const getLowStockProducts = async (threshold = 10) => {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .lte('stock_quantity', threshold)
        .order('stock_quantity', { ascending: true })

    if (error) {
        console.error('Error fetching low stock products:', error)
        return { success: false, error: error.message }
    }

    return { success: true, products: data }
}

export const updateProductInventory = async (productId: string, quantity: number) => {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('products')
        .update({ stock_quantity: quantity, updated_at: new Date().toISOString() })
        .eq('id', productId)
        .select()
        .single()

    if (error) {
        console.error('Error updating product inventory:', error)
        return { success: false, error: error.message }
    }

    return { success: true, product: data }
}



