import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createRazorpayOrder } from '@/lib/services/razorpay'
import { createServerSupabase } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { orderId, amount } = await request.json()
    
    if (!orderId || !amount) {
      return NextResponse.json(
        { error: 'Order ID and amount required' },
        { status: 400 }
      )
    }
    
    // Create Razorpay order
    const result = await createRazorpayOrder(amount, orderId)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
    
    // Update order with Razorpay order ID
    const supabase = await createServerSupabase()
    await supabase
      .from('orders')
      .update({ razorpay_order_id: result.order.id })
      .eq('id', orderId)
    
    return NextResponse.json({
      success: true,
      razorpayOrderId: result.order.id,
      amount: result.order.amount,
      currency: result.order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    })
    
  } catch (error: any) {
    console.error('Payment order creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment order' },
      { status: 500 }
    )
  }
}
