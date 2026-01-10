import { NextRequest, NextResponse } from 'next/server'
// CSV Import Execute - Handles product and variant creation/updates
import { createAdminClient } from '@/lib/supabase/server'
import type { ProductGroup, ImportResult, ImportError } from '@/lib/types/csv-import'
import { generateSKU } from '@/lib/actions/sku-generator'

/**
 * POST /api/admin/products/import/execute
 * Executes bulk import of products and variants using junction table architecture
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const supabase = createAdminClient() // Use admin client for service-role access

  try {
    const { productGroups } = await request.json()

    if (!productGroups || !Array.isArray(productGroups)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product groups data' },
        { status: 400 }
      )
    }

    const result: ImportResult = {
      success: true,
      duration: 0,
      productsCreated: 0,
      productsUpdated: 0,
      variantsCreated: 0,
      errors: [],
      catalogStats: {
        applications: 0,
        categories: 0,
        subcategories: 0,
        types: 0,
        collections: 0
      }
    }

    // Process each product group
    for (const group of productGroups as ProductGroup[]) {
      try {
        await importProductGroup(supabase, group, result)
      } catch (error) {
        console.error(`Error importing product ${group.title}:`, error)
        result.errors!.push({
          productTitle: group.title,
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error instanceof Error ? error.stack : undefined
        })
      }
    }

    result.duration = Date.now() - startTime
    result.success = result.errors!.length === 0

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error executing import:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to execute import',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Sanitize string values - convert empty strings, rectangles, or null-like values to null
 */
function sanitizeString(value: string | null | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (trimmed === '' || trimmed === '□' || trimmed === 'null' || trimmed === 'NULL') {
    return null
  }
  return trimmed
}

/**
 * Generate meta title from product name
 */
function generateMetaTitle(name: string): string {
  // Keep it simple and SEO-friendly
  return name.length > 60 ? name.substring(0, 57) + '...' : name
}

/**
 * Generate meta description from product description
 */
function generateMetaDescription(description: string | null, shortDescription: string | null): string {
  const source = shortDescription || description || ''
  // Meta descriptions should be 150-160 characters
  return source.length > 160 ? source.substring(0, 157) + '...' : source
}

/**
 * Validate and sanitize attributes
 */
function sanitizeAttributes(attributes: any): any[] {
  if (!attributes || typeof attributes !== 'object') return []

  // Check if it's a valid object with entries
  const entries = Object.entries(attributes)
  if (entries.length === 0) return []

  // Filter out invalid entries (empty or rectangle characters)
  const validEntries = entries.filter(([key, value]) => {
    const k = sanitizeString(key)
    const v = sanitizeString(String(value))
    return k && v
  })

  if (validEntries.length === 0) return []

  return validEntries.map(([key, value]) => ({ key, value }))
}

/**
 * Imports a single product group with its variants using junction tables
 */
async function importProductGroup(
  supabase: any,
  group: ProductGroup,
  result: ImportResult
): Promise<void> {
  // Prepare product data (NO direct foreign keys for applications/categories)
  const productData = {
    name: group.title,
    slug: group.slug,
    sku: group.sku || null,
    description: group.description,
    short_description: group.short_description,
    status: group.status,
    thumbnail_url: sanitizeString(group.image_url),

    // Pricing - use base_price or price
    price: group.base_price || group.price,
    compare_at_price: group.compare_price || group.compare_at_price || null,
    cost_per_item: group.cost_per_item || null,

    // Inventory (product-level defaults)
    stock_quantity: group.stock_quantity,
    track_inventory: true,
    allow_backorders: group.allow_backorder || false,
    low_stock_threshold: group.low_stock_threshold || 10,

    // SEO - Auto-generate if not provided
    meta_title: group.meta_title || generateMetaTitle(group.title),
    meta_description: group.meta_description || generateMetaDescription(group.description, group.short_description),

    // Other
    tags: group.tags || [],

    // Specifications (attributes) - Sanitize to prevent rectangle characters
    specifications: sanitizeAttributes(group.attributes)
  }

  // Check if product exists by slug to determine if this is an update
  const { data: existingProduct } = await supabase
    .from('products')
    .select('id')
    .eq('slug', group.slug)
    .single()

  const isUpdate = existingProduct !== null
  const existingProductId = existingProduct?.id

  // If updating, delete existing junction table entries BEFORE upsert to prevent duplicates
  if (isUpdate && existingProductId) {
    await Promise.all([
      supabase.from('product_applications').delete().eq('product_id', existingProductId),
      supabase.from('product_categories').delete().eq('product_id', existingProductId),
      supabase.from('product_subcategories').delete().eq('product_id', existingProductId),
      supabase.from('product_elevator_types').delete().eq('product_id', existingProductId),
      supabase.from('product_collections').delete().eq('product_id', existingProductId),
      // Also delete existing variants
      supabase.from('product_variants').delete().eq('product_id', existingProductId)
    ])
  }

  // Insert or update product (upsert based on slug)
  const { data: product, error: productError } = await supabase
    .from('products')
    .upsert(productData, {
      onConflict: 'slug',
      ignoreDuplicates: false
    })
    .select()
    .single()

  if (productError) {
    throw new Error(`Failed to create/update product: ${productError.message}`)
  }

  if (isUpdate) {
    result.productsUpdated++
  } else {
    result.productsCreated++
  }

  const productId = product.id

  // Create junction table entries for classifications
  await createJunctionTableEntries(supabase, productId, group, result)

  // Create variants
  for (const variant of group.variants) {
    try {
      await createVariant(supabase, productId, variant, group)
      result.variantsCreated++
    } catch (error) {
      console.error(`Error creating variant for ${group.title}:`, error)
      // Continue with other variants
    }
  }
}

