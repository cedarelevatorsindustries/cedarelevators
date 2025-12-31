/**
 * SKU Generation Utility
 * Generates unique SKUs for products and variants
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * Generates a product SKU in format: CED-{CATEGORY_CODE}-{AUTO_INCREMENT}
 * Example: CED-MOTOR-000234
 */
export async function generateProductSKU(categoryName: string): Promise<string> {
  const supabase = createServerSupabaseClient()

  if (!supabase) {
    // Fallback to random number if client creation fails
    const categoryCode = categoryName
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .substring(0, 4)
      .padEnd(3, 'X')
    const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0')
    return `CED-${categoryCode}-${random}`
  }

  // Get category code (first 3-4 uppercase letters)
  const categoryCode = categoryName
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .substring(0, 4)
    .padEnd(3, 'X') // Ensure at least 3 chars

  // Get next available increment for this category
  // Query existing products with this category code
  const { data: existingProducts, error } = await supabase
    .from('products')
    .select('sku')
    .like('sku', `CED-${categoryCode}-%`)
    .order('sku', { ascending: false })
    .limit(1)

  if (error) {
    console.error('Error fetching existing SKUs:', error)
    // Fallback to random number if query fails
    const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0')
    return `CED-${categoryCode}-${random}`
  }

  // Extract increment from last SKU or start from 1
  let nextIncrement = 1
  if (existingProducts && existingProducts.length > 0) {
    const lastSKU = existingProducts[0].sku
    const match = lastSKU.match(/-([0-9]+)$/)
    if (match) {
      nextIncrement = parseInt(match[1], 10) + 1
    }
  }

  // Format increment with leading zeros (6 digits)
  const incrementStr = nextIncrement.toString().padStart(6, '0')

  return `CED-${categoryCode}-${incrementStr}`
}

/**
 * Generates a variant SKU in format: {PRODUCT_SKU}-{OPTION_VALUES}
 * Example: CED-MOTOR-000234-1000KG-415V
 */
export function generateVariantSKU(
  productSKU: string,
  option1Value?: string,
  option2Value?: string
): string {
  const parts = [productSKU]

  if (option1Value) {
    // Clean and format option value
    const cleaned = option1Value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
    parts.push(cleaned)
  }

  if (option2Value) {
    const cleaned = option2Value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
    parts.push(cleaned)
  }

  return parts.join('-')
}

/**
 * Validates if a SKU already exists in the database
 */
export async function validateSKUUniqueness(sku: string): Promise<boolean> {
  const supabase = createServerSupabaseClient()

  if (!supabase) {
    return true // Assume unique if client creation fails
  }

  // Check products table
  const { data: products } = await supabase
    .from('products')
    .select('id')
    .eq('sku', sku)
    .limit(1)

  if (products && products.length > 0) {
    return false // SKU exists
  }

  // Check product_variants table
  const { data: variants } = await supabase
    .from('product_variants')
    .select('id')
    .eq('sku', sku)
    .limit(1)

  if (variants && variants.length > 0) {
    return false // SKU exists
  }

  return true // SKU is unique
}
