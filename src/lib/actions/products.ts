"use server"

import { createServerSupabase } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Product, ProductFormData, ProductFilters, ProductStats } from "@/lib/types/products"

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
        query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`)
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
 * Create new product
 */
export async function createProduct(productData: ProductFormData) {
    const supabase = await createServerSupabase()

    // Ensure slug is unique
    const { data: existingSlug } = await supabase
        .from('products')
        .select('id')
        .eq('slug', productData.slug)
        .single()

    if (existingSlug) {
        throw new Error('Product with this URL handle already exists')
    }

    const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single()

    if (error) {
        console.error('Error creating product:', error)
        throw new Error('Failed to create product')
    }

    revalidatePath('/admin/products')
    return data as Product
}

/**
 * Update existing product
 */
export async function updateProduct(id: string, productData: Partial<ProductFormData>) {
    const supabase = await createServerSupabase()

    const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating product:', error)
        throw new Error('Failed to update product')
    }

    revalidatePath('/admin/products')
    revalidatePath(`/admin/products/${id}/edit`)
    return data as Product
}

/**
 * Delete product
 */
export async function deleteProduct(id: string) {
    const supabase = await createServerSupabase()

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting product:', error)
        throw new Error('Failed to delete product')
    }

    revalidatePath('/admin/products')
}

/**
 * Get product statistics
 */
export async function getProductStats(): Promise<ProductStats> {
    const supabase = await createServerSupabase()

    // We can optimize this with specific count queries if needed
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