/**
 * Creates junction table entries for product classifications
 */
async function createJunctionTableEntries(
  supabase: any,
  productId: string,
  group: ProductGroup,
  result: ImportResult
): Promise<void> {
  // Applications (stored in product_applications)
  if (group.application_ids?.length > 0) {
    const applicationEntries = group.application_ids.map((applicationId) => ({
      product_id: productId,
      application_id: applicationId
    }))

    const { error } = await supabase
      .from('product_applications')
      .insert(applicationEntries)

    if (error) {
      console.error('Error creating application assignments:', error)
    } else {
      result.catalogStats!.applications += applicationEntries.length
    }
  }

  // Categories
  if (group.category_ids?.length > 0) {
    const categoryEntries = group.category_ids.map((categoryId, index) => ({
      product_id: productId,
      category_id: categoryId,
      is_primary: index === 0,
      position: index
    }))

    const { error } = await supabase
      .from('product_categories')
      .insert(categoryEntries)

    if (error) {
      console.error('Error creating category assignments:', error)
    } else {
      result.catalogStats!.categories += categoryEntries.length
    }
  }

  // Subcategories (stored in product_subcategories)
  if (group.subcategory_ids?.length > 0) {
    const subcategoryEntries = group.subcategory_ids.map((subcategoryId) => ({
      product_id: productId,
      subcategory_id: subcategoryId
    }))

    const { error } = await supabase
      .from('product_subcategories')
      .insert(subcategoryEntries)

    if (error) {
      console.error('Error creating subcategory assignments:', error)
    } else {
      result.catalogStats!.subcategories += subcategoryEntries.length
    }
  }

  // Elevator Types (stored in product_elevator_types)
  if (group.type_ids?.length > 0) {
    const typeEntries = group.type_ids.map(typeId => ({
      product_id: productId,
      elevator_type_id: typeId
    }))

    const { error } = await supabase
      .from('product_elevator_types')
      .insert(typeEntries)

    if (error) {
      console.error('Error creating type assignments:', error)
    } else {
      result.catalogStats!.types += typeEntries.length
    }
  }

  // Collections
  if (group.collection_ids?.length > 0) {
    const collectionEntries = group.collection_ids.map(collectionId => ({
      product_id: productId,
      collection_id: collectionId
    }))

    const { error } = await supabase
      .from('product_collections')
      .insert(collectionEntries)

    if (error) {
      console.error('Error creating collection assignments:', error)
    } else {
      result.catalogStats!.collections += collectionEntries.length
    }
  }
}

/**
 * Creates a variant for a product
 */
async function createVariant(
  supabase: any,
  productId: string,
  variant: ProductGroup['variants'][0],
  group: ProductGroup
): Promise<void> {
  // Auto-generate SKU if missing or invalid
  let variantSKU = variant.sku
  if (!variantSKU || variantSKU.trim() === '') {
    variantSKU = await generateSKU()
  }

  const variantData = {
    product_id: productId,
    name: variant.title,
    sku: variantSKU,

    // Pricing - use variant price if available, otherwise product price
    price: variant.price || group.base_price || group.price,
    compare_at_price: variant.compare_at_price || group.compare_price || group.compare_at_price || null,
    cost_per_item: group.cost_per_item || null,

    // Inventory
    inventory_quantity: variant.stock || 0,

    // Options - JSONB field only (old columns removed)
    options: (() => {
      const opts: Record<string, string> = {}
      if (variant.option1_name && variant.option1_value) {
        opts[variant.option1_name] = variant.option1_value
      }
      if (variant.option2_name && variant.option2_value) {
        opts[variant.option2_name] = variant.option2_value
      }
      return opts
    })(),

    // Auto-generate variant_title from options
    variant_title: (() => {
      const values: string[] = []
      if (variant.option1_value) values.push(variant.option1_value)
      if (variant.option2_value) values.push(variant.option2_value)
      return values.length > 0 ? values.join(' - ') : variant.title
    })(),

    // Image (inherit from product if not specified) - Sanitize
    image_url: sanitizeString(group.image_url),

    // Status (must be 'active' or 'draft')
    status: group.status === 'active' ? 'active' : 'draft'
  }

  const { error } = await supabase
    .from('product_variants')
    .insert(variantData)

  if (error) {
    throw new Error(`Failed to create variant: ${error.message}`)
  }
}
