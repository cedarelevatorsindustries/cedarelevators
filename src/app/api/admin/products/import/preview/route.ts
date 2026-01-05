import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'
import type {
  CSVRow,
  PreviewResult,
  ProductGroup,
  ValidationError,
  ProductVariant,
  PreviewSummary
} from '@/lib/types/csv-import'
import {
  buildCatalogLookupMaps,
  normalizeCSVRow,
  resolveCatalogNames,
  parseBoolean
} from '@/lib/utils/csv-import-utils'
import { generateSKU } from '@/lib/actions/sku-generator'

/**
 * POST /api/admin/products/import/preview
 * Validates CSV (name-based) and returns preview of products to be imported
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Read file content
    const fileContent = await file.text()

    // Parse CSV
    const parseResult = Papa.parse<CSVRow>(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim()
    })

    if (parseResult.errors.length > 0) {
      return NextResponse.json({
        success: false,
        blockingErrors: parseResult.errors.map((err, idx) => ({
          row: err.row || idx + 2,
          field: 'csv',
          message: err.message,
          severity: 'error' as const
        })),
        warnings: [],
        totalProducts: 0,
        totalVariants: 0,
        productGroups: []
      })
    }

    const rows = parseResult.data

    // Validate CSV version and structure
    const structuralErrors = validateStructure(rows)
    if (structuralErrors.length > 0) {
      return NextResponse.json({
        success: false,
        blockingErrors: structuralErrors,
        warnings: [],
        totalProducts: 0,
        totalVariants: 0,
        productGroups: []
      })
    }

    // Build catalog lookup maps (ONE-TIME for entire import)
    const catalogMaps = await buildCatalogLookupMaps()

    // Group rows by title and validate
    const productGroups = await groupAndValidateProducts(rows, catalogMaps)

    // Separate blocking errors and warnings
    const allBlockingErrors: ValidationError[] = []
    const allWarnings: ValidationError[] = []

    productGroups.forEach(group => {
      // Extract errors from product groups (if we added them during validation)
      // For now, we'll collect them from variants
    })

    // Calculate summary
    const summary: PreviewSummary = {
      productsToCreate: productGroups.length,
      variantsToCreate: productGroups.reduce((sum, g) => sum + g.variants.length, 0),
      applicationsAssigned: productGroups.filter(g => g.application_ids.length > 0).length,
      categoriesAssigned: productGroups.filter(g => g.category_ids.length > 0).length,
      subcategoriesAssigned: productGroups.filter(g => g.subcategory_ids.length > 0).length,
      typesAssigned: productGroups.filter(g => g.type_ids.length > 0).length,
      collectionsAssigned: productGroups.filter(g => g.collection_ids.length > 0).length,
      drafts: productGroups.filter(g => g.status === 'draft').length,
      active: productGroups.filter(g => g.status === 'active').length
    }

    const result: PreviewResult = {
      success: allBlockingErrors.length === 0,
      totalProducts: productGroups.length,
      totalVariants: summary.variantsToCreate,
      productGroups,
      blockingErrors: allBlockingErrors,
      warnings: allWarnings,
      summary
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error previewing CSV:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process CSV file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Validates CSV structure and required fields
 */
function validateStructure(rows: CSVRow[]): ValidationError[] {
  const errors: ValidationError[] = []

  if (rows.length === 0) {
    errors.push({
      row: 0,
      field: 'csv',
      message: 'CSV file is empty',
      severity: 'error'
    })
    return errors
  }

  // Check required columns exist
  const requiredColumns = [
    'title',
    'description',
    'base_price',
    'stock_quantity'
  ]

  const firstRow = rows[0]
  const missingColumns = requiredColumns.filter(col => !(col in firstRow))

  if (missingColumns.length > 0) {
    errors.push({
      row: 1,
      field: 'csv',
      message: `Missing required columns: ${missingColumns.join(', ')}. Please download the latest template.`,
      severity: 'error',
      code: 'MISSING_COLUMNS'
    })
  }

  return errors
}

/**
 * Groups rows by product title and validates each group
 */
