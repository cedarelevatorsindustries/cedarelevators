import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createRazorpayOrder } from '@/lib/services/razorpay'
import { createServerSupabase } from '@/lib/supabase/server'

/**
 * POST /api/payments/create-order
 * Create a Razorpay order for payment processing
 */
export async function POST(request: NextRequest) {
  console.log('💳 [Payment API] Create order request received')

  try {
    const { userId } = await auth()

    console.log('👤 [Payment API] User ID:', userId || 'Guest')

    // Parse request body
    const body = await request.json()
    const { orderId, amount } = body

    console.log('💵 [Payment API] Order ID:', orderId)
    console.log('💵 [Payment API] Amount: ₹', amount)

    // Validate inputs
    if (!orderId || !amount) {
      console.log('❌ [Payment API] Missing required fields')
      return NextResponse.json(
        { error: 'Order ID and amount are required' },
        { status: 400 }
      )
    }

    // Validate amount is positive
    if (amount <= 0) {
      console.log('❌ [Payment API] Invalid amount:', amount)
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Verify order exists and belongs to user (if authenticated)
    const supabase = await createServerSupabase()
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, clerk_user_id, total_amount, payment_status')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.log('❌ [Payment API] Order not found:', orderId)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if order belongs to user (if authenticated)
    if (userId && order.clerk_user_id !== userId) {
      console.log('❌ [Payment API] Order does not belong to user')
      return NextResponse.json(
        { error: 'Unauthorized access to order' },
        { status: 403 }
      )
    }

    // Check if payment already completed
    if (order.payment_status === 'paid') {
      console.log('⚠️  [Payment API] Order already paid')
      return NextResponse.json(
        { error: 'Order already paid' },
        { status: 400 }
      )
    }

    // Verify amount matches order total
    if (Math.abs(order.total_amount - amount) > 0.01) {
      console.log('❌ [Payment API] Amount mismatch')
      console.log('❌ [Payment API] Expected:', order.total_amount)
      console.log('❌ [Payment API] Received:', amount)
      return NextResponse.json(
        { error: 'Amount mismatch with order total' },
        { status: 400 }
      )
    }

    console.log('✅ [Payment API] Order validated successfully')

    // Create Razorpay order
    console.log('🔧 [Payment API] Creating Razorpay order...')
    const result = await createRazorpayOrder(amount, orderId)

    if (!result.success) {
      console.error('❌ [Payment API] Razorpay order creation failed:', result.error)
      return NextResponse.json(
        { error: result.error || 'Failed to create payment order' },
        { status: 500 }
      )
    }

    console.log('✅ [Payment API] Razorpay order created:', result.order?.id)

    // Verify order was created
    if (!result.order) {
      console.error('❌ [Payment API] Order object is missing from result')
      return NextResponse.json(
        { error: 'Failed to create payment order' },
        { status: 500 }
      )
    }

    // Update order with Razorpay order ID
    const { error: updateError } = await supabase
      .from('orders')
      .update({ razorpay_order_id: result.order.id })
      .eq('id', orderId)

    if (updateError) {
      console.error('⚠️  [Payment API] Failed to update order with razorpay_order_id:', updateError)
      // Don't fail the request, just log the error
    } else {
      console.log('✅ [Payment API] Order updated with Razorpay order ID')
    }

    console.log('🎉 [Payment API] Payment order creation successful')

    return NextResponse.json({
      success: true,
      razorpayOrderId: result.order.id,
      amount: result.order.amount,
      currency: result.order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    })

  } catch (error: any) {
    console.error('❌ [Payment API] Unexpected error:', error)
    console.error('❌ [Payment API] Error stack:', error.stack)

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

