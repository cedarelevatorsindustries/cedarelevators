"use server"

import { createServerSupabase } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { cloudinary } from "@/lib/cloudinary/config"

async function uploadVariantImage(base64Data: string, sku: string): Promise<string> {
    try {
        const result = await cloudinary.uploader.upload(base64Data, {
            folder: `products/variants`,
            public_id: `variant_${sku}_${Date.now()}`,
            resource_type: 'auto',
            transformation: [
                { quality: 'auto:good' },
                { fetch_format: 'auto' }
            ]
        })
        return result.secure_url
    } catch (error) {
        console.error('Failed to upload variant image:', error)
        throw new Error('Failed to upload variant image')
    }
}

/**
 * Create a new product variant
 */
export async function createVariant(productId: string, variantData: any) {
    const supabase = await createServerSupabase()

    try {
        // Fetch product to get base SKU if needed
        const { data: product } = await supabase
            .from('products')
            .select('sku')
            .eq('id', productId)
            .single()

        const baseSku = product?.sku || 'SKU'
        const generatedSku = `${baseSku}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        const finalSku = variantData.sku || generatedSku

        // Handle Image Upload
        let imageUrl = variantData.image_url || null
        if (variantData.image_file) {
            imageUrl = await uploadVariantImage(variantData.image_file, finalSku)
        }

        const { data: variant, error } = await supabase
            .from('product_variants')
            .insert([{
                product_id: productId,
                name: variantData.name,
                sku: finalSku,
                price: parseFloat(variantData.price) || 0,
                compare_at_price: variantData.compare_at_price ? parseFloat(variantData.compare_at_price) : null,
                cost_per_item: variantData.cost_per_item ? parseFloat(variantData.cost_per_item) : null,
                inventory_quantity: parseInt(variantData.inventory_quantity) || 0,
                barcode: variantData.barcode || null,
                weight: variantData.weight ? parseFloat(variantData.weight) : null,
                status: variantData.status || 'active',
                image_url: imageUrl,
                option1_name: variantData.option1_name || null,
                option1_value: variantData.option1_value || null,
                option2_name: variantData.option2_name || null,
                option2_value: variantData.option2_value || null,
                option3_name: variantData.option3_name || null,
                option3_value: variantData.option3_value || null,
            }])
            .select()
            .single()

        if (error) {
            console.error('Error creating variant:', error)
            throw new Error('Failed to create variant')
        }

        revalidatePath(`/admin/products/${productId}/edit`)
        return { success: true, data: variant }
    } catch (error: any) {
        console.error('Error in createVariant:', error)
        return { success: false, error: error.message || 'Failed to create variant' }
    }
}

/**
 * Update an existing product variant
 */
export async function updateVariant(variantId: string, productId: string, variantData: any) {
    const supabase = await createServerSupabase()

    try {
        // Handle Image Upload
        let imageUrl = variantData.image_url
        if (variantData.image_file) {
            // If sku is available, use it, otherwise use ID or random
            const skuForImage = variantData.sku || variantId
            imageUrl = await uploadVariantImage(variantData.image_file, skuForImage)
        }

        const { data: variant, error } = await supabase
            .from('product_variants')
            .update({
                name: variantData.name,
                sku: variantData.sku,
                price: parseFloat(variantData.price) || 0,
                compare_at_price: variantData.compare_at_price ? parseFloat(variantData.compare_at_price) : null,
                cost_per_item: variantData.cost_per_item ? parseFloat(variantData.cost_per_item) : null,
                inventory_quantity: parseInt(variantData.inventory_quantity) || 0,
                barcode: variantData.barcode || null,
                weight: variantData.weight ? parseFloat(variantData.weight) : null,
                status: variantData.status || 'active',
                image_url: imageUrl,
                option1_name: variantData.option1_name || null,
                option1_value: variantData.option1_value || null,
                option2_name: variantData.option2_name || null,
                option2_value: variantData.option2_value || null,
                option3_name: variantData.option3_name || null,
                option3_value: variantData.option3_value || null,
                updated_at: new Date().toISOString()
            })
            .eq('id', variantId)
            .select()
            .single()

        if (error) {
            console.error('Error updating variant:', error)
            throw new Error('Failed to update variant')
        }

        revalidatePath(`/admin/products/${productId}/edit`)
        return { success: true, data: variant }
    } catch (error: any) {
        console.error('Error in updateVariant:', error)
        return { success: false, error: error.message || 'Failed to update variant' }
    }
}

/**
 * Delete a product variant
 */
export async function deleteVariant(variantId: string, productId: string) {
    const supabase = await createServerSupabase()

    try {
        const { error } = await supabase
            .from('product_variants')
            .delete()
            .eq('id', variantId)

        if (error) {
            console.error('Error deleting variant:', error)
            throw new Error('Failed to delete variant')
        }

        revalidatePath(`/admin/products/${productId}/edit`)
        return { success: true }
    } catch (error: any) {
        console.error('Error in deleteVariant:', error)
        return { success: false, error: error.message || 'Failed to delete variant' }
    }
}

