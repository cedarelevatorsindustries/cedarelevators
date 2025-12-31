"use server"

import { createServerSupabase } from "@/lib/supabase/server"
import type {
    ProductType,
    ProductTypeWithDetails,
    CreateProductTypeData,
    ProductTypesUpdate
} from "@/lib/types/product-types"

/**
 * Assign a type to a product
 * Products can have multiple types (many-to-many)
 */
export async function assignTypeToProduct(data: CreateProductTypeData) {
    try {
        const supabase = createServerSupabase()

        // Check if already assigned
        const { data: existing } = await supabase
            .from('product_types')
            .select('id')
            .eq('product_id', data.product_id)
            .eq('type_id', data.type_id)
            .single()

        if (existing) {
            return {
                success: false,
                error: 'Type is already assigned to this product'
            }
        }

        // Create the assignment
        const { data: assignment, error } = await supabase
            .from('product_types')
            .insert({
                product_id: data.product_id,
                type_id: data.type_id
            })
            .select()
            .single()

        if (error) throw error

        return {
            success: true,
            assignment: assignment as ProductType
        }
    } catch (error) {
        console.error('Error assigning type to product:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to assign type'
        }
    }
}

/**
 * Remove a type from a product
 */
export async function removeTypeFromProduct(assignmentId: string) {
    try {
        const supabase = createServerSupabase()

        const { error } = await supabase
            .from('product_types')
            .delete()
            .eq('id', assignmentId)

        if (error) throw error

        return { success: true }
    } catch (error) {
        console.error('Error removing type from product:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to remove type'
        }
    }
}

/**
 * Get all types assigned to a product
 */
export async function getProductTypes(productId: string) {
    try {
        const supabase = createServerSupabase()

        const { data, error } = await supabase
            .from('product_types')
            .select(`
        id,
        product_id,
        type_id,
        created_at,
        type:elevator_types!type_id (
          id,
          name,
          slug,
          thumbnail_image
        )
      `)
            .eq('product_id', productId)

        if (error) throw error

        return {
            success: true,
            types: data as ProductTypeWithDetails[]
        }
    } catch (error) {
        console.error('Error fetching product types:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch types',
            types: []
        }
    }
}

/**
 * Get all products that have a specific type
 * Used in Type detail page to show products
 */
export async function getTypeProducts(typeId: string) {
    try {
        const supabase = createServerSupabase()

        const { data, error } = await supabase
            .from('product_types')
            .select(`
        id,
        product_id,
        type_id,
        created_at,
        product:products!product_id (
          id,
          name,
          slug,
          thumbnail,
          price,
          status
        )
      `)
            .eq('type_id', typeId)

        if (error) throw error

        return {
            success: true,
            products: data
        }
    } catch (error) {
        console.error('Error fetching type products:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch products',
            products: []
        }
    }
}

/**
 * Bulk update product types
 * Replaces all existing type assignments with new ones
 */
export async function updateProductTypes(data: ProductTypesUpdate) {
    try {
        const supabase = createServerSupabase()

        // Delete existing assignments
        await supabase
            .from('product_types')
            .delete()
            .eq('product_id', data.product_id)

        // Insert new assignments
        if (data.type_ids.length > 0) {
            const assignments = data.type_ids.map(type_id => ({
                product_id: data.product_id,
                type_id
            }))

            const { error } = await supabase
                .from('product_types')
                .insert(assignments)

            if (error) throw error
        }

        return { success: true }
    } catch (error) {
        console.error('Error updating product types:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update types'
        }
    }
}
