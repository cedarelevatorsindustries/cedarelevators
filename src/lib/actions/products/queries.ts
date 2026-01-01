"use server"

import { createServerSupabase } from "@/lib/supabase/server"
import type { Product, ProductFilters } from "@/lib/types/products"

/**
 * Fetch products with filters and pagination
 */
export async function getProducts(filters: ProductFilters = {}, page = 1, limit = 20) {
    const supabase = await createServerSupabase()

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

    if (filters.status) {
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
 */
export async function getProduct(id: string) {
    const supabase = await createServerSupabase()

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
 * Fetch product with variants
 */
export async function getProductWithVariants(id: string) {
    const supabase = await createServerSupabase()

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
                barcode,
                weight,
                image_url,
                created_at,
                updated_at
            )
        `)
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching product with variants:', error)
        return null
    }

    return data
}

/**
 * Fetch product variants only
 */
export async function getProductVariants(productId: string) {
    const supabase = await createServerSupabase()

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
    const supabase = await createServerSupabase()

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
    const supabase = await createServerSupabase()

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

    const supabase = await createServerSupabase()

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
    const supabase = await createServerSupabase()

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

