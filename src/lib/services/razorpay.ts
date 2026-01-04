import Razorpay from 'razorpay'
import crypto from 'crypto'

if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn('Razorpay credentials missing from environment variables')
}

/**
 * Initialize Razorpay instance
 */
export const razorpay = process.env.RAZORPAY_KEY_SECRET ? new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
}) : null

/**
 * Create Razorpay order
 */
export async function createRazorpayOrder(amount: number, orderId: string) {
  try {
    if (!razorpay) {
      throw new Error('Razorpay not configured')
    }

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: orderId,
      notes: {
        order_id: orderId,
      },
    }
    
    const order = await razorpay.orders.create(options)
    return { success: true, order }
  } catch (error: any) {
    console.error('Razorpay order creation error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Verify payment signature
 */
export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean {
  try {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay secret key not configured')
    }

    const body = razorpayOrderId + '|' + razorpayPaymentId
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex')
    
    return expectedSignature === razorpaySignature
  } catch (error: any) {
    console.error('Payment signature verification error:', error)
    return false
  }
}

/**
 * Capture payment (for authorized payments)
 */
export async function capturePayment(paymentId: string, amount: number) {
  try {
    if (!razorpay) {
      throw new Error('Razorpay not configured')
    }

    const payment = await razorpay.payments.capture(
      paymentId,
      Math.round(amount * 100),
      'INR'
    )
    return { success: true, payment }
  } catch (error: any) {
    console.error('Payment capture error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Create refund
 */
export async function createRefund(paymentId: string, amount?: number) {
  try {
    if (!razorpay) {
      throw new Error('Razorpay not configured')
    }

    const refundData: any = {
      speed: 'normal', // 'normal' or 'optimum'
    }

    if (amount) {
      refundData.amount = Math.round(amount * 100) // Partial refund
    }

    const refund = await razorpay.payments.refund(paymentId, refundData)
    return { success: true, refund }
  } catch (error: any) {
    console.error('Refund creation error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Fetch payment details
 */
export async function fetchPaymentDetails(paymentId: string) {
  try {
    if (!razorpay) {
      throw new Error('Razorpay not configured')
    }

    const payment = await razorpay.payments.fetch(paymentId)
    return { success: true, payment }
  } catch (error: any) {
    console.error('Error fetching payment details:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Fetch order details from Razorpay
 */
export async function fetchRazorpayOrder(orderId: string) {
  try {
    if (!razorpay) {
      throw new Error('Razorpay not configured')
    }

    const order = await razorpay.orders.fetch(orderId)
    return { success: true, order }
  } catch (error: any) {
    console.error('Error fetching Razorpay order:', error)
    return { success: false, error: error.message }
  }
}

