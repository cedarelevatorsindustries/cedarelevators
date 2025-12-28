/**
 * Product Export API Route
 * Handles bulk product export to CSV/Excel
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { exportToCSV, exportToExcel } from '@/lib/admin/bulk-export'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Check if user is admin

    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'csv'
    const category = searchParams.get('category')
    const status = searchParams.get('status')

    // Fetch products from database
    const supabase = await createServerSupabase()
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: products, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform products for export
    const exportData = products.map(product => ({
      Name: product.name,
      Slug: product.slug,
      Description: product.description || '',
      'Short Description': product.short_description || '',
      Category: product.category || '',
      Price: product.price,
      'Compare At Price': product.compare_at_price || '',
      'Stock Quantity': product.stock_quantity,
      SKU: product.sku,
      Weight: product.weight || '',
      Tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
      Featured: product.is_featured ? 'Yes' : 'No',
      Status: product.status,
      'Created At': product.created_at,
    }))

    // Generate file
    const blob =
      format === 'xlsx'
        ? exportToExcel(exportData, 'products', 'Products')
        : exportToCSV(exportData, 'products')

    const filename = `products-export-${new Date().toISOString().split('T')[0]}.${format}`

    return new NextResponse(blob, {
      headers: {
        'Content-Type':
          format === 'xlsx'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    console.error('Product export error:', error)
    return NextResponse.json(
      { error: error.message || 'Export failed' },
      { status: 500 }
    )
  }
}
