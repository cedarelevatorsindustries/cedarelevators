import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.warn('Resend API key missing from environment variables')
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Cedar Elevators <noreply@cedarelevators.com>'

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmation(
  to: string,
  orderData: {
    orderNumber: string
    items: any[]
    total: number
    shippingAddress: any
  }
) {
  try {
    if (!resend) {
      console.warn('Resend not configured, skipping email')
      return { success: false, error: 'Email service not configured' }
    }

    const itemsList = orderData.items
      .map(item => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product_name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.unit_price.toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.total_price.toFixed(2)}</td>
        </tr>
      `)
      .join('')

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Order Confirmation - ${orderData.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f97316; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Cedar Elevators</h1>
            </div>
            
            <div style="padding: 20px; background-color: #f9f9f9;">
              <h2>Thank You for Your Order!</h2>
              <p>Your order has been confirmed and will be processed shortly.</p>
              
              <div style="background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <p style="margin: 0;"><strong>Order Number:</strong> ${orderData.orderNumber}</p>
                <p style="margin: 10px 0 0 0;"><strong>Order Total:</strong> ₹${orderData.total.toFixed(2)}</p>
              </div>
              
              <h3>Order Items</h3>
              <table style="width: 100%; border-collapse: collapse; background-color: white;">
                <thead>
                  <tr style="background-color: #f97316; color: white;">
                    <th style="padding: 10px; text-align: left;">Product</th>
                    <th style="padding: 10px; text-align: center;">Quantity</th>
                    <th style="padding: 10px; text-align: right;">Price</th>
                    <th style="padding: 10px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                </tbody>
              </table>
              
              <h3 style="margin-top: 30px;">Shipping Address</h3>
              <div style="background-color: white; padding: 15px; border-radius: 5px;">
                <p style="margin: 0;">${orderData.shippingAddress.name}</p>
                <p style="margin: 5px 0;">${orderData.shippingAddress.address_line1}</p>
                ${orderData.shippingAddress.address_line2 ? `<p style="margin: 5px 0;">${orderData.shippingAddress.address_line2}</p>` : ''}
                <p style="margin: 5px 0;">${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.postal_code}</p>
                <p style="margin: 5px 0;">${orderData.shippingAddress.country}</p>
                <p style="margin: 5px 0;">Phone: ${orderData.shippingAddress.phone}</p>
              </div>
              
              <p style="margin-top: 30px; text-align: center; color: #666;">
                If you have any questions, please contact our customer support.
              </p>
            </div>
            
            <div style="background-color: #333; color: white; padding: 20px; text-align: center; margin-top: 20px;">
              <p style="margin: 0;">© ${new Date().getFullYear()} Cedar Elevators. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending order confirmation:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Error in sendOrderConfirmation:', error)
    return { success: false, error: error.message || 'Failed to send email' }
  }
}

/**
 * Send order status update email
 */
export async function sendOrderStatusUpdate(
  to: string,
  orderNumber: string,
  status: string,
  trackingInfo?: {
    carrier: string
    trackingNumber: string
    trackingUrl?: string
  }
) {
  try {
    if (!resend) {
      console.warn('Resend not configured, skipping email')
      return { success: false, error: 'Email service not configured' }
    }

    const statusMessages: Record<string, string> = {
      confirmed: 'Your order has been confirmed and is being processed.',
      processing: 'Your order is currently being processed.',
      shipped: 'Your order has been shipped!',
      delivered: 'Your order has been delivered.',
      cancelled: 'Your order has been cancelled.',
    }

    const message = statusMessages[status] || 'Your order status has been updated.'

    const trackingHtml = trackingInfo
      ? `
        <div style="background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h3>Tracking Information</h3>
          <p><strong>Carrier:</strong> ${trackingInfo.carrier}</p>
          <p><strong>Tracking Number:</strong> ${trackingInfo.trackingNumber}</p>
          ${trackingInfo.trackingUrl ? `<p><a href="${trackingInfo.trackingUrl}" style="color: #f97316;">Track Your Package</a></p>` : ''}
        </div>
      `
      : ''

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Order ${status.charAt(0).toUpperCase() + status.slice(1)} - ${orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f97316; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Cedar Elevators</h1>
            </div>
            
            <div style="padding: 20px; background-color: #f9f9f9;">
              <h2>Order Status Update</h2>
              <p>${message}</p>
              
              <div style="background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <p style="margin: 0;"><strong>Order Number:</strong> ${orderNumber}</p>
                <p style="margin: 10px 0 0 0;"><strong>Status:</strong> <span style="color: #f97316; text-transform: capitalize;">${status}</span></p>
              </div>
              
              ${trackingHtml}
              
              <p style="margin-top: 30px; text-align: center; color: #666;">
                Thank you for choosing Cedar Elevators!
              </p>
            </div>
            
            <div style="background-color: #333; color: white; padding: 20px; text-align: center; margin-top: 20px;">
              <p style="margin: 0;">© ${new Date().getFullYear()} Cedar Elevators. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending order status update:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Error in sendOrderStatusUpdate:', error)
    return { success: false, error: error.message || 'Failed to send email' }
  }
}

/**
 * Send business verification status email
 */
export async function sendVerificationStatus(
  to: string,
  status: 'approved' | 'rejected',
  companyName: string,
  notes?: string
) {
  try {
    if (!resend) {
      console.warn('Resend not configured, skipping email')
      return { success: false, error: 'Email service not configured' }
    }

    const subject =
      status === 'approved'
        ? 'Business Account Verified - Cedar Elevators'
        : 'Business Account Verification Update - Cedar Elevators'

    const message =
      status === 'approved'
        ? `Congratulations! Your business account for ${companyName} has been verified. You now have access to all business features including bulk pricing, invoices, and priority support.`
        : `We're unable to verify your business account at this time. ${notes || 'Please contact support for more information.'}`

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f97316; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Cedar Elevators</h1>
            </div>
            
            <div style="padding: 20px; background-color: #f9f9f9;">
              <h2>Business Verification ${status === 'approved' ? 'Complete' : 'Update'}</h2>
              <p>${message}</p>
              
              ${
                status === 'approved'
                  ? `<div style="text-align: center; margin: 30px 0;">
                      <a href="${process.env.NEXT_PUBLIC_BASE_URL || ''}/dashboard" 
                         style="display: inline-block; background-color: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
                        Go to Dashboard
                      </a>
                    </div>`
                  : ''
              }
              
              <p style="margin-top: 30px; text-align: center; color: #666;">
                If you have any questions, please contact our support team.
              </p>
            </div>
            
            <div style="background-color: #333; color: white; padding: 20px; text-align: center; margin-top: 20px;">
              <p style="margin: 0;">© ${new Date().getFullYear()} Cedar Elevators. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending verification status:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Error in sendVerificationStatus:', error)
    return { success: false, error: error.message || 'Failed to send email' }
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(to: string, name: string) {
  try {
    if (!resend) {
      console.warn('Resend not configured, skipping email')
      return { success: false, error: 'Email service not configured' }
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Welcome to Cedar Elevators',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f97316; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Cedar Elevators</h1>
            </div>
            
            <div style="padding: 20px; background-color: #f9f9f9;">
              <h2>Welcome, ${name}!</h2>
              <p>Thank you for joining Cedar Elevators. We're excited to have you as part of our community.</p>
              
              <div style="background-color: white; padding: 20px; margin: 20px 0; border-radius: 5px;">
                <h3>Get Started</h3>
                <ul style="line-height: 2;">
                  <li>Browse our extensive catalog of elevator products</li>
                  <li>Add items to your cart and checkout securely</li>
                  <li>Track your orders in real-time</li>
                  <li>Access exclusive deals and promotions</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || ''}/products" 
                   style="display: inline-block; background-color: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
                  Start Shopping
                </a>
              </div>
              
              <p style="margin-top: 30px; text-align: center; color: #666;">
                If you have any questions, our support team is here to help.
              </p>
            </div>
            
            <div style="background-color: #333; color: white; padding: 20px; text-align: center; margin-top: 20px;">
              <p style="margin: 0;">© ${new Date().getFullYear()} Cedar Elevators. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending welcome email:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Error in sendWelcomeEmail:', error)
    return { success: false, error: error.message || 'Failed to send email' }
  }
}
