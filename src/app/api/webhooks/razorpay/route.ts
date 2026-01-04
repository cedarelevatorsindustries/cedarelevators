import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import crypto from 'crypto'

/**
 * POST /api/webhooks/razorpay
 * Handle Razorpay webhook events
 * 
 * Webhook events: payment.captured, payment.failed, refund.created, etc.
 */
export async function POST(request: NextRequest) {
  console.log('🔔 [Razorpay Webhook] Webhook received')
  
  try {
    // Get raw body for signature verification
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')
    
    console.log('🔐 [Razorpay Webhook] Signature present:', !!signature)
    
    if (!signature) {
      console.log('❌ [Razorpay Webhook] No signature provided')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }
    
    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    
    if (!webhookSecret) {
      console.warn('⚠️  [Razorpay Webhook] Webhook secret not configured, skipping verification')
    } else {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex')
      
      if (expectedSignature !== signature) {
        console.log('❌ [Razorpay Webhook] Invalid signature')
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 400 }
        )
      }
      
      console.log('✅ [Razorpay Webhook] Signature verified')
    }
    
    // Parse event
    const event = JSON.parse(body)
    const eventType = event.event
    
    console.log('📬 [Razorpay Webhook] Event type:', eventType)
    console.log('📬 [Razorpay Webhook] Event data:', JSON.stringify(event, null, 2))
    
    const supabase = await createServerSupabase()
    
    if (!supabase) {
      console.error('❌ [Razorpay Webhook] Failed to create Supabase client')
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }
    
    // Handle different event types
    switch (eventType) {
      case 'payment.captured':
        console.log('💰 [Razorpay Webhook] Processing payment.captured')
        
        const capturedPayment = event.payload.payment.entity
        const capturedOrderId = capturedPayment.order_id
        const capturedPaymentId = capturedPayment.id
        
        console.log('💰 [Razorpay Webhook] Order ID:', capturedOrderId)
        console.log('💰 [Razorpay Webhook] Payment ID:', capturedPaymentId)
        
        // EDGE CASE: Idempotency check - prevent duplicate processing
        const { data: existingTransaction } = await supabase
          .from('payment_transactions')
          .select('id, status')
          .eq('razorpay_order_id', capturedOrderId)
          .eq('razorpay_payment_id', capturedPaymentId)
          .single()
        
        if (existingTransaction && existingTransaction.status === 'captured') {
          console.log('⚠️ [Razorpay Webhook] Payment already processed, skipping (idempotency)')
          break
        }
        
        // Update order
        const { error: captureError } = await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            razorpay_payment_id: capturedPaymentId,
            order_status: 'confirmed',
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('razorpay_order_id', capturedOrderId)
        
        if (captureError) {
          console.error('❌ [Razorpay Webhook] Failed to update order:', captureError)
        } else {
          console.log('✅ [Razorpay Webhook] Order updated successfully')
          
          // Update or create payment transaction record
          await supabase
            .from('payment_transactions')
            .upsert({
              razorpay_order_id: capturedOrderId,
              razorpay_payment_id: capturedPaymentId,
              status: 'captured',
              captured_at: new Date().toISOString(),
              amount: capturedPayment.amount / 100, // Convert from paise to rupees
              currency: capturedPayment.currency,
              method: capturedPayment.method,
              webhook_data: event.payload,
              updated_at: new Date().toISOString()
            })
        }
        break
        
      case 'payment.failed':
        console.log('❌ [Razorpay Webhook] Processing payment.failed')
        
        const failedPayment = event.payload.payment.entity
        const failedOrderId = failedPayment.order_id
        
        console.log('❌ [Razorpay Webhook] Failed order ID:', failedOrderId)
        
        // Update order
        const { error: failError } = await supabase
          .from('orders')
          .update({
            payment_status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('razorpay_order_id', failedOrderId)
        
        if (failError) {
          console.error('❌ [Razorpay Webhook] Failed to update order:', failError)
        } else {
          console.log('✅ [Razorpay Webhook] Order marked as failed')
        }
        break
        
      case 'refund.created':
        console.log('🔄 [Razorpay Webhook] Processing refund.created')
        
        const refund = event.payload.refund.entity
        const refundPaymentId = refund.payment_id
        
        console.log('🔄 [Razorpay Webhook] Refund payment ID:', refundPaymentId)
        
        // Update order
        const { error: refundError } = await supabase
          .from('orders')
          .update({
            payment_status: 'refunded',
            updated_at: new Date().toISOString()
          })
          .eq('razorpay_payment_id', refundPaymentId)
        
        if (refundError) {
          console.error('❌ [Razorpay Webhook] Failed to update order:', refundError)
        } else {
          console.log('✅ [Razorpay Webhook] Order marked as refunded')
        }
        break
        
      case 'order.paid':
        console.log('✅ [Razorpay Webhook] Processing order.paid')
        
        const paidOrder = event.payload.order.entity
        const paidOrderId = paidOrder.id
        
        console.log('✅ [Razorpay Webhook] Paid order ID:', paidOrderId)
        
        // Update order
        const { error: paidError } = await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            order_status: 'confirmed',
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('razorpay_order_id', paidOrderId)
        
        if (paidError) {
          console.error('❌ [Razorpay Webhook] Failed to update order:', paidError)
        } else {
          console.log('✅ [Razorpay Webhook] Order marked as paid')
        }
        break
        
      default:
        console.log('🔔 [Razorpay Webhook] Unhandled event type:', eventType)
        break
    }
    
    console.log('🎉 [Razorpay Webhook] Webhook processed successfully')
    
    return NextResponse.json({
      received: true,
      eventType: eventType
    })
    
  } catch (error: any) {
    console.error('❌ [Razorpay Webhook] Error processing webhook:', error)
    console.error('❌ [Razorpay Webhook] Error stack:', error.stack)
    
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

