/**
 * Sales Analytics API Route
 * Returns sales metrics and trends
 */

import { NextRequest, NextResponse } from 'next/server'
import { calculateSalesMetrics, getRevenueTrends } from '@/lib/analytics/calculations'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const period = searchParams.get('period') as 'daily' | 'weekly' | 'monthly'

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    const [metrics, trends] = await Promise.all([
      calculateSalesMetrics(start, end),
      period ? getRevenueTrends(period, start, end) : Promise.resolve([]),
    ])

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        trends,
      },
    })
  } catch (error: any) {
    console.error('Sales analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sales analytics', details: error.message },
      { status: 500 }
    )
  }
}

