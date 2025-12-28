/**
 * Report Generation API Route
 * Generates and downloads custom reports
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateSalesReport, generateInventoryReport, generateCustomerReport } from '@/lib/reports/generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, format, startDate, endDate } = body

    if (!type || !format) {
      return NextResponse.json(
        { error: 'Report type and format are required' },
        { status: 400 }
      )
    }

    const config = {
      type,
      format,
      dateRange: {
        start: startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30)),
        end: endDate ? new Date(endDate) : new Date(),
      },
    }

    let result

    switch (type) {
      case 'sales':
        result = await generateSalesReport(config)
        break
      case 'inventory':
        result = await generateInventoryReport(config)
        break
      case 'customer':
        result = await generateCustomerReport(config)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        )
    }

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: result.error || 'Report generation failed' },
        { status: 500 }
      )
    }

    const contentType = format === 'pdf'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

    const filename = `${type}-report-${Date.now()}.${format}`

    return new NextResponse(result.data, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    console.error('Report generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate report', details: error.message },
      { status: 500 }
    )
  }
}