async function groupAndValidateProducts(
  rows: CSVRow[],
  catalogMaps: Awaited<ReturnType<typeof buildCatalogLookupMaps>>
): Promise<ProductGroup[]> {
  const groupMap = new Map<string, CSVRow[]>()

  // Group by title (not product_title)
  rows.forEach(row => {
    const key = row.title?.trim() || ''
    if (key) {
      if (!groupMap.has(key)) {
        groupMap.set(key, [])
      }
      groupMap.get(key)!.push(row)
    }
  })

  // Process each group
  const productGroups: ProductGroup[] = []

  for (const [title, groupRows] of groupMap.entries()) {
    const group = await validateProductGroup(title, groupRows, catalogMaps)
    productGroups.push(group)
  }

  return productGroups
}

/**
 * Validates a single product group and resolves catalog names
 */
async function validateProductGroup(
  title: string,
  rows: CSVRow[],
  catalogMaps: Awaited<ReturnType<typeof buildCatalogLookupMaps>>
): Promise<ProductGroup> {
  // Use first row as product-level data
  const firstRow = normalizeCSVRow(rows[0])

  // Resolve catalog names to IDs
  const applicationsResolution = resolveCatalogNames(
    firstRow._normalized.applications,
    catalogMaps.applications,
    'application'
  )
  const categoriesResolution = resolveCatalogNames(
    firstRow._normalized.categories,
    catalogMaps.categories,
    'category'
  )
  const subcategoriesResolution = resolveCatalogNames(
    firstRow._normalized.subcategories,
    catalogMaps.subcategories,
    'subcategory'
  )
  const typesResolution = resolveCatalogNames(
    firstRow._normalized.types,
    catalogMaps.types,
    'type'
  )
  const collectionsResolution = resolveCatalogNames(
    firstRow._normalized.collections,
    catalogMaps.collections,
    'collection'
  )

  // Determine if product should be draft
  const hasMissingClassifications =
    applicationsResolution.missing.length > 0 ||
    categoriesResolution.missing.length > 0 ||
    subcategoriesResolution.missing.length > 0 ||
    typesResolution.missing.length > 0

  const status = hasMissingClassifications || firstRow.status === 'draft'
    ? 'draft'
    : (firstRow.status as 'draft' | 'active' | 'archived' || 'active')

  // Build variants
  const variants: ProductVariant[] = rows.map((row, idx) => {
    const normalizedRow = normalizeCSVRow(row)

    return {
      title: row.variant_title || `Variant ${idx + 1}`,
      price: parseFloat(row.variant_price || row.base_price || '0'),
      stock: parseInt(row.variant_stock || row.stock_quantity || '0'),
      sku: `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Generate unique SKU
      option1_name: row.variant_option_1,
      option1_value: row.variant_option_1_value,
      option2_name: row.variant_option_2,
      option2_value: row.variant_option_2_value
    }
  })

  // Generate SEO metadata
  const metaTitle = firstRow.short_description || firstRow.title.substring(0, 60)
  const metaDescription = firstRow.description.substring(0, 160)
  const slug = firstRow.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const productGroup: ProductGroup = {
    title: firstRow.title,
    description: firstRow.description,
    short_description: firstRow.short_description || '',
    status,
    image_url: firstRow.image,
    tags: firstRow._normalized.tags,
    base_price: parseFloat(firstRow.base_price),
    compare_price: firstRow.compare_price ? parseFloat(firstRow.compare_price) : undefined,
    cost_per_item: firstRow.cost_per_item ? parseFloat(firstRow.cost_per_item) : undefined,
    stock_quantity: parseInt(firstRow.stock_quantity),
    low_stock_threshold: parseInt(firstRow.low_stock_threshold || '5'),
    allow_backorder: parseBoolean(firstRow.allow_backorder, false),
    application_ids: applicationsResolution.ids,
    category_ids: categoriesResolution.ids,
    subcategory_ids: subcategoriesResolution.ids,
    type_ids: typesResolution.ids,
    collection_ids: collectionsResolution.ids,
    attributes: firstRow._normalized.attributes,
    variants,
    sku: `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Generate product SKU
    meta_title: metaTitle,
    meta_description: metaDescription,
    slug
  }

  return productGroup
}
