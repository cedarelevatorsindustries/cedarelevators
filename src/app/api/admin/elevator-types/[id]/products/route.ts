import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { hasRole } from '@/lib/auth/admin-roles'
import { getProductsByElevatorType } from '@/lib/actions/elevator-types'

/**
 * GET /api/admin/elevator-types/[id]/products - Get all products assigned to this elevator type
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Elevator type ID is required' }, { status: 400 })
    }

    const result = await getProductsByElevatorType(id)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      products: result.products || [],
      count: result.products?.length || 0,
    })
  } catch (error: any) {
    console.error('Error fetching products by elevator type:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
