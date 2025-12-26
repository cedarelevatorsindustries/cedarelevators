'use server'

import { createServerSupabase } from '@/lib/supabase/server'

/**
 * Get all product categories
 */
export async function getCategories(): Promise<{ success: boolean; categories?: string[]; error?: string }> {
    try {
        const supabase = await createServerSupabase()

        // Get distinct categories from products table
        const { data, error } = await supabase
            .from('products')
            .select('category')
            .not('category', 'is', null)
            .order('category')

        if (error) {
            console.error('Error fetching categories:', error)
            return { success: false, error: error.message }
        }

        // Extract unique categories
        const categories = [...new Set(data.map(item => item.category).filter(Boolean))] as string[]

        return { success: true, categories }
    } catch (error: any) {
        console.error('Error in getCategories:', error)
        return { success: false, error: error.message || 'Failed to fetch categories' }
    }
}

/**
 * Get product by ID
 */
export async function getProductById(productId: string): Promise<{ success: boolean; product?: any; error?: string }> {
    try {
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
          inventory_quantity,
          status
        )
      `)
            .eq('id', productId)
            .single()

        if (error) {
            console.error('Error fetching product:', error)
            return { success: false, error: error.message }
        }

        return { success: true, product: data }
    } catch (error: any) {
        console.error('Error in getProductById:', error)
        return { success: false, error: error.message || 'Failed to fetch product' }
    }
}

/**
 * Create a new product
 */
export async function createProduct(productData: {
    name: string
    description?: string
    category?: string
    status: string
}): Promise<{ success: boolean; product?: any; error?: string }> {
    try {
        const supabase = await createServerSupabase()

        const { data, error } = await supabase
            .from('products')
            .insert([productData])
            .select()
            .single()

        if (error) {
            console.error('Error creating product:', error)
            return { success: false, error: error.message }
        }

        return { success: true, product: data }
    } catch (error: any) {
        console.error('Error in createProduct:', error)
        return { success: false, error: error.message || 'Failed to create product' }
    }
}

/**
 * Update product
 */
export async function updateProduct(
    productId: string,
    updates: {
        name?: string
        description?: string
        category?: string
        status?: string
    }
): Promise<{ success: boolean; product?: any; error?: string }> {
    try {
        const supabase = await createServerSupabase()

        const { data, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', productId)
            .select()
            .single()

        if (error) {
            console.error('Error updating product:', error)
            return { success: false, error: error.message }
        }

        return { success: true, product: data }
    } catch (error: any) {
        console.error('Error in updateProduct:', error)
        return { success: false, error: error.message || 'Failed to update product' }
    }
}

/**
 * Delete product
 */
export async function deleteProduct(productId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createServerSupabase()

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId)

        if (error) {
            console.error('Error deleting product:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error: any) {
        console.error('Error in deleteProduct:', error)
        return { success: false, error: error.message || 'Failed to delete product' }
    }
}

/**
 * Fetch products with filters
 */
export async function fetchProducts(filters?: {
    search?: string
    category?: string
    status?: string
    limit?: number
}): Promise<{ success: boolean; products?: any[]; error?: string }> {
    try {
        const supabase = await createServerSupabase()

        let query = supabase
            .from('products')
            .select(`
        *,
        product_variants (count)
      `)
            .order('created_at', { ascending: false })

        if (filters?.search) {
            query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
        }

        if (filters?.category && filters.category !== 'all') {
            query = query.eq('category', filters.category)
        }

        if (filters?.status && filters.status !== 'all') {
            query = query.eq('status', filters.status)
        }

        if (filters?.limit) {
            query = query.limit(filters.limit)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching products:', error)
            return { success: false, error: error.message }
        }

        return { success: true, products: data }
    } catch (error: any) {
        console.error('Error in fetchProducts:', error)
        return { success: false, error: error.message || 'Failed to fetch products' }
    }
}
