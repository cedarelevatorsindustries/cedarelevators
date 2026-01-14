import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.warn('Resend API key missing from environment variables')
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Cedar Elevators <updates@notifications.cedarelevator.com>'

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
              
              ${status === 'approved'
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

/**
 * Send admin invite email
 */
export async function sendAdminInviteEmail(to: string, role: string, inviteLink: string, invitedByEmail?: string) {
  try {
    if (!resend) {
      console.warn('Resend not configured, skipping email')
      return { success: false, error: 'Email service not configured' }
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'You have been invited to join Cedar Elevators Admin',
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
              <h2>Admin Invitation</h2>
              <p>You have been invited to join the Cedar Elevators admin team as a <strong>${role.replace('_', ' ').toUpperCase()}</strong>.</p>
              ${invitedByEmail ? `<p>Invited by: ${invitedByEmail}</p>` : ''}
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteLink}" 
                   style="display: inline-block; background-color: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
                  Accept Invitation
                </a>
              </div>
              
              <p style="text-align: center; font-size: 14px; color: #666;">
                Or copy and paste this link into your browser:<br>
                <a href="${inviteLink}" style="color: #f97316;">${inviteLink}</a>
              </p>

              <p style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
                This link will expire in 72 hours. If you did not expect this invitation, please ignore this email.
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
      console.error('Error sending admin invite email:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Error in sendAdminInviteEmail:', error)
    return { success: false, error: error.message || 'Failed to send email' }
  }
}

/**
 * Send quote approved email
 */
export async function sendQuoteApprovedEmail(
  to: string,
  quoteData: {
    quoteId: string
    quoteNumber: string
    customerName: string
    total: number
    validUntil: string
    adminMessage?: string
  }
) {
  try {
    if (!resend) {
      console.warn('Resend not configured, skipping email')
      return { success: false, error: 'Email service not configured' }
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Quote ${quoteData.quoteNumber} Approved - Cedar Elevators`,
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
              <h2 style="color: #16a34a;">✅ Your Quote Has Been Approved!</h2>
              <p>Dear ${quoteData.customerName},</p>
              <p>Great news! Your quote request has been approved and is ready for you to review.</p>
              
              <div style="background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #16a34a;">
                <p style="margin: 0;"><strong>Quote Number:</strong> ${quoteData.quoteNumber}</p>
                <p style="margin: 10px 0 0 0;"><strong>Total:</strong> ₹${quoteData.total.toLocaleString()}</p>
                <p style="margin: 10px 0 0 0;"><strong>Valid Until:</strong> ${quoteData.validUntil}</p>
              </div>
              
              ${quoteData.adminMessage ? `
                <div style="background-color: #eff6ff; padding: 15px; margin: 20px 0; border-radius: 5px;">
                  <p style="margin: 0; color: #1e40af;"><strong>Message from Cedar Team:</strong></p>
                  <p style="margin: 10px 0 0 0;">${quoteData.adminMessage}</p>
                </div>
              ` : ''}
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/quotes/${quoteData.quoteId}" 
                   style="display: inline-block; background-color: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
                  View Quote & Place Order
                </a>
              </div>
              
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
      console.error('Error sending quote approved email:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Error in sendQuoteApprovedEmail:', error)
    return { success: false, error: error.message || 'Failed to send email' }
  }
}

/**
 * Send quote rejected email
 */
export async function sendQuoteRejectedEmail(
  to: string,
  quoteData: {
    quoteNumber: string
    customerName: string
    reason: string
  }
) {
  try {
    if (!resend) {
      console.warn('Resend not configured, skipping email')
      return { success: false, error: 'Email service not configured' }
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Quote ${quoteData.quoteNumber} Update - Cedar Elevators`,
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
              <h2>Quote Update</h2>
              <p>Dear ${quoteData.customerName},</p>
              <p>We've reviewed your quote request and unfortunately we're unable to proceed at this time.</p>
              
              <div style="background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <p style="margin: 0;"><strong>Quote Number:</strong> ${quoteData.quoteNumber}</p>
              </div>
              
              <div style="background-color: #fef2f2; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #dc2626;">
                <p style="margin: 0; color: #991b1b;"><strong>Reason:</strong></p>
                <p style="margin: 10px 0 0 0;">${quoteData.reason}</p>
              </div>
              
              <p>If you have any questions or would like to submit a new quote request, please don't hesitate to contact us.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || ''}/contact" 
                   style="display: inline-block; background-color: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
                  Contact Support
                </a>
              </div>
            </div>
            
            <div style="background-color: #333; color: white; padding: 20px; text-align: center; margin-top: 20px;">
              <p style="margin: 0;">© ${new Date().getFullYear()} Cedar Elevators. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending quote rejected email:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Error in sendQuoteRejectedEmail:', error)
    return { success: false, error: error.message || 'Failed to send email' }
  }
}

/**
 * Send quote expired email
 */
export async function sendQuoteExpiredEmail(
  to: string,
  quoteData: {
    quoteNumber: string
    customerName: string
  }
) {
  try {
    if (!resend) {
      console.warn('Resend not configured, skipping email')
      return { success: false, error: 'Email service not configured' }
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Quote ${quoteData.quoteNumber} Expired - Cedar Elevators`,
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
              <h2>Quote Expired</h2>
              <p>Dear ${quoteData.customerName},</p>
              <p>Your quote has expired and is no longer valid for conversion to an order.</p>
              
              <div style="background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <p style="margin: 0;"><strong>Quote Number:</strong> ${quoteData.quoteNumber}</p>
              </div>
              
              <p>If you're still interested, please submit a new quote request and we'll be happy to assist you.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || ''}/quotes/new" 
                   style="display: inline-block; background-color: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
                  Request New Quote
                </a>
              </div>
            </div>
            
            <div style="background-color: #333; color: white; padding: 20px; text-align: center; margin-top: 20px;">
              <p style="margin: 0;">© ${new Date().getFullYear()} Cedar Elevators. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending quote expired email:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Error in sendQuoteExpiredEmail:', error)
    return { success: false, error: error.message || 'Failed to send email' }
  }
}
