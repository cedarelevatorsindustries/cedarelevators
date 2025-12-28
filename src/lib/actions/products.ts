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
 * Update product with complete fields
 */
export async function updateProduct(
    productId: string,
    updates: Partial<{
        name: string
        slug: string
        description: string
        short_description: string
        category: string
        status: string
        thumbnail: string
        images: string[]
        price: number
        compare_at_price: number
        cost_per_item: number
        stock_quantity: number
        sku: string
        barcode: string
        weight: number
        dimensions: any
        specifications: any
        tags: string[]
        is_featured: boolean
    }>
): Promise<{ success: boolean; product?: any; error?: string }> {
    try {
        const supabase = await createServerSupabase()

        // If slug is being updated, check uniqueness
        if (updates.slug) {
            const { data: existing } = await supabase
                .from('products')
                .select('id')
                .eq('slug', updates.slug)
                .neq('id', productId)
                .single()

            if (existing) {
                return { success: false, error: 'Product with this slug already exists' }
            }
        }

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

/**
 * Get product by slug
 */
export async function getProductBySlug(slug: string): Promise<{ success: boolean; product?: any; error?: string }> {
    try {
        const supabase = await createServerSupabase()

        const { data, error } = await supabase
            .from('products')
            .select(`
        *,
        product_variants (*)
      `)
            .eq('slug', slug)
            .single()

        if (error) {
            console.error('Error fetching product:', error)
            return { success: false, error: error.message }
        }

        return { success: true, product: data }
    } catch (error: any) {
        console.error('Error in getProductBySlug:', error)
        return { success: false, error: error.message || 'Failed to fetch product' }
    }
}

/**
 * Bulk update product status
 */
export async function bulkUpdateProductStatus(productIds: string[], status: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createServerSupabase()

        if (!productIds || productIds.length === 0) {
            return { success: false, error: 'No product IDs provided' }
        }

        const { error } = await supabase
            .from('products')
            .update({ status })
            .in('id', productIds)

        if (error) {
            console.error('Error bulk updating products:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error: any) {
        console.error('Error in bulkUpdateProductStatus:', error)
        return { success: false, error: error.message || 'Failed to bulk update products' }
    }
}

/**
 * Bulk delete products
 */
export async function bulkDeleteProducts(productIds: string[]): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createServerSupabase()

        if (!productIds || productIds.length === 0) {
            return { success: false, error: 'No product IDs provided' }
        }

        const { error } = await supabase
            .from('products')
            .delete()
            .in('id', productIds)

        if (error) {
            console.error('Error bulk deleting products:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error: any) {
        console.error('Error in bulkDeleteProducts:', error)
        return { success: false, error: error.message || 'Failed to bulk delete products' }
    }
}

/**
 * Update product inventory
 */
export async function updateProductInventory(
    productId: string,
    quantity: number,
    operation: 'set' | 'increment' | 'decrement' = 'set'
): Promise<{ success: boolean; product?: any; error?: string }> {
    try {
        const supabase = await createServerSupabase()

        if (operation === 'set') {
            const { data, error } = await supabase
                .from('products')
                .update({ stock_quantity: quantity })
                .eq('id', productId)
                .select()
                .single()

            if (error) {
                console.error('Error updating inventory:', error)
                return { success: false, error: error.message }
            }

            return { success: true, product: data }
        } else {
            // For increment/decrement, fetch current value first
            const { data: current } = await supabase
                .from('products')
                .select('stock_quantity')
                .eq('id', productId)
                .single()

            if (!current) {
                return { success: false, error: 'Product not found' }
            }

            const newQuantity = operation === 'increment'
                ? (current.stock_quantity || 0) + quantity
                : Math.max(0, (current.stock_quantity || 0) - quantity)

            const { data, error } = await supabase
                .from('products')
                .update({ stock_quantity: newQuantity })
                .eq('id', productId)
                .select()
                .single()

            if (error) {
                console.error('Error updating inventory:', error)
                return { success: false, error: error.message }
            }

            return { success: true, product: data }
        }
    } catch (error: any) {
        console.error('Error in updateProductInventory:', error)
        return { success: false, error: error.message || 'Failed to update inventory' }
    }
}

/**
 * Get low stock products
 */
export async function getLowStockProducts(threshold: number = 10): Promise<{ success: boolean; products?: any[]; error?: string }> {
    try {
        const supabase = await createServerSupabase()

        const { data, error } = await supabase
            .from('products')
            .select('id, name, slug, sku, stock_quantity, status')
            .eq('status', 'active')
            .lt('stock_quantity', threshold)
            .order('stock_quantity')

        if (error) {
            console.error('Error fetching low stock products:', error)
            return { success: false, error: error.message }
        }

        return { success: true, products: data }
    } catch (error: any) {
        console.error('Error in getLowStockProducts:', error)
        return { success: false, error: error.message || 'Failed to fetch low stock products' }
    }
}

/**
 * Advanced product search with multiple filters
 */
export async function advancedProductSearch(filters: {
    search?: string
    categories?: string[]
    status?: string
    priceMin?: number
    priceMax?: number
    inStock?: boolean
    isFeatured?: boolean
    tags?: string[]
    sortBy?: 'created_at' | 'price' | 'name' | 'stock_quantity'
    sortOrder?: 'asc' | 'desc'
    limit?: number
    offset?: number
}): Promise<{ success: boolean; products?: any[]; total?: number; error?: string }> {
    try {
        const supabase = await createServerSupabase()

        let query = supabase
            .from('products')
            .select('*, product_variants(count)', { count: 'exact' })

        // Text search
        if (filters.search) {
            query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`)
        }

        // Category filter
        if (filters.categories && filters.categories.length > 0) {
            query = query.in('category', filters.categories)
        }

        // Status filter
        if (filters.status && filters.status !== 'all') {
            query = query.eq('status', filters.status)
        }

        // Price range
        if (filters.priceMin !== undefined) {
            query = query.gte('price', filters.priceMin)
        }
        if (filters.priceMax !== undefined) {
            query = query.lte('price', filters.priceMax)
        }

        // Stock filter
        if (filters.inStock !== undefined) {
            if (filters.inStock) {
                query = query.gt('stock_quantity', 0)
            } else {
                query = query.eq('stock_quantity', 0)
            }
        }

        // Featured filter
        if (filters.isFeatured !== undefined) {
            query = query.eq('is_featured', filters.isFeatured)
        }

        // Tags filter
        if (filters.tags && filters.tags.length > 0) {
            query = query.overlaps('tags', filters.tags)
        }

        // Sorting
        const sortBy = filters.sortBy || 'created_at'
        const sortOrder = filters.sortOrder || 'desc'
        query = query.order(sortBy, { ascending: sortOrder === 'asc' })

        // Pagination
        if (filters.offset !== undefined) {
            query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
        } else if (filters.limit) {
            query = query.limit(filters.limit)
        }

        const { data, error, count } = await query

        if (error) {
            console.error('Error in advanced search:', error)
            return { success: false, error: error.message }
        }

        return { success: true, products: data, total: count || 0 }
    } catch (error: any) {
        console.error('Error in advancedProductSearch:', error)
        return { success: false, error: error.message || 'Failed to search products' }
    }
}

/**
 * Duplicate a product
 */
export async function duplicateProduct(productId: string): Promise<{ success: boolean; product?: any; error?: string }> {
    try {
        const supabase = await createServerSupabase()

        // Get the original product
        const { data: original, error: fetchError } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single()

        if (fetchError || !original) {
            return { success: false, error: 'Product not found' }
        }

        // Create new product with modified data
        const newProduct = {
            ...original,
            name: `${original.name} (Copy)`,
            slug: `${original.slug}-copy-${Date.now()}`,
            status: 'draft',
        }

        // Remove id and timestamps
        delete newProduct.id
        delete newProduct.created_at
        delete newProduct.updated_at

        const { data, error } = await supabase
            .from('products')
            .insert([newProduct])
            .select()
            .single()

        if (error) {
            console.error('Error duplicating product:', error)
            return { success: false, error: error.message }
        }

        return { success: true, product: data }
    } catch (error: any) {
        console.error('Error in duplicateProduct:', error)
        return { success: false, error: error.message || 'Failed to duplicate product' }
    }
}

// Alias exports for consistency
export const getProduct = getProductById
export const getCollections = async () => ({ success: true, data: [] })
export const getTags = async () => ({ success: true, data: [] })
