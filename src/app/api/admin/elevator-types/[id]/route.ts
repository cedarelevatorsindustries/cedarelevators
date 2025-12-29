import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { hasRole } from '@/lib/auth/admin-roles'
import {
  fetchElevatorTypeById,
  updateElevatorType,
  deleteElevatorType,
} from '@/lib/actions/elevator-types'

/**
 * GET /api/admin/elevator-types/[id] - Get single elevator type by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'Elevator type ID is required' }, { status: 400 })
    }

    const result = await fetchElevatorTypeById(id)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      elevatorType: result.elevatorType,
    })
  } catch (error: any) {
    console.error('Error fetching elevator type:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch elevator type' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/elevator-types/[id] - Update elevator type
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role - only managers and above can update
    const isAuthorized = await hasRole('manager')
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Forbidden - Manager access required' },
        { status: 403 }
      )
    }

    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'Elevator type ID is required' }, { status: 400 })
    }

    const updates = await request.json()

    const result = await updateElevatorType(id, updates)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      elevatorType: result.elevatorType,
    })
  } catch (error: any) {
    console.error('Error updating elevator type:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update elevator type' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/elevator-types/[id] - Delete elevator type
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role - only managers and above can delete
    const isAuthorized = await hasRole('manager')
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Forbidden - Manager access required' },
        { status: 403 }
      )
    }

    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'Elevator type ID is required' }, { status: 400 })
    }

    const result = await deleteElevatorType(id)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Elevator type deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting elevator type:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete elevator type' },
      { status: 500 }
    )
  }
}
