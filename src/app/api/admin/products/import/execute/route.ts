import { NextRequest, NextResponse } from 'next/server'
// CSV Import Execute - Handles product and variant creation/updates
import { createAdminClient } from '@/lib/supabase/server'
import type { ProductGroup, ImportResult, ImportError } from '@/lib/types/csv-import'

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
      errors: []
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
    thumbnail_url: group.image_url || null,

    // Pricing - use base_price or price
    price: group.base_price || group.price,
    compare_at_price: group.compare_price || group.compare_at_price || null,
    cost_per_item: group.cost_per_item || null,

    // Inventory (product-level defaults)
    stock_quantity: group.stock_quantity,
    track_inventory: true,
    allow_backorders: group.allow_backorder || false,
    low_stock_threshold: group.low_stock_threshold || 10,

    // SEO
    meta_title: group.meta_title || null,
    meta_description: group.meta_description || null,

    // Other
    tags: group.tags || [],

    // Specifications (attributes)
    specifications: group.attributes && typeof group.attributes === 'object'
      ? Object.entries(group.attributes).map(([key, value]) => ({
        key,
        value
      }))
      : []
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

  // Check if this was an update or insert
  const isUpdate = await supabase
    .from('products')
    .select('id')
    .eq('slug', group.slug)
    .single()
    .then((res: any) => res.data !== null)

  if (isUpdate) {
    result.productsUpdated++
  } else {
    result.productsCreated++
  }

  const productId = product.id

  // Delete existing junction table entries before creating new ones
  await Promise.all([
    supabase.from('product_categories').delete().eq('product_id', productId),
    supabase.from('product_types').delete().eq('product_id', productId),
    supabase.from('product_collections').delete().eq('product_id', productId)
  ])

  // Create junction table entries for classifications
  await createJunctionTableEntries(supabase, productId, group)

  // Delete existing variants before creating new ones (for updates)
  await supabase.from('product_variants').delete().eq('product_id', productId)

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
  group: ProductGroup
): Promise<void> {
  // Applications (stored in product_categories with type='application')
  if (group.application_ids?.length > 0) {
    const applicationEntries = group.application_ids.map((categoryId, index) => ({
      product_id: productId,
      category_id: categoryId,
      is_primary: index === 0, // First one is primary
      position: index
    }))

    const { error } = await supabase
      .from('product_categories')
      .insert(applicationEntries)

    if (error) {
      console.error('Error creating application assignments:', error)
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
    }
  }

  // Subcategories
  if (group.subcategory_ids?.length > 0) {
    const subcategoryEntries = group.subcategory_ids.map((categoryId, index) => ({
      product_id: productId,
      category_id: categoryId,
      is_primary: index === 0,
      position: index
    }))

    const { error } = await supabase
      .from('product_categories')
      .insert(subcategoryEntries)

    if (error) {
      console.error('Error creating subcategory assignments:', error)
    }
  }

  // Elevator Types
  if (group.type_ids?.length > 0) {
    const typeEntries = group.type_ids.map(typeId => ({
      product_id: productId,
      elevator_type_id: typeId
    }))

    const { error } = await supabase
      .from('product_types')
      .insert(typeEntries)

    if (error) {
      console.error('Error creating type assignments:', error)
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
  const variantData = {
    product_id: productId,
    name: variant.title,
    sku: variant.sku,

    // Pricing - use variant price if available, otherwise product price
    price: variant.price || group.base_price || group.price,
    compare_at_price: variant.compare_at_price || group.compare_price || group.compare_at_price || null,
    cost_per_item: group.cost_per_item || null,

    // Inventory
    inventory_quantity: variant.stock || 0,

    // Options
    option1_name: variant.option1_name || null,
    option1_value: variant.option1_value || null,
    option2_name: variant.option2_name || null,
    option2_value: variant.option2_value || null,

    // Image (inherit from product if not specified)
    image_url: group.image_url || null,

    // Status (must be 'active' or 'inactive')
    status: group.status === 'active' ? 'active' : 'inactive'
  }

  const { error } = await supabase
    .from('product_variants')
    .insert(variantData)

  if (error) {
    throw new Error(`Failed to create variant: ${error.message}`)
  }
}
