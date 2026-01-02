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
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      cartId,
      shippingAddress,
      billingAddress,
      paymentMethod,
      notes
    } = body

    // Validate required fields
    if (!cartId || !shippingAddress || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields: cartId, shippingAddress, paymentMethod' },
        { status: 400 }
      )
    }

    // Validate shipping address
    const requiredAddressFields = ['name', 'address_line1', 'city', 'state', 'postal_code', 'country', 'phone']
    for (const field of requiredAddressFields) {
      if (!shippingAddress[field]) {
        return NextResponse.json(
          { error: `Missing required shipping address field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Create order
    const result = await createOrderFromCart({
      cartId,
      shippingAddress,
      billingAddress,
      paymentMethod,
      notes
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      order: result.order,
      razorpayOrderId: result.razorpayOrderId
    })

  } catch (error: any) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    )
  }
}
