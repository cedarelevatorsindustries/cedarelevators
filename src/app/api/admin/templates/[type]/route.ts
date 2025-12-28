/**
 * CSV Import Template API Route
 * Serves downloadable CSV templates
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateProductImportTemplate, generateCategoryImportTemplate } from '@/lib/admin/bulk-export'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params

  try {
    let csvContent: string

    switch (type) {
      case 'products':
        csvContent = generateProductImportTemplate()
        break
      case 'categories':
        csvContent = generateCategoryImportTemplate()
        break
      default:
        return NextResponse.json(
          { error: 'Invalid template type' },
          { status: 400 }
        )
    }

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${type}-template.csv"`,
      },
    })
  } catch (error: any) {
    console.error('Template download error:', error)
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    )
  }
}
