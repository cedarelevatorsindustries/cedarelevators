"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

// Helper to ensure supabase client is not null
function ensureSupabase(client: ReturnType<typeof createServerSupabaseClient>) {
    if (!client) {
        throw new Error('Failed to create Supabase client')
    }
    return client
}

/**
 * Generate a unique 18-character SKU
 * Format: PROD-XXXXXXXXXXXXXX
 * Uses timestamp + random for uniqueness
 */
export async function generateSKU(): Promise<string> {
    const supabase = ensureSupabase(createServerSupabaseClient())

    let sku: string
    let isUnique = false
    let attempts = 0
    const maxAttempts = 10

    while (!isUnique && attempts < maxAttempts) {
        // Generate SKU: PROD- + 13 characters (timestamp + random)
        const timestamp = Date.now().toString(36).toUpperCase() // Base36 timestamp
        const random = Math.random().toString(36).substring(2, 8).toUpperCase() // 6 random chars
        sku = `PROD-${timestamp}${random}`.substring(0, 18) // Ensure 18 chars total

        // Check uniqueness in database
        const { data: existingProduct } = await supabase
            .from('products')
            .select('id')
            .eq('sku', sku)
            .maybeSingle()

        const { data: existingVariant } = await supabase
            .from('product_variants')
            .select('id')
            .eq('sku', sku)
            .maybeSingle()

        if (!existingProduct && !existingVariant) {
            isUnique = true
        }

        attempts++
    }

    if (!isUnique) {
        throw new Error('Failed to generate unique SKU after maximum attempts')
    }

    return sku!
}

/**
 * Generate multiple unique SKUs at once
 */
export async function generateSKUs(count: number): Promise<string[]> {
    const skus: string[] = []

    for (let i = 0; i < count; i++) {
        const sku = await generateSKU()
        skus.push(sku)
    }

    return skus
}

/**
 * Validate SKU format
 */
export async function isValidSKU(sku: string): Promise<boolean> {
    // SKU must be 18 characters, start with PROD-, and contain only alphanumeric + hyphen
    const skuRegex = /^PROD-[A-Z0-9]{13}$/
    return skuRegex.test(sku)
}

/**
 * Check if SKU already exists in database
 */
export async function checkSKUExists(sku: string): Promise<boolean> {
    const supabase = ensureSupabase(createServerSupabaseClient())

    const { data: product } = await supabase
        .from('products')
        .select('id')
        .eq('sku', sku)
        .maybeSingle()

    const { data: variant } = await supabase
        .from('product_variants')
        .select('id')
        .eq('sku', sku)
        .maybeSingle()

    return !!(product || variant)
}
