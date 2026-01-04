import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'
import type {
  CSVRow,
  PreviewResult,
  ProductGroup,
  ValidationError,
  ProductVariant
} from '@/types/csv-import.types'
import { resolveCatalogReferences, shouldMarkAsDraft } from '@/lib/utils/catalog-assignment'
import { generateSlug } from '@/lib/utils/seo-generator'

/**
 * POST /api/admin/products/import/preview
 * Validates CSV and returns preview of products to be imported
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
        }))
      })
    }

    const rows = parseResult.data

    // Validate structure
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

    // Group rows by product_title
    const productGroups = await groupAndValidateProducts(rows)

    // Separate blocking errors and warnings
    const blockingErrors: ValidationError[] = []
    const warnings: ValidationError[] = []

    productGroups.forEach(group => {
      group.errors.forEach(err => {
        if (err.severity === 'error') {
          blockingErrors.push(err)
        } else {
          warnings.push(err)
        }
      })
      group.warnings.forEach(warn => warnings.push(warn))
    })

    const result: PreviewResult = {
      success: blockingErrors.length === 0,
      totalProducts: productGroups.length,
      totalVariants: productGroups.reduce((sum, g) => sum + g.variants.length, 0),
      productGroups,
      blockingErrors,
      warnings
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
    'product_title',
    'short_description',
    'application_slug',
    'category_slug',
    'product_price',
    'product_mrp'
  ]

  const firstRow = rows[0]
  const missingColumns = requiredColumns.filter(col => !(col in firstRow))

  if (missingColumns.length > 0) {
    errors.push({
      row: 1,
      field: 'csv',
      message: `Missing required columns: ${missingColumns.join(', ')}`,
      severity: 'error'
    })
  }

  return errors
}

/**
 * Groups rows by product and validates each group
 */
async function groupAndValidateProducts(rows: CSVRow[]): Promise<ProductGroup[]> {
  const groupMap = new Map<string, CSVRow[]>()

  // Group by product_title
  rows.forEach(row => {
    const key = row.product_title.trim()
    if (!groupMap.has(key)) {
      groupMap.set(key, [])
    }
    groupMap.get(key)!.push(row)
  })

  // Process each group
  const productGroups: ProductGroup[] = []

  let rowIndex = 2 // Start from row 2 (after header)
  for (const [title, groupRows] of groupMap.entries()) {
    const group = await validateProductGroup(title, groupRows, rowIndex)
    productGroups.push(group)
    rowIndex += groupRows.length
  }

  return productGroups
}

/**
 * Validates a single product group
 */
