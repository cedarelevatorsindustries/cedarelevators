import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.warn('Resend API key missing from environment variables')
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Cedar Elevators <updates@cedarelevators.in>'

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

function escapeHtml(value: string | null | undefined): string {
  if (!value) return ''
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Send Phase 1 customer quotation request confirmation email (no unissued prices)
 */
export async function sendQuoteSubmissionConfirmationEmail(
  to: string,
  data: {
    quoteNumber: string
    customerName: string
    companyName?: string | null
    submittedDate: string
    requestType: 'general' | 'single' | 'bulk'
    items: Array<{ product_name: string; variant_title?: string | null; quantity: number }>
    viewUrl: string
    trackUrl: string
    supportEmail?: string | null
    supportPhone?: string | null
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!resend) {
      return { success: false, error: 'Resend email service not configured' }
    }

    const itemsRows =
      data.items.length > 0
        ? data.items
            .map(
              (item) => `
              <tr>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #111827;">
                  ${escapeHtml(item.product_name)}${item.variant_title ? `<br><span style="font-size: 12px; color: #6b7280;">Variant: ${escapeHtml(item.variant_title)}</span>` : ''}
                </td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 14px; font-weight: 600; color: #111827;">
                  ${item.quantity}
                </td>
              </tr>`
            )
            .join('')
        : `<tr><td colspan="2" style="padding: 12px; font-size: 14px; color: #4b5563;">General elevator component / project enquiry</td></tr>`

    const subject = `We received your quotation request — ${data.quoteNumber}`

    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
          <body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #1f2937; max-width: 620px; margin: 0 auto; padding: 20px; background-color: #f3f4f6;">
            <div style="background-color: #111827; padding: 24px; border-radius: 8px 8px 0 0; border-bottom: 4px solid #ea580c;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 0.5px;">CEDAR ELEVATORS INDUSTRIES</h1>
              <p style="color: #d1d5db; margin: 4px 0 0 0; font-size: 13px;">Precision Elevator Components &amp; Engineering Supply</p>
            </div>

            <div style="background-color: #ffffff; padding: 28px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
              <h2 style="margin-top: 0; font-size: 18px; color: #111827;">Quotation Request Received</h2>
              <p>Dear ${escapeHtml(data.customerName)},</p>
              <p>Thank you for contacting Cedar Elevators. Our technical sales and engineering team has received your quotation request and will review specifications and pricing shortly.</p>

              <div style="background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 6px; padding: 16px; margin: 20px 0;">
                <p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Quotation Reference:</strong> <span style="font-family: monospace; font-weight: 700; color: #c2410c;">${escapeHtml(data.quoteNumber)}</span></p>
                <p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Submitted Date:</strong> ${escapeHtml(data.submittedDate)}</p>
                ${data.companyName ? `<p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Company:</strong> ${escapeHtml(data.companyName)}</p>` : ''}
                <p style="margin: 0; font-size: 14px;"><strong>Status:</strong> Received (Pending Engineering Review)</p>
              </div>

              <h3 style="font-size: 15px; color: #111827; margin-bottom: 10px;">Submitted Summary</h3>
              <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb;">
                <thead>
                  <tr style="background-color: #f9fafb;">
                    <th style="padding: 10px 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Item</th>
                    <th style="padding: 10px 12px; text-align: center; font-size: 12px; text-transform: uppercase; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Qty</th>
                  </tr>
                </thead>
                <tbody>${itemsRows}</tbody>
              </table>

              <div style="text-align: center; margin: 28px 0 20px 0;">
                <a href="${escapeHtml(data.viewUrl)}" style="display: inline-block; background-color: #ea580c; color: #ffffff; padding: 12px 26px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                  View Request Status
                </a>
              </div>

              <p style="font-size: 13px; color: #6b7280; text-align: center; margin-bottom: 24px;">
                Want to view all your quotation requests? <a href="${escapeHtml(data.trackUrl)}" style="color: #ea580c; text-decoration: underline;">Track your quotations</a>
              </p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
              <p style="font-size: 12px; color: #6b7280; margin: 0;">
                Need assistance? ${data.supportEmail ? `Email <a href="mailto:${escapeHtml(data.supportEmail)}" style="color: #374151;">${escapeHtml(data.supportEmail)}</a>` : ''}${data.supportEmail && data.supportPhone ? ' • ' : ''}${data.supportPhone ? `Call ${escapeHtml(data.supportPhone)}` : ''}
              </p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true, messageId: result?.id }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to send confirmation email' }
  }
}

