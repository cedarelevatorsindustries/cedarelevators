import { NextRequest, NextResponse } from 'next/server'
import type { ProductGroup, ProductVariant, ValidationError, PreviewResult } from '@/types/csv-import.types'
import { buildCatalogLookupMaps, normalizeName, parseCommaSeparated, parseAttributes, parseBoolean, resolveCatalogNames } from '@/lib/utils/csv-import-utils'

// Extended CSVRow type for parsing
interface CSVRow {
  title: string
  description: string
  short_description?: string
  image?: string
  base_price: string
  compare_price?: string
  cost_per_item?: string
  stock_quantity: string
  low_stock_threshold?: string
  allow_backorder?: string
  applications?: string
  categories?: string
  subcategories?: string
  types?: string
  collections?: string
  attributes?: string
  tags?: string
  variant_title?: string
  variant_option_1?: string
  variant_option_1_value?: string
  variant_option_2?: string
  variant_option_2_value?: string
  variant_price?: string
  variant_stock?: string
  status?: string
}

/**
 * POST /api/admin/products/import/preview
 * Validates CSV (name-based) and returns preview of products to be imported
 */
export async function POST(request: NextRequest) {
  console.log('==========================================')
  console.log('[CSV Preview API] POST request received')
  console.log('==========================================')

  try {
    // Parse formData
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'No file provided',
          blockingErrors: [],
          warnings: [],
          productGroups: [],
          totalProducts: 0,
          totalVariants: 0
        },
        { status: 400 }
      )
    }

    console.log('[CSV Preview API] File received:', file.name, file.size, 'bytes')

    // Read file content as text
    const fileContent = await file.text()
    console.log('[CSV Preview API] File content length:', fileContent.length)

    // Parse CSV
    const rows = parseCSVContent(fileContent)
    console.log('[CSV Preview API] Parsed rows:', rows.length)

    if (rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No data rows found in CSV',
        blockingErrors: [{ row: 0, field: 'file', message: 'No data rows found in CSV', severity: 'error' as const }],
        warnings: [],
        productGroups: [],
        totalProducts: 0,
        totalVariants: 0
      })
    }

    // Build catalog lookup maps
    console.log('[CSV Preview API] Building catalog lookup maps...')
    const catalogMaps = await buildCatalogLookupMaps()
    console.log('[CSV Preview API] Catalog maps built')

    // Process rows and group by product title
    const { productGroups, blockingErrors, warnings } = processCSVRows(rows, catalogMaps)
    console.log('[CSV Preview API] Processed product groups:', productGroups.length)
    console.log('[CSV Preview API] Blocking errors:', blockingErrors.length)
    console.log('[CSV Preview API] Warnings:', warnings.length)

    // Calculate totals
    const totalProducts = productGroups.length
    const totalVariants = productGroups.reduce((sum, group) => sum + group.variants.length, 0)

    const result: PreviewResult = {
      success: blockingErrors.length === 0,
      productGroups,
      blockingErrors,
      warnings,
      totalProducts,
      totalVariants
    }

    console.log('[CSV Preview API] Returning preview result')
    return NextResponse.json(result)

  } catch (error) {
    console.error('[CSV Preview API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error',
        blockingErrors: [{ row: 0, field: 'file', message: error instanceof Error ? error.message : 'Unknown error', severity: 'error' as const }],
        warnings: [],
        productGroups: [],
        totalProducts: 0,
        totalVariants: 0
      },
      { status: 500 }
    )
  }
}

/**
 * Parse CSV content into rows
 */
