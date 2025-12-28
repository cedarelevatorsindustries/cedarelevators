/**
 * Bulk Import Utilities
 * Handles CSV/Excel import for products, categories, and other entities
 */

import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export interface ImportResult<T> {
  success: boolean
  data?: T[]
  errors?: ImportError[]
  totalRows: number
  successfulRows: number
  failedRows: number
}

export interface ImportError {
  row: number
  field?: string
  message: string
  data?: any
}

export interface ProductImportRow {
  name: string
  slug: string
  description?: string
  short_description?: string
  category?: string
  price: number
  compare_at_price?: number
  stock_quantity: number
  sku: string
  weight?: number
  tags?: string
  is_featured?: string
  status?: string
}

export interface CategoryImportRow {
  name: string
  slug: string
  description?: string
  parent_slug?: string
  sort_order?: number
  is_active?: string
}

/**
 * Parse CSV file
 */
export async function parseCSV<T>(
  file: File
): Promise<{ data: T[]; errors: ImportError[] }> {
  return new Promise((resolve) => {
    const errors: ImportError[] = []

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase().replace(/ /g, '_'),
      complete: (results) => {
        resolve({
          data: results.data as T[],
          errors: results.errors.map((err, idx) => ({
            row: idx + 1,
            message: err.message,
          })),
        })
      },
      error: (error) => {
        resolve({
          data: [],
          errors: [{ row: 0, message: error.message }],
        })
      },
    })
  })
}

/**
 * Parse Excel file
 */
export async function parseExcel<T>(
  file: File
): Promise<{ data: T[]; errors: ImportError[] }> {
  try {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json<T>(worksheet, {
      raw: false,
      defval: '',
    })

    return { data, errors: [] }
  } catch (error: any) {
    return {
      data: [],
      errors: [{ row: 0, message: error.message }],
    }
  }
}

/**
 * Validate product import row
 */
export function validateProductRow(
  row: ProductImportRow,
  rowNumber: number
): ImportError[] {
  const errors: ImportError[] = []

  // Required fields
  if (!row.name || row.name.trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'name',
      message: 'Product name is required',
      data: row,
    })
  }

  if (!row.slug || row.slug.trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'slug',
      message: 'Product slug is required',
      data: row,
    })
  }

  if (!row.sku || row.sku.trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'sku',
      message: 'Product SKU is required',
      data: row,
    })
  }

  // Validate price
  if (row.price === undefined || row.price === null) {
    errors.push({
      row: rowNumber,
      field: 'price',
      message: 'Product price is required',
      data: row,
    })
  } else if (isNaN(Number(row.price)) || Number(row.price) < 0) {
    errors.push({
      row: rowNumber,
      field: 'price',
      message: 'Invalid price value',
      data: row,
    })
  }

  // Validate stock quantity
  if (row.stock_quantity !== undefined) {
    if (isNaN(Number(row.stock_quantity)) || Number(row.stock_quantity) < 0) {
      errors.push({
        row: rowNumber,
        field: 'stock_quantity',
        message: 'Invalid stock quantity',
        data: row,
      })
    }
  }

  // Validate status
  if (row.status && !['draft', 'active', 'archived'].includes(row.status)) {
    errors.push({
      row: rowNumber,
      field: 'status',
      message: 'Status must be: draft, active, or archived',
      data: row,
    })
  }

  return errors
}

/**
 * Validate category import row
 */
export function validateCategoryRow(
  row: CategoryImportRow,
  rowNumber: number
): ImportError[] {
  const errors: ImportError[] = []

  if (!row.name || row.name.trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'name',
      message: 'Category name is required',
      data: row,
    })
  }

  if (!row.slug || row.slug.trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'slug',
      message: 'Category slug is required',
      data: row,
    })
  }

  return errors
}

/**
 * Transform product row for database insertion
 */
export function transformProductRow(row: ProductImportRow): any {
  return {
    name: row.name.trim(),
    slug: row.slug.trim(),
    description: row.description?.trim() || null,
    short_description: row.short_description?.trim() || null,
    category: row.category?.trim() || null,
    price: Number(row.price),
    compare_at_price: row.compare_at_price ? Number(row.compare_at_price) : null,
    stock_quantity: row.stock_quantity ? Number(row.stock_quantity) : 0,
    sku: row.sku.trim(),
    weight: row.weight ? Number(row.weight) : null,
    tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
    is_featured: row.is_featured === 'true' || row.is_featured === '1',
    status: row.status || 'draft',
  }
}

/**
 * Transform category row for database insertion
 */
export function transformCategoryRow(row: CategoryImportRow): any {
  return {
    name: row.name.trim(),
    slug: row.slug.trim(),
    description: row.description?.trim() || null,
    parent_slug: row.parent_slug?.trim() || null,
    sort_order: row.sort_order ? Number(row.sort_order) : 0,
    is_active: row.is_active !== 'false' && row.is_active !== '0',
  }
}

/**
 * Generate import report
 */
export function generateImportReport(
  result: ImportResult<any>
): string {
  const { totalRows, successfulRows, failedRows, errors } = result

  let report = `Import Summary:\n`
  report += `Total Rows: ${totalRows}\n`
  report += `Successful: ${successfulRows}\n`
  report += `Failed: ${failedRows}\n\n`

  if (errors && errors.length > 0) {
    report += `Errors:\n`
    errors.forEach(error => {
      report += `Row ${error.row}: ${error.field ? `[${error.field}] ` : ''}${error.message}\n`
    })
  }

  return report
}
