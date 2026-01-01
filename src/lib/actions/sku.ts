"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

/**
 * Generates a unique 18-character SKU for a product
 * Format: CED-P-XXXXXXXXXXXX
 * 
 * @returns {Promise<string>} The generated SKU
 */
export async function generateProductSKU(): Promise<string> {
    const supabase = createServerSupabaseClient()

    if (!supabase) {
        throw new Error('Failed to create Supabase client')
    }

    // Call the database function
    const { data, error } = await supabase.rpc('generate_product_sku')

    if (error) {
        console.error('Error generating SKU:', error)
        throw new Error('Failed to generate unique SKU')
    }

    return data as string
}

/**
 * Validates if a SKU matches the required format
 * @param sku - The SKU to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function validateSKU(sku: string): boolean {
    const skuRegex = /^CED-P-[A-Z0-9]{12}$/
    return sku.length === 18 && skuRegex.test(sku)
}

/**
 * Checks if a SKU is unique in the database
 * @param sku - The SKU to check
 * @returns {Promise<boolean>} True if unique, false if already exists
 */
export async function isSKUUnique(sku: string): Promise<boolean> {
    const supabase = createServerSupabaseClient()

    if (!supabase) {
        throw new Error('Failed to create Supabase client')
    }

    const { data, error } = await supabase
        .from('products')
        .select('sku')
        .eq('sku', sku)
        .single()

    if (error && error.code === 'PGRST116') {
        // No rows returned - SKU is unique
        return true
    }

    return false
}
