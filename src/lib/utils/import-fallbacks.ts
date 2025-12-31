/**
 * Import Fallback Rules Utility
 * Handles fallback logic for missing variant data
 */

import type { ProductVariant } from '@/types/csv-import.types'

/**
 * Applies fallback rules to variant data
 * - variant_price missing → use product_price
 * - variant_mrp missing → use product_mrp
 * - variant_stock missing → use product_stock
 */
export function applyVariantFallbacks(
  variant: Partial<ProductVariant>,
  productDefaults: {
    price: number
    compare_at_price?: number
    stock: number
  }
): ProductVariant {
  return {
    title: variant.title || 'Default',
    sku: variant.sku || '',
    price: variant.price ?? productDefaults.price,
    compare_at_price: variant.compare_at_price ?? productDefaults.compare_at_price,
    stock: variant.stock ?? productDefaults.stock,
    option1_name: variant.option1_name,
    option1_value: variant.option1_value,
    option2_name: variant.option2_name,
    option2_value: variant.option2_value,
    attributes: variant.attributes,
  }
}

/**
 * Validates and applies price fallback
 */
export function resolvePricing(variantPrice: string | undefined, productPrice: number): number {
  if (!variantPrice || variantPrice.trim() === '') {
    return productPrice
  }
  const parsed = parseFloat(variantPrice)
  return isNaN(parsed) ? productPrice : parsed
}

/**
 * Validates and applies stock fallback
 */
export function resolveStock(variantStock: string | undefined, productStock: number): number {
  if (!variantStock || variantStock.trim() === '') {
    return productStock
  }
  const parsed = parseInt(variantStock, 10)
  return isNaN(parsed) ? productStock : parsed
}

/**
 * Resolves image URL with fallback to product image or placeholder
 */
export function resolveImageUrl(
  variantImage?: string,
  productImage?: string
): string {
  if (variantImage && variantImage.trim() !== '') {
    return variantImage
  }
  if (productImage && productImage.trim() !== '') {
    return productImage
  }
  return '/images/product-placeholder.png'
}
