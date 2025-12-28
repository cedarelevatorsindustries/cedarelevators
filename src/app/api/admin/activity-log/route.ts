/**
 * Admin Activity Log API Route
 * Handles fetching and filtering activity logs
 */

import { NextRequest, NextResponse } from 'next/server'
import { getActivityLogs, getActivityStats } from '@/lib/admin/activity-log'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action')

    // Get statistics
    if (action === 'stats') {
      const days = parseInt(searchParams.get('days') || '30')
      const result = await getActivityStats(days)
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: result.stats,
      })
    }

    // Get logs with filters
    const adminId = searchParams.get('adminId') || undefined
    const resourceType = searchParams.get('resourceType') || undefined
    const actionType = searchParams.get('actionType') || undefined
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : undefined
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const result = await getActivityLogs({
      adminId,
      resourceType,
      action: actionType,
      startDate,
      endDate,
      limit,
      offset,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.logs,
      total: result.total,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error('Activity log API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity logs', details: error.message },
      { status: 500 }
    )
  }
}