function parseCSVContent(content: string): CSVRow[] {
  const lines = content.split(/\r?\n/).filter(line => line.trim())
  if (lines.length < 2) return []

  const headerLine = lines[0]
  const headers = parseCSVLine(headerLine)
  console.log('[CSV Preview API] Headers:', headers)

  const rows: CSVRow[] = []

  // Handle multiline values (values with line breaks inside quotes)
  let currentRowLines: string[] = []
  let inQuotedField = false

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    currentRowLines.push(line)

    // Count quotes to determine if we're in a quoted field
    const quoteCount = (currentRowLines.join('\n').match(/"/g) || []).length
    inQuotedField = quoteCount % 2 !== 0

    if (!inQuotedField) {
      // We have a complete row
      const fullLine = currentRowLines.join('\n')
      const values = parseCSVLine(fullLine)

      if (values.length > 0 && values.some(v => v.trim())) {
        const row: CSVRow = {} as CSVRow
        headers.forEach((header, index) => {
          (row as any)[header.trim()] = values[index]?.trim() || ''
        })
        rows.push(row)
      }

      currentRowLines = []
    }
  }

  return rows
}

/**
 * Parse a single CSV line, handling quoted values with commas
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"' && !inQuotes) {
      inQuotes = true
    } else if (char === '"' && inQuotes) {
      if (nextChar === '"') {
        // Escaped quote
        current += '"'
        i++
      } else {
        inQuotes = false
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current)
      current = ''
    } else {
      current += char
    }
  }
  values.push(current)

  return values
}

/**
 * Process CSV rows into product groups
 */
function processCSVRows(
  rows: CSVRow[],
  catalogMaps: Awaited<ReturnType<typeof buildCatalogLookupMaps>>
): { productGroups: ProductGroup[], blockingErrors: ValidationError[], warnings: ValidationError[] } {
  const productMap = new Map<string, ProductGroup>()
  const blockingErrors: ValidationError[] = []
  const warnings: ValidationError[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNum = i + 2 // +2 for header row + 1-indexing

    // Validate required fields
    if (!row.title || row.title.trim() === '') {
      blockingErrors.push({
        row: rowNum,
        field: 'title',
        message: 'Product title is required',
        severity: 'error'
      })
      continue
    }

    const title = row.title.trim()
    const normalizedTitle = normalizeName(title)

    // Parse pricing
    const basePrice = parseFloat(row.base_price) || 0
    const comparePrice = row.compare_price ? parseFloat(row.compare_price) : undefined

    // Validate price
    if (basePrice <= 0) {
      blockingErrors.push({
        row: rowNum,
        field: 'base_price',
        message: `Invalid base price: ${row.base_price}`,
        severity: 'error'
      })
      continue
    }

    // Check if product already exists in our map (same title = same product with variants)
    let productGroup = productMap.get(normalizedTitle)

    if (!productGroup) {
      // Resolve catalog names
      const applications = parseCommaSeparated(row.applications)
      const categories = parseCommaSeparated(row.categories)
      const subcategories = parseCommaSeparated(row.subcategories)
      const types = parseCommaSeparated(row.types)
      const collections = parseCommaSeparated(row.collections)

      // Resolve to IDs
      const appResult = resolveCatalogNames(applications, catalogMaps.applications, 'Application')
      const catResult = resolveCatalogNames(categories, catalogMaps.categories, 'Category')
      const subResult = resolveCatalogNames(subcategories, catalogMaps.subcategories, 'Subcategory')
      const typeResult = resolveCatalogNames(types, catalogMaps.types, 'Elevator Type')
      const collResult = resolveCatalogNames(collections, catalogMaps.collections, 'Collection')

      // Generate warnings for missing catalog entities
      for (const missing of appResult.missing) {
        warnings.push({ row: rowNum, field: 'applications', message: `Application not found: "${missing}"`, severity: 'warning' })
      }
      for (const missing of catResult.missing) {
        warnings.push({ row: rowNum, field: 'categories', message: `Category not found: "${missing}"`, severity: 'warning' })
      }
      for (const missing of subResult.missing) {
        warnings.push({ row: rowNum, field: 'subcategories', message: `Subcategory not found: "${missing}"`, severity: 'warning' })
      }
      for (const missing of typeResult.missing) {
        warnings.push({ row: rowNum, field: 'types', message: `Elevator type not found: "${missing}"`, severity: 'warning' })
      }
      for (const missing of collResult.missing) {
        warnings.push({ row: rowNum, field: 'collections', message: `Collection not found: "${missing}"`, severity: 'warning' })
      }

      // Determine status
      const hasBlockingWarnings = catResult.missing.length > 0 || appResult.missing.length > 0
      const status = hasBlockingWarnings ? 'draft' : (row.status === 'draft' ? 'draft' : 'active')

      // Get first category/application name for display (slug-like field)
      const firstCategory = categories[0] || ''
      const firstApplication = applications[0] || ''
      const firstSubcategory = subcategories[0] || ''

      // Create product group matching the expected interface
      productGroup = {
        // Product identification
        title,
        slug: generateSlug(title),

        // Product details
        description: row.description || '',
        short_description: row.short_description || '',
        status: status as 'draft' | 'active',

        // Pricing & Inventory
        price: basePrice,
        compare_at_price: comparePrice,
        track_inventory: true,
        stock_quantity: parseInt(row.stock_quantity) || 0,

        // Catalog relationships (slugs from CSV for display)
        application_slug: firstApplication,
        category_slug: firstCategory,
        subcategory_slug: firstSubcategory || undefined,
        elevator_type_slugs: types,
        collection_slugs: collections,

        // Resolved IDs (after validation)
        application_id: appResult.ids[0],
        category_id: catResult.ids[0],
        subcategory_id: subResult.ids[0],
        elevator_type_ids: typeResult.ids,
        collection_ids: collResult.ids,

        // Variants
        variants: [],

        // Validation results
        errors: [],
        warnings: []
      }

      productMap.set(normalizedTitle, productGroup)
    }

    // Add variant
    const variant: ProductVariant = {
      title: row.variant_title || 'Default',
      sku: generateSKU(title, row.variant_title),
      price: row.variant_price ? parseFloat(row.variant_price) : basePrice,
      compare_at_price: comparePrice,
      stock: row.variant_stock ? parseInt(row.variant_stock) : (parseInt(row.stock_quantity) || 0),
      option1_name: row.variant_option_1 || undefined,
      option1_value: row.variant_option_1_value || undefined,
      option2_name: row.variant_option_2 || undefined,
      option2_value: row.variant_option_2_value || undefined
    }

    productGroup.variants.push(variant)
  }

  return {
    productGroups: Array.from(productMap.values()),
    blockingErrors,
    warnings
  }
}

/**
 * Generate SKU from title
 */
function generateSKU(title: string, variantTitle?: string): string {
  const base = title
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 8)

  const suffix = variantTitle
    ? '-' + variantTitle.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4)
    : ''

  const random = Math.random().toString(36).substring(2, 6).toUpperCase()

  return `${base}${suffix}-${random}`
}

/**
 * Generate slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