/**
 * Send admin new quotation alert email
 */
export async function sendAdminNewQuoteAlertEmail(
  to: string,
  data: {
    quoteId: string
    quoteNumber: string
    customerName: string
    companyName?: string | null
    email: string
    phone: string
    requestType: 'general' | 'single' | 'bulk'
    itemsCount: number
    submittedDate: string
    adminQuoteUrl: string
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!resend) {
      return { success: false, error: 'Resend email service not configured' }
    }

    const requestLabel =
      data.requestType === 'bulk'
        ? 'Bulk Multi-Product Quote'
        : data.requestType === 'single'
          ? 'Single Product Quote'
          : 'General Enquiry'

    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `New Quotation Request — ${data.quoteNumber} (${requestLabel})`,
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
          <body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f3f4f6;">
            <div style="background-color: #111827; padding: 20px; border-radius: 8px 8px 0 0; border-bottom: 4px solid #ea580c;">
              <h1 style="color: #ffffff; margin: 0; font-size: 18px;">New Quotation Request Alert</h1>
            </div>
            <div style="background-color: #ffffff; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="margin-top: 0;">A new quotation enquiry has been submitted on Cedar Elevators:</p>
              <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
                <tr><td style="padding: 8px; border-bottom: 1px solid #f3f4f6; color: #6b7280; width: 150px;">Quote Number</td><td style="padding: 8px; border-bottom: 1px solid #f3f4f6; font-weight: 700;">${escapeHtml(data.quoteNumber)}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Request Type</td><td style="padding: 8px; border-bottom: 1px solid #f3f4f6;">${escapeHtml(requestLabel)}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Customer Name</td><td style="padding: 8px; border-bottom: 1px solid #f3f4f6;">${escapeHtml(data.customerName)}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Company</td><td style="padding: 8px; border-bottom: 1px solid #f3f4f6;">${escapeHtml(data.companyName || 'Not specified')}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Email</td><td style="padding: 8px; border-bottom: 1px solid #f3f4f6;">${escapeHtml(data.email)}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Phone</td><td style="padding: 8px; border-bottom: 1px solid #f3f4f6;">${escapeHtml(data.phone)}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Line Items</td><td style="padding: 8px; border-bottom: 1px solid #f3f4f6;">${data.itemsCount}</td></tr>
                <tr><td style="padding: 8px; color: #6b7280;">Submitted</td><td style="padding: 8px;">${escapeHtml(data.submittedDate)}</td></tr>
              </table>

              <div style="text-align: center; margin: 24px 0 8px 0;">
                <a href="${escapeHtml(data.adminQuoteUrl)}" style="display: inline-block; background-color: #ea580c; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                  Open Quotation in Admin Workspace
                </a>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true, messageId: result?.id }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to send admin alert email' }
  }
}

/**
 * Send official Quotation Issued email to customer (after PDF generation & storage verified)
 */
