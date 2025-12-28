import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { verifyPaymentSignature } from '@/lib/services/razorpay'
import { createServerSupabase } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { 
      orderId, 
      razorpayOrderId, 
      razorpayPaymentId, 
      razorpaySignature 
    } = await request.json()
    
    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: 'Missing required payment verification data' },
        { status: 400 }
      )
    }
    
    // Verify payment signature
    const isValid = verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    )
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      )
    }
    
    // Update order in database
    const supabase = await createServerSupabase()
    const { error } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        razorpay_payment_id: razorpayPaymentId,
        payment_id: razorpayPaymentId,
        paid_at: new Date().toISOString(),
        order_status: 'confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
    
    if (error) {
      console.error('Error updating order payment status:', error)
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully'
    })
    
  } catch (error: any) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Payment verification failed' },
      { status: 500 }
    )
  }
}
