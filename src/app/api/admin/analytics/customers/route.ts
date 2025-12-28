/**
 * Customer Analytics API Route
 * Returns customer metrics and insights
 */

import { NextRequest, NextResponse } from 'next/server'
import { calculateCustomerMetrics } from '@/lib/analytics/calculations'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    const metrics = await calculateCustomerMetrics(start, end)

    return NextResponse.json({
      success: true,
      data: metrics,
    })
  } catch (error: any) {
    console.error('Customer analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer analytics', details: error.message },
      { status: 500 }
    )
  }
}
