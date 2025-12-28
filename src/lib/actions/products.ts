'use server'

import { createServerSupabase } from '@/lib/supabase/server'

interface Category {
    id: string
    name: string
    slug: string
}

/**
 * Get all product categories
 */
export async function getCategories(): Promise<{ success: boolean; data?: Category[]; error?: string }> {
    try {
        const supabase = await createServerSupabase()

        // Get categories from categories table
        const { data, error } = await supabase
            .from('categories')
            .select('id, name, slug')
            .order('name')

        if (error) {
            console.error('Error fetching categories:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data: data as Category[] }
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
 * Create a new product with complete fields
 */
export async function createProduct(productData: {
    name: string
    slug?: string
    description?: string
    short_description?: string
    category?: string
    status?: string
    thumbnail?: string
    images?: string[]
    price?: number
    compare_at_price?: number
    cost_per_item?: number
    stock_quantity?: number
    sku?: string
    barcode?: string
    weight?: number
    dimensions?: any
    specifications?: any
    tags?: string[]
    is_featured?: boolean
}): Promise<{ success: boolean; product?: any; error?: string }> {
    try {
        const supabase = await createServerSupabase()

        // Validate required fields
        if (!productData.name) {
            return { success: false, error: 'Product name is required' }
        }

        // Generate slug from name if not provided
        const slug = productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

        // Check if slug already exists
        const { data: existing } = await supabase
            .from('products')
            .select('id')
            .eq('slug', slug)
            .single()

        if (existing) {
            return { success: false, error: 'Product with this slug already exists' }
        }

        const { data, error } = await supabase
            .from('products')
            .insert([{
                name: productData.name,
                slug,
                description: productData.description,
                short_description: productData.short_description,
                category: productData.category,
                status: productData.status || 'draft',
                thumbnail: productData.thumbnail,
                images: productData.images || [],
                price: productData.price,
                compare_at_price: productData.compare_at_price,
                cost_per_item: productData.cost_per_item,
                stock_quantity: productData.stock_quantity || 0,
                sku: productData.sku,
                barcode: productData.barcode,
                weight: productData.weight,
                dimensions: productData.dimensions,
                specifications: productData.specifications,
                tags: productData.tags,
                is_featured: productData.is_featured || false,
            }])
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

// Alias exports for consistency
export const getProduct = getProductById
export const getCollections = async () => ({ success: true, data: [] })
export const getTags = async () => ({ success: true, data: [] })
