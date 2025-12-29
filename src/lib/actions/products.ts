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
 * Create new product (Cedar Interconnection Logic)
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

    // Separate elevator_type_ids and collection_ids from main product data
    const { elevator_type_ids, collection_ids, ...mainProductData } = productData

    // Set is_categorized based on whether product has proper category
    const is_categorized = !!(
        mainProductData.application_id &&
        mainProductData.category_id &&
        mainProductData.application_id !== 'general' &&
        mainProductData.category_id !== 'uncategorized'
    )

    // Prepare product data with Cedar technical fields
    const productToInsert = {
        ...mainProductData,
        is_categorized,
        // Ensure technical_specs is properly formatted as JSONB
        technical_specs: mainProductData.technical_specs || {},
    }

    // Insert product
    const { data: product, error: productError } = await supabase
        .from('products')
        .insert([productToInsert])
        .select()
        .single()

    if (productError) {
        console.error('Error creating product:', productError)
        throw new Error('Failed to create product')
    }

    // Insert elevator type relationships
    if (elevator_type_ids && elevator_type_ids.length > 0) {
        const elevatorTypeRecords = elevator_type_ids.map((typeId) => ({
            product_id: product.id,
            elevator_type_id: typeId,
        }))

        const { error: elevatorTypesError } = await supabase
            .from('product_elevator_types')
            .insert(elevatorTypeRecords)

        if (elevatorTypesError) {
            console.error('Error creating product-elevator type relationships:', elevatorTypesError)
            // Rollback: delete the product
            await supabase.from('products').delete().eq('id', product.id)
            throw new Error('Failed to assign elevator types')
        }
    }

    // Insert collection relationships (if any)
    if (collection_ids && collection_ids.length > 0) {
        const collectionRecords = collection_ids.map((collectionId, index) => ({
            product_id: product.id,
            collection_id: collectionId,
            position: index,
        }))

        const { error: collectionsError } = await supabase
            .from('product_collections')
            .insert(collectionRecords)

        if (collectionsError) {
            console.error('Error creating product-collection relationships:', collectionsError)
            // Non-fatal: Collections are optional
        }
    }

    revalidatePath('/admin/products')
    return { success: true, product: product as Product }
}

/**
 * Update existing product
 */
export async function updateProduct(id: string, productData: Partial<ProductFormData>) {
    const supabase = await createServerSupabase()

    // Prepare update data ensuring technical_specs is properly formatted
    const updateData = {
        ...productData,
        technical_specs: productData.technical_specs !== undefined 
            ? productData.technical_specs 
            : undefined,
    }

    const { data, error } = await supabase
        .from('products')
        .update(updateData)
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
