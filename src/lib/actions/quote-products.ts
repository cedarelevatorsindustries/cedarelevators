'use server'

import { createAdminClient } from '@/lib/supabase/server'

export interface ProductOption {
  value: string
  label: string
  name: string
  sku: string
  thumbnail?: string | null
  specifications?: Record<string, any> | null
  price?: number
}

/**
 * Fetch active products for the unified quotation form selector (guest-first, no Clerk required)
 */
export async function getProductsForQuote(searchQuery?: string): Promise<{
  success: boolean
  products?: ProductOption[]
  error?: string
}> {
  try {
    const supabase = createAdminClient()

    let query = supabase
      .from('products')
      .select('id, name, sku, thumbnail_url, specifications, technical_specs')
      .eq('status', 'active')
      .order('name')

    if (searchQuery && searchQuery.trim()) {
      const safe = searchQuery.trim().replace(/[,%()]/g, '')
      if (safe) {
        query = query.or(`name.ilike.%${safe}%,sku.ilike.%${safe}%`)
      }
    }

    query = query.limit(50)

    const { data, error } = await query
    if (error) {
      console.error('Error fetching products for quote:', error)
      return { success: false, error: error.message }
    }

    const products: ProductOption[] = (data || []).map((product: any) => ({
      value: product.id,
      name: product.name,
      label: `${product.name}${product.sku ? ` (${product.sku})` : ''}`,
      sku: product.sku || '',
      thumbnail: product.thumbnail_url || null,
      specifications:
        (product.specifications && typeof product.specifications === 'object'
          ? product.specifications
          : null) ||
        (product.technical_specs && typeof product.technical_specs === 'object'
          ? product.technical_specs
          : null),
    }))

    return { success: true, products }
  } catch (error: any) {
    console.error('Error fetching products for quote:', error)
    return { success: false, error: error.message }
  }
}

export async function searchProductsForQuote(query: string): Promise<{
  success: boolean
  products?: ProductOption[]
  error?: string
}> {
  if (!query || query.trim().length < 2) {
    return getProductsForQuote()
  }
  return getProductsForQuote(query)
}

export interface VariantOption {
  value: string
  label: string
  sku: string | null
  price?: number
  options?: Record<string, string>
  variant_title?: string | null
}

/**
 * Get active variants for a product
 */
export async function getProductVariants(productId: string): Promise<{
  success: boolean
  variants?: VariantOption[]
  error?: string
}> {
  try {
    if (!productId) {
      return { success: true, variants: [] }
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('product_variants')
      .select('id, name, sku, options, variant_title, status')
      .eq('product_id', productId)
      .neq('status', 'inactive')
      .order('name')

    if (error) {
      console.error('Error fetching product variants:', error)
      return { success: false, error: error.message }
    }

    const variants: VariantOption[] = (data || []).map((variant: any) => {
      let label = variant.variant_title
      if (!label && variant.options && typeof variant.options === 'object') {
        const values = Object.values(variant.options).filter(Boolean)
        if (values.length > 0) {
          label = values.join(' / ')
        }
      }
      if (!label) {
        label = variant.name || `Variant ${variant.sku || variant.id.slice(0, 8)}`
      }

      return {
        value: variant.id,
        label,
        sku: variant.sku || null,
        options: variant.options || undefined,
        variant_title: variant.variant_title || label,
      }
    })

    return { success: true, variants }
  } catch (error: any) {
    console.error('Error fetching product variants:', error)
    return { success: false, error: error.message }
  }
}
