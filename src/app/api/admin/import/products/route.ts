/**
 * Product Import API Route
 * Handles bulk product import from CSV/Excel
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerSupabase } from '@/lib/supabase/server'
import {
  parseCSV,
  parseExcel,
  validateProductRow,
  transformProductRow,
  ProductImportRow,
  ImportResult,
  ImportError,
} from '@/lib/admin/bulk-import'
import { invalidateCache, INVALIDATION_PATTERNS } from '@/lib/middleware/cache'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Check if user is admin

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Parse file based on type
    let parsed: { data: ProductImportRow[]; errors: ImportError[] }

    if (file.name.endsWith('.csv')) {
      parsed = await parseCSV<ProductImportRow>(file)
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      parsed = await parseExcel<ProductImportRow>(file)
    } else {
      return NextResponse.json(
        { error: 'Invalid file format. Only CSV and Excel files are supported' },
        { status: 400 }
      )
    }

    const { data, errors: parseErrors } = parsed

    if (parseErrors.length > 0 && data.length === 0) {
      return NextResponse.json(
        {
          error: 'Failed to parse file',
          errors: parseErrors,
        },
        { status: 400 }
      )
    }

    // Validate and transform rows
    const validationErrors: ImportError[] = []
    const validRows: any[] = []

    data.forEach((row, index) => {
      const rowErrors = validateProductRow(row, index + 2) // +2 for header row
      if (rowErrors.length > 0) {
        validationErrors.push(...rowErrors)
      } else {
        validRows.push(transformProductRow(row))
      }
    })

    // Insert valid rows into database
    const supabase = await createServerSupabase()
    const insertErrors: ImportError[] = []
    let successCount = 0

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i]
      const { error } = await supabase.from('products').insert(row)

      if (error) {
        insertErrors.push({
          row: i + 2,
          message: error.message,
          data: row,
        })
      } else {
        successCount++
      }
    }

    // Invalidate product cache
    await invalidateCache(INVALIDATION_PATTERNS.PRODUCTS)

    const result: ImportResult<any> = {
      success: successCount > 0,
      totalRows: data.length,
      successfulRows: successCount,
      failedRows: validationErrors.length + insertErrors.length,
      errors: [...parseErrors, ...validationErrors, ...insertErrors],
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Product import error:', error)
    return NextResponse.json(
      { error: error.message || 'Import failed' },
      { status: 500 }
    )
  }
}
