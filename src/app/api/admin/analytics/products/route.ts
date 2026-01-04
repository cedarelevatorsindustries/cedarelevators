/**
 * Products Analytics API Route
 * Returns product performance metrics
 */

import { NextRequest, NextResponse } from 'next/server'
import { calculateProductMetrics } from '@/lib/analytics/calculations'

export async function GET(request: NextRequest) {
  try {
    const metrics = await calculateProductMetrics()

    return NextResponse.json({
      success: true,
      data: metrics,
    })
  } catch (error: any) {
    console.error('Product analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product analytics', details: error.message },
      { status: 500 }
    )
  }
}

