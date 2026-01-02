/**
 * Report Generation API Route
 * Generates and downloads custom reports
 */

import { NextRequest, NextResponse } from 'next/server'
import { generatePDFReport, generateExcelReport } from '@/lib/reports/generator'
import { calculateSalesMetrics, calculateProductMetrics, calculateCustomerMetrics } from '@/lib/analytics/calculations'

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

    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30))
    const end = endDate ? new Date(endDate) : new Date()

    let reportData: Record<string, any>
    let reportTitle: string

    // Generate report data based on type
    switch (type) {
      case 'sales': {
        const metrics = await calculateSalesMetrics(start, end)
        reportTitle = 'Sales Report'
        reportData = {
          'Report Type': 'Sales Summary',
          'Date Range': `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
          'Total Revenue': `₹${metrics.totalRevenue.toLocaleString()}`,
          'Total Orders': metrics.totalOrders,
          'Average Order Value': `₹${metrics.averageOrderValue.toFixed(2)}`,
          'Revenue Change': `${metrics.revenueChange.toFixed(2)}%`,
          'Orders Change': `${metrics.ordersChange.toFixed(2)}%`,
        }
        break
      }

      case 'inventory': {
        const metrics = await calculateProductMetrics()
        reportTitle = 'Inventory Report'
        reportData = {
          'Report Type': 'Inventory Status',
          'Generated On': new Date().toLocaleString(),
          'Total Products': metrics.totalProducts,
          'Active Products': metrics.activeProducts,
          'Low Stock Products': metrics.lowStockProducts,
          'Out of Stock Products': metrics.outOfStockProducts,
        }
        break
      }

      case 'customer': {
        const metrics = await calculateCustomerMetrics(start, end)
        reportTitle = 'Customer Report'
        reportData = {
          'Report Type': 'Customer Analytics',
          'Date Range': `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
          'Total Customers': metrics.totalCustomers,
          'New Customers': metrics.newCustomers,
          'Repeat Customers': metrics.repeatCustomers,
          'Retention Rate': `${metrics.customerRetentionRate.toFixed(2)}%`,
          'Business Customers': metrics.businessVsIndividual.business,
          'Individual Customers': metrics.businessVsIndividual.individual,
        }
        break
      }

      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        )
    }

    // Generate the file
    let result
    if (format === 'pdf') {
      result = generatePDFReport(reportTitle, reportData)
    } else {
      result = generateExcelReport(reportTitle, [reportData])
    }

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: 'Report generation failed' },
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
