import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { hasRole } from '@/lib/auth/admin-roles'
import {
  getElevatorTypes,
  createElevatorType,
} from '@/lib/actions/elevator-types'

/**
 * GET /api/admin/elevator-types - Fetch all elevator types with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin()
    if (!adminCheck.authorized) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const is_active = searchParams.get('is_active')
      ? searchParams.get('is_active') === 'true'
      : undefined

    const result = await getElevatorTypes()

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
    const adminCheck = await requireAdmin()
    if (!adminCheck.authorized) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
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



