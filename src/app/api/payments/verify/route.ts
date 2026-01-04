import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { verifyPaymentSignature } from '@/lib/services/razorpay'
import { createServerSupabase } from '@/lib/supabase/server'
import { sendOrderConfirmation } from '@/lib/services/email'

/**
 * POST /api/payments/verify
 * Verify Razorpay payment signature and update order status
 */
export async function POST(request: NextRequest) {
  console.log('✅ [Payment Verify] Payment verification request received')
  
  try {
    const { userId } = await auth()
    console.log('👤 [Payment Verify] User ID:', userId || 'Guest')
    
    // Parse request body
    const body = await request.json()
    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = body
    
    console.log('📋 [Payment Verify] Order ID:', orderId)
    console.log('📋 [Payment Verify] Razorpay Order ID:', razorpayOrderId)
    console.log('📋 [Payment Verify] Razorpay Payment ID:', razorpayPaymentId)
    
    // Validate inputs
    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      console.log('❌ [Payment Verify] Missing required fields')
      return NextResponse.json(
        { error: 'Missing required payment details' },
        { status: 400 }
      )
    }
    
    // Verify payment signature
    console.log('🔐 [Payment Verify] Verifying payment signature...')
    const isValid = verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    )
    
    if (!isValid) {
      console.log('❌ [Payment Verify] Invalid payment signature')
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      )
    }
    
    console.log('✅ [Payment Verify] Payment signature verified successfully')
    
    // Get order details
    const supabase = await createServerSupabase()
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', orderId)
      .single()
    
    if (orderError || !order) {
      console.log('❌ [Payment Verify] Order not found:', orderId)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
    
    // Check if order belongs to user (if authenticated)
    if (userId && order.clerk_user_id !== userId) {
      console.log('❌ [Payment Verify] Order does not belong to user')
      return NextResponse.json(
        { error: 'Unauthorized access to order' },
        { status: 403 }
      )
    }
    
    // Check if already paid
    if (order.payment_status === 'paid') {
      console.log('⚠️  [Payment Verify] Order already marked as paid')
      return NextResponse.json({
        success: true,
        message: 'Order already paid',
        order: {
          id: order.id,
          orderNumber: order.order_number,
          status: order.order_status,
          paymentStatus: order.payment_status
        }
      })
    }
    
    console.log('💾 [Payment Verify] Updating order status...')
    
    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        razorpay_payment_id: razorpayPaymentId,
        order_status: 'confirmed',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
    
    if (updateError) {
      console.error('❌ [Payment Verify] Failed to update order:', updateError)
      throw updateError
    }
    
    console.log('✅ [Payment Verify] Order status updated to paid and confirmed')
    
    // Send confirmation email (optional - may have already been sent)
    console.log('📧 [Payment Verify] Sending payment confirmation email...')
    
    const emailAddress = order.clerk_user_id 
      ? order.shipping_address?.email 
      : order.guest_email
    
    if (emailAddress) {
      try {
        await sendOrderConfirmation(emailAddress, {
          orderNumber: order.order_number,
          items: order.order_items,
          total: order.total_amount,
          shippingAddress: order.shipping_address
        })
        console.log('✅ [Payment Verify] Confirmation email sent')
      } catch (emailError) {
        console.error('⚠️  [Payment Verify] Email error (non-critical):', emailError)
        // Don't fail verification if email fails
      }
    }
    
    console.log('🎉 [Payment Verify] Payment verification completed successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      order: {
        id: order.id,
        orderNumber: order.order_number,
        status: 'confirmed',
        paymentStatus: 'paid'
      }
    })
    
  } catch (error: any) {
    console.error('❌ [Payment Verify] Unexpected error:', error)
    console.error('❌ [Payment Verify] Error stack:', error.stack)
    
    return NextResponse.json(
      { error: error.message || 'Payment verification failed' },
      { status: 500 }
    )
  }
}