export async function sendQuoteIssuedEmail(
  to: string,
  data: {
    quoteNumber: string
    revisionNumber: number
    customerName: string
    issuedDate: string
    validUntil: string
    grandTotalFormatted: string
    adminMessage?: string | null
    viewUrl: string
    pdfUrl: string
    supportEmail?: string | null
    supportPhone?: string | null
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!resend) {
      return { success: false, error: 'Resend email service not configured' }
    }

    const revLabel = data.revisionNumber > 1 ? ` (Revision ${data.revisionNumber})` : ''
    const subject = `Your Cedar Elevators quotation is ready — ${data.quoteNumber}`

    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
          <body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #1f2937; max-width: 620px; margin: 0 auto; padding: 20px; background-color: #f3f4f6;">
            <div style="background-color: #111827; padding: 24px; border-radius: 8px 8px 0 0; border-bottom: 4px solid #ea580c;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px;">CEDAR ELEVATORS INDUSTRIES</h1>
              <p style="color: #d1d5db; margin: 4px 0 0 0; font-size: 13px;">Official Commercial Quotation</p>
            </div>

            <div style="background-color: #ffffff; padding: 28px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
              <h2 style="margin-top: 0; font-size: 18px; color: #111827;">Your Quotation Is Ready</h2>
              <p>Dear ${escapeHtml(data.customerName)},</p>
              <p>We have prepared your official commercial quotation${escapeHtml(revLabel)}. You can review the itemized pricing online or download the quotation PDF directly below.</p>

              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-left: 4px solid #ea580c; border-radius: 6px; padding: 16px; margin: 20px 0;">
                <p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Quotation Number:</strong> <span style="font-family: monospace; font-weight: 700;">${escapeHtml(data.quoteNumber)}</span>${escapeHtml(revLabel)}</p>
                <p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Issued Date:</strong> ${escapeHtml(data.issuedDate)}</p>
                <p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Valid Until:</strong> ${escapeHtml(data.validUntil)}</p>
                <p style="margin: 0; font-size: 16px; color: #111827;"><strong>Quoted Amount:</strong> <span style="color: #ea580c; font-weight: 700;">${escapeHtml(data.grandTotalFormatted)}</span></p>
              </div>

              ${
                data.adminMessage
                  ? `<div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 14px; margin: 18px 0;">
                      <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700; color: #1e40af;">Message from Cedar Elevators:</p>
                      <p style="margin: 0; font-size: 14px; color: #1e3a8a;">${escapeHtml(data.adminMessage)}</p>
                    </div>`
                  : ''
              }

              <div style="text-align: center; margin: 28px 0;">
                <a href="${escapeHtml(data.viewUrl)}" style="display: inline-block; background-color: #ea580c; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; margin: 4px;">
                  View Quotation Online
                </a>
                <a href="${escapeHtml(data.pdfUrl)}" style="display: inline-block; background-color: #111827; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; margin: 4px;">
                  Download PDF Quotation
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
              <p style="font-size: 12px; color: #6b7280; margin: 0;">
                For commercial clarifications or order confirmation, reply to ${escapeHtml(data.supportEmail || 'our sales team')}${data.supportPhone ? ` or call ${escapeHtml(data.supportPhone)}` : ''}.
              </p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true, messageId: result?.id }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to send quotation issued email' }
  }
}

/**
 * Send 6-digit passwordless OTP verification code for guest quotation history
 */
export async function sendGuestOtpEmail(
  to: string,
  data: {
    code: string
    expiresInMinutes: number
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!resend) {
      return { success: false, error: 'Resend email service not configured' }
    }

    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Your Cedar Elevators verification code: ${data.code}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
          <body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #1f2937; max-width: 520px; margin: 0 auto; padding: 20px; background-color: #f3f4f6;">
            <div style="background-color: #111827; padding: 20px; border-radius: 8px 8px 0 0; border-bottom: 4px solid #ea580c;">
              <h1 style="color: #ffffff; margin: 0; font-size: 18px;">CEDAR ELEVATORS</h1>
            </div>
            <div style="background-color: #ffffff; padding: 26px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
              <h2 style="margin-top: 0; font-size: 18px;">Quotation History Verification Code</h2>
              <p>Enter the following one-time verification code to access your Cedar Elevators quotation history:</p>
              <div style="text-align: center; margin: 24px 0; padding: 18px; background-color: #f9fafb; border: 1px dashed #d1d5db; border-radius: 8px;">
                <span style="font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #ea580c;">${escapeHtml(data.code)}</span>
              </div>
              <p style="font-size: 13px; color: #4b5563;">This code expires in ${data.expiresInMinutes} minutes. If you did not request this code, you can safely ignore this email.</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true, messageId: result?.id }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to send verification code email' }
  }
}