async function validateProductGroup(
  title: string,
  rows: CSVRow[],
  startRow: number
): Promise<ProductGroup> {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  // Use first row as product-level data
  const firstRow = rows[0]

  // Validate product-level fields
  if (!firstRow.product_title || firstRow.product_title.trim().length < 3) {
    errors.push({
      row: startRow,
      field: 'product_title',
      message: 'Product title must be at least 3 characters',
      severity: 'error'
    })
  }

  if (!firstRow.short_description || firstRow.short_description.trim().length < 10) {
    errors.push({
      row: startRow,
      field: 'short_description',
      message: 'Short description must be at least 10 characters',
      severity: 'error'
    })
  }

  if (!firstRow.application_slug || firstRow.application_slug.trim() === '') {
    errors.push({
      row: startRow,
      field: 'application_slug',
      message: 'Application slug is required',
      severity: 'error'
    })
  }

  if (!firstRow.category_slug || firstRow.category_slug.trim() === '') {
    errors.push({
      row: startRow,
      field: 'category_slug',
      message: 'Category slug is required',
      severity: 'error'
    })
  }

  // Validate pricing
  const productPrice = parseFloat(firstRow.product_price)
  if (isNaN(productPrice) || productPrice <= 0) {
    errors.push({
      row: startRow,
      field: 'product_price',
      message: 'Product price must be a positive number',
      severity: 'error'
    })
  }

  const productMRP = parseFloat(firstRow.product_mrp)
  if (isNaN(productMRP) || productMRP <= 0) {
    errors.push({
      row: startRow,
      field: 'product_mrp',
      message: 'Product MRP must be a positive number',
      severity: 'error'
    })
  }

  // Parse comma-separated fields
  const elevatorTypeSlugs = (firstRow.elevator_types || '')
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0)

  const collectionSlugs = (firstRow.collections || '')
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0)

  // Resolve catalog references (only if no blocking errors so far)
  let catalogLookup: {
    application_id: string | null
    category_id: string | null
    subcategory_id: string | null
    elevator_type_ids: string[]
    collection_ids: string[]
    errors: ValidationError[]
  } = {
    application_id: null,
    category_id: null,
    subcategory_id: null,
    elevator_type_ids: [] as string[],
    collection_ids: [] as string[],
    errors: [] as ValidationError[]
  }

  if (errors.length === 0) {
    catalogLookup = await resolveCatalogReferences(
      firstRow.application_slug.trim(),
      firstRow.category_slug.trim(),
      firstRow.subcategory_slug?.trim(),
      elevatorTypeSlugs,
      collectionSlugs,
      startRow
    )
    errors.push(...catalogLookup.errors)
  }

  // Process variants
  const variants: ProductVariant[] = []
  rows.forEach((row, idx) => {
    const variant = processVariantRow(row, productPrice, productMRP, parseFloat(firstRow.product_stock || '0'), startRow + idx, errors, warnings)
    variants.push(variant)
  })

  // Validate JSON in attributes
  rows.forEach((row, idx) => {
    if (row.attributes && row.attributes.trim() !== '') {
      try {
        JSON.parse(row.attributes)
      } catch (e) {
        errors.push({
          row: startRow + idx,
          field: 'attributes',
          message: 'Invalid JSON format in attributes field',
          severity: 'error'
        })
      }
    }
  })

  // Determine status
  let status: 'draft' | 'active' = 'draft'
  if (firstRow.status && firstRow.status.toLowerCase() === 'active') {
    status = 'active'
  }

  // If catalog assignment failed, force draft
  if (shouldMarkAsDraft(catalogLookup)) {
    status = 'draft'
    warnings.push({
      row: startRow,
      field: 'status',
      message: 'Product will be created as draft due to missing catalog references',
      severity: 'warning'
    })
  }

  return {
    title: firstRow.product_title.trim(),
    slug: generateSlug(firstRow.product_title.trim()),
    description: firstRow.brief_description?.trim(),
    short_description: firstRow.short_description.trim(),
    status,
    price: productPrice,
    compare_at_price: productMRP,
    track_inventory: firstRow.track_inventory !== 'false',
    stock_quantity: parseFloat(firstRow.product_stock || '0'),
    application_slug: firstRow.application_slug.trim(),
    category_slug: firstRow.category_slug.trim(),
    subcategory_slug: firstRow.subcategory_slug?.trim(),
    elevator_type_slugs: elevatorTypeSlugs,
    collection_slugs: collectionSlugs,
    application_id: catalogLookup.application_id || undefined,
    category_id: catalogLookup.category_id || undefined,
    subcategory_id: catalogLookup.subcategory_id || undefined,
    elevator_type_ids: catalogLookup.elevator_type_ids,
    collection_ids: catalogLookup.collection_ids,
    variants,
    errors,
    warnings
  }
}

/**
 * Processes a single variant row
 */
function processVariantRow(
  row: CSVRow,
  productPrice: number,
  productMRP: number,
  productStock: number,
  rowNumber: number,
  errors: ValidationError[],
  warnings: ValidationError[]
): ProductVariant {
  // Parse variant price with fallback
  let variantPrice = productPrice
  if (row.variant_price && row.variant_price.trim() !== '') {
    const parsed = parseFloat(row.variant_price)
    if (!isNaN(parsed)) {
      variantPrice = parsed
    } else {
      warnings.push({
        row: rowNumber,
        field: 'variant_price',
        message: 'Invalid variant price, using product price',
        severity: 'warning'
      })
    }
  }

  // Parse variant MRP with fallback
  let variantMRP = productMRP
  if (row.variant_mrp && row.variant_mrp.trim() !== '') {
    const parsed = parseFloat(row.variant_mrp)
    if (!isNaN(parsed)) {
      variantMRP = parsed
    } else {
      warnings.push({
        row: rowNumber,
        field: 'variant_mrp',
        message: 'Invalid variant MRP, using product MRP',
        severity: 'warning'
      })
    }
  }

  // Parse variant stock with fallback
  let variantStock = productStock
  if (row.variant_stock && row.variant_stock.trim() !== '') {
    const parsed = parseInt(row.variant_stock)
    if (!isNaN(parsed)) {
      variantStock = parsed
    } else {
      warnings.push({
        row: rowNumber,
        field: 'variant_stock',
        message: 'Invalid variant stock, using product stock',
        severity: 'warning'
      })
    }
  }

  // Parse attributes
  let attributes: Record<string, any> | undefined
  if (row.attributes && row.attributes.trim() !== '') {
    try {
      attributes = JSON.parse(row.attributes)
    } catch (e) {
      // Error already added in main validation
    }
  }

  return {
    title: row.variant_title?.trim() || 'Default',
    sku: '', // Will be generated during import
    price: variantPrice,
    compare_at_price: variantMRP,
    stock: variantStock,
    option1_name: row.variant_option_1_name?.trim(),
    option1_value: row.variant_option_1_value?.trim(),
    option2_name: row.variant_option_2_name?.trim(),
    option2_value: row.variant_option_2_value?.trim(),
    attributes
  }
}

