import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { hasRole } from '@/lib/auth/admin-roles'
import {
  fetchElevatorTypes,
  createElevatorType,
  updateElevatorTypesOrder,
} from '@/lib/actions/elevator-types'

/**
 * GET /api/admin/elevator-types - Fetch all elevator types with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const isAuthorized = await hasRole('staff')
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const is_active = searchParams.get('is_active')
      ? searchParams.get('is_active') === 'true'
      : undefined

    const result = await fetchElevatorTypes({
      search,
      is_active,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      elevatorTypes: result.elevatorTypes,
    })
  } catch (error: any) {
    console.error('Error fetching elevator types:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch elevator types' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/elevator-types - Create new elevator type
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role - only managers and above can create
    const isAuthorized = await hasRole('manager')
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Forbidden - Manager access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const result = await createElevatorType(body)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      elevatorType: result.elevatorType,
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating elevator type:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create elevator type' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/elevator-types - Bulk update elevator types sort order
 */
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role - only managers and above can reorder
    const isAuthorized = await hasRole('manager')
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Forbidden - Manager access required' },
        { status: 403 }
      )
    }

    const { updates } = await request.json()

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'Updates array is required' },
        { status: 400 }
      )
    }

    const result = await updateElevatorTypesOrder(updates)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Updated sort order for ${updates.length} elevator types`,
    })
  } catch (error: any) {
    console.error('Error updating elevator types order:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update elevator types order' },
      { status: 500 }
    )
  }
}

