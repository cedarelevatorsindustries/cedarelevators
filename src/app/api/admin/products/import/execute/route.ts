import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { ProductGroup, ImportResult, ImportError } from '@/types/csv-import.types'
import { generateProductSKU, generateVariantSKU } from '@/lib/utils/sku-generator'
import { generateSlug, generateMetaTitle, generateMetaDescription } from '@/lib/utils/seo-generator'

/**
 * POST /api/admin/products/import/execute
 * Executes bulk import of products and variants
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const supabase = createServerSupabaseClient()

  if (!supabase) {
    return NextResponse.json(
      { success: false, error: 'Failed to create Supabase client' },
      { status: 500 }
    )
  }

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
      variantsUpdated: 0,
      failed: 0,
      errors: []
    }

    // Process each product group
    for (const group of productGroups as ProductGroup[]) {
      try {
        await importProductGroup(supabase, group, result)
      } catch (error) {
        console.error(`Error importing product ${group.title}:`, error)
        result.failed++
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
 * Imports a single product group with its variants
 */
async function importProductGroup(
  supabase: any,
  group: ProductGroup,
  result: ImportResult
): Promise<void> {
  // Generate product SKU
  const categoryName = group.category_slug || 'GENERAL'
  const productSKU = await generateProductSKU(categoryName)

  // Generate SEO metadata
  const slug = generateSlug(group.title)
  const metaTitle = generateMetaTitle(group.title)
  const metaDescription = generateMetaDescription(
    group.title,
    group.application_id ? 'elevator' : undefined,
    group.elevator_type_slugs
  )

  // Prepare product data
  const productData = {
    name: group.title,
    slug,
    sku: productSKU,
    description: group.description || group.short_description,
    short_description: group.short_description,
    status: group.status,
    price: group.price,
    compare_at_price: group.compare_at_price,
    stock_quantity: group.stock_quantity,
    track_inventory: group.track_inventory,

    // Catalog relationships (can be null if not found)
    application_id: group.application_id || null,
    category_id: group.category_id || null,
    subcategory_id: group.subcategory_id || null,
    is_categorized: !!(group.application_id && group.category_id),

    // SEO
    meta_title: metaTitle,
    meta_description: metaDescription,

    // Images (placeholder)
    thumbnail: '/images/product-placeholder.png',
    images: [
      {
        id: '1',
        url: '/images/product-placeholder.png',
        alt: group.title,
        is_primary: true,
        sort_order: 0
      }
    ],

    // Defaults
    is_featured: false,
    view_count: 0,
    dimensions: { unit: 'cm' },
    specifications: group.variants[0]?.attributes ?
      Object.entries(group.variants[0].attributes).map(([key, value]) => ({
        key,
        value: String(value)
      })) : []
  }

  // Insert product
  const { data: product, error: productError } = await supabase
    .from('products')
    .insert(productData)
    .select()
    .single()

  if (productError) {
    throw new Error(`Failed to create product: ${productError.message}`)
  }

  result.productsCreated++

  // Insert variants
  for (const variant of group.variants) {
    try {
      const variantSKU = generateVariantSKU(
        productSKU,
        variant.option1_value,
        variant.option2_value
      )

      const variantData = {
        product_id: product.id,
        name: variant.title,
        sku: variantSKU,
        price: variant.price,
        compare_at_price: variant.compare_at_price,
        inventory_quantity: variant.stock,
        status: 'active',
        option1_name: variant.option1_name || null,
        option1_value: variant.option1_value || null,
        option2_name: variant.option2_name || null,
        option2_value: variant.option2_value || null,
        image_url: '/images/product-placeholder.png'
      }

      const { error: variantError } = await supabase
        .from('product_variants')
        .insert(variantData)

      if (variantError) {
        throw new Error(`Failed to create variant ${variantSKU}: ${variantError.message}`)
      }

      result.variantsCreated++

    } catch (error) {
      result.errors!.push({
        productTitle: group.title,
        variantSku: variant.sku,
        message: error instanceof Error ? error.message : 'Failed to create variant'
      })
    }
  }

  // Create elevator types relationships
  if (group.elevator_type_ids && group.elevator_type_ids.length > 0) {
    const elevatorTypeRelations = group.elevator_type_ids.map(typeId => ({
      product_id: product.id,
      elevator_type_id: typeId
    }))

    await supabase
      .from('product_elevator_types')
      .insert(elevatorTypeRelations)
  }

  // Create collections relationships
  if (group.collection_ids && group.collection_ids.length > 0) {
    const collectionRelations = group.collection_ids.map((collectionId, idx) => ({
      product_id: product.id,
      collection_id: collectionId,
      position: idx
    }))

    await supabase
      .from('collection_products')
      .insert(collectionRelations)
  }
}
