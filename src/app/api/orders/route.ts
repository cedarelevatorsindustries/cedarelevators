import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createOrderFromCart, getUserOrders } from '@/lib/actions/order-creation'

/**
 * GET /api/orders - Get user's orders
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined

    const result = await getUserOrders(userId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      orders: result.orders
    })

  } catch (error: any) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/orders - Create new order from cart
 */
export async function POST(request: NextRequest) {
  // Phase 1 Scope: Online order placement is deferred in favor of quotation requests
  return NextResponse.json(
    {
      success: false,
      error: 'Online order placement is deferred in Phase 1. Please submit a quotation request via /quotes/new.'
    },
    { status: 403 }
  )
}

