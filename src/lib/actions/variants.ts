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

        // Generate or use provided SKU
        let finalSku = variantData.sku

        // If no SKU provided or empty, generate one
        if (!finalSku || finalSku.trim() === '') {
            // Generate a unique SKU
            let attempts = 0
            let isUnique = false

            while (!isUnique && attempts < 10) {
                const generatedSku = `${baseSku}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

                // Check if SKU already exists
                const { data: existingSku } = await supabase
                    .from('product_variants')
                    .select('id')
                    .eq('sku', generatedSku)
                    .maybeSingle()

                if (!existingSku) {
                    finalSku = generatedSku
                    isUnique = true
                }
                attempts++
            }

            if (!isUnique) {
                throw new Error('Failed to generate unique SKU after 10 attempts')
            }
        } else {
            // Validate that provided SKU is unique
            const { data: existingSku } = await supabase
                .from('product_variants')
                .select('id')
                .eq('sku', finalSku)
                .maybeSingle()

            if (existingSku) {
                throw new Error(`SKU "${finalSku}" already exists. Please use a different SKU.`)
            }
        }

        // Handle Image Upload
        let imageUrl = variantData.image_url || null
        if (variantData.image_file) {
            imageUrl = await uploadVariantImage(variantData.image_file, finalSku)
        }

        // Build options JSON from variant data
        const options: any = {}
        if (variantData.option1_name && variantData.option1_value) {
            options[variantData.option1_name] = variantData.option1_value
        }
        if (variantData.option2_name && variantData.option2_value) {
            options[variantData.option2_name] = variantData.option2_value
        }
        if (variantData.option3_name && variantData.option3_value) {
            options[variantData.option3_name] = variantData.option3_value
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
                status: variantData.status || 'active',
                image_url: imageUrl,
                options: Object.keys(options).length > 0 ? options : null,
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
        // Validate SKU uniqueness if SKU is being changed
        if (variantData.sku) {
            const { data: existingSku } = await supabase
                .from('product_variants')
                .select('id')
                .eq('sku', variantData.sku)
                .neq('id', variantId) // Exclude current variant
                .maybeSingle()

            if (existingSku) {
                throw new Error(`SKU "${variantData.sku}" already exists. Please use a different SKU.`)
            }
        }

        // Handle Image Upload
        let imageUrl = variantData.image_url
        if (variantData.image_file) {
            // If sku is available, use it, otherwise use ID or random
            const skuForImage = variantData.sku || variantId
            imageUrl = await uploadVariantImage(variantData.image_file, skuForImage)
        }

        // Build options JSON from variant data
        const options: any = {}
        if (variantData.option1_name && variantData.option1_value) {
            options[variantData.option1_name] = variantData.option1_value
        }
        if (variantData.option2_name && variantData.option2_value) {
            options[variantData.option2_name] = variantData.option2_value
        }
        if (variantData.option3_name && variantData.option3_value) {
            options[variantData.option3_name] = variantData.option3_value
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
                status: variantData.status || 'active',
                image_url: imageUrl,
                options: Object.keys(options).length > 0 ? options : null,
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

/**
 * Toggle variant status (active/draft)
 * Simple status update without SKU validation
 */
export async function toggleVariantStatus(variantId: string, productId: string, newStatus: 'active' | 'draft') {
    const supabase = await createServerSupabase()

    try {
        const { data: variant, error } = await supabase
            .from('product_variants')
            .update({
                status: newStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', variantId)
            .select()
            .single()

        if (error) {
            console.error('Error toggling variant status:', error)
            throw new Error('Failed to toggle variant status')
        }

        revalidatePath(`/admin/products/${productId}/edit`)
        return { success: true, data: variant }
    } catch (error: any) {
        console.error('Error in toggleVariantStatus:', error)
        return { success: false, error: error.message || 'Failed to toggle variant status' }
    }
}

