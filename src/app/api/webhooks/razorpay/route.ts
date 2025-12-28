import { NextRequest, NextResponse } from 'next/server'
import { verifyPaymentSignature } from '@/lib/services/razorpay'
import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * Razorpay webhook handler
 * Handles payment events from Razorpay
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')
    
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }
    
    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (webhookSecret) {
      const crypto = require('crypto')
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex')
      
      if (expectedSignature !== signature) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 400 }
        )
      }
    }
    
    const event = JSON.parse(body)
    const supabase = createServerSupabaseClient()
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }
    
    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        // Payment was captured successfully
        const paymentId = event.payload.payment.entity.id
        const orderId = event.payload.payment.entity.notes?.order_id
        
        if (orderId) {
          await supabase
            .from('orders')
            .update({
              payment_status: 'paid',
              razorpay_payment_id: paymentId,
              payment_id: paymentId,
              paid_at: new Date().toISOString(),
              order_status: 'confirmed',
              updated_at: new Date().toISOString()
            })
            .eq('id', orderId)
        }
        break
      
      case 'payment.failed':
        // Payment failed
        const failedPaymentId = event.payload.payment.entity.id
        const failedOrderId = event.payload.payment.entity.notes?.order_id
        
        if (failedOrderId) {
          await supabase
            .from('orders')
            .update({
              payment_status: 'failed',
              razorpay_payment_id: failedPaymentId,
              updated_at: new Date().toISOString()
            })
            .eq('id', failedOrderId)
        }
        break
      
      case 'refund.created':
        // Refund was created
        const refundOrderId = event.payload.refund.entity.notes?.order_id
        
        if (refundOrderId) {
          await supabase
            .from('orders')
            .update({
              payment_status: 'refunded',
              updated_at: new Date().toISOString()
            })
            .eq('id', refundOrderId)
        }
        break
      
      default:
        console.log('Unhandled webhook event:', event.event)
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
