# 🚀 Production Deployment Guide
Cedar Elevator Industries - Checkout Module

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Razorpay Configuration](#razorpay-configuration)
3. [Webhook Setup](#webhook-setup)
4. [Email Notifications](#email-notifications)
5. [SMS Notifications](#sms-notifications-optional)
6. [Monitoring & Logging](#monitoring--logging)
7. [Error Alerts](#error-alerts)
8. [Performance Optimization](#performance-optimization)
9. [Security Hardening](#security-hardening)
10. [Rollback Plan](#rollback-plan)

---

## ✅ Pre-Deployment Checklist

### Code & Testing
- [ ] All manual tests completed and passed
- [ ] Automated test suite passing (unit + integration + E2E)
- [ ] Code reviewed and approved
- [ ] No critical or high-priority bugs
- [ ] Performance testing completed
- [ ] Security audit completed

### Database
- [ ] All migrations tested in staging
- [ ] Database backup created
- [ ] RLS policies verified
- [ ] Indexes optimized
- [ ] Audit logging active

### Environment
- [ ] Production environment variables configured
- [ ] SSL certificates valid
- [ ] CDN configured (if applicable)
- [ ] Load balancer configured
- [ ] Database connection pooling optimized

### Documentation
- [ ] API documentation updated
- [ ] Deployment runbook prepared
- [ ] Incident response plan ready
- [ ] Team trained on new features

---

## 💳 Razorpay Configuration

### Step 1: Switch from Test to Live Mode

**1.1 Access Razorpay Dashboard**
```
1. Login to https://dashboard.razorpay.com
2. Navigate to Settings → API Keys
3. Switch from "Test Mode" to "Live Mode"
```

**1.2 Generate Live API Keys**
```
1. Click "Generate Key" in Live Mode section
2. Note down:
   - Key ID (starts with rzp_live_)
   - Key Secret (keep this secret!)
3. Store securely in password manager
```

**1.3 Update Environment Variables**

Create/update `.env.production` or configure in hosting platform:

```bash
# Razorpay Live Keys
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_live_key_secret_here

# Razorpay Webhook Secret (generate in Step 2)
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

⚠️ **Security Note:** 
- NEVER commit `.env.production` to version control
- Use environment variable management (Vercel secrets, AWS Parameter Store, etc.)
- Rotate keys every 90 days

### Step 2: Configure Payment Settings

**2.1 Payment Methods**
```
Dashboard → Settings → Payment Methods
✓ Enable: Cards, UPI, NetBanking, Wallets
✓ Set minimum/maximum transaction limits
✓ Configure international payments (if needed)
```

**2.2 Settlement Schedule**
```
Dashboard → Settings → Settlements
- Set preferred settlement schedule (T+3, T+7, etc.)
- Configure bank account details
- Verify bank account
```

**2.3 Branding**
```
Dashboard → Settings → Branding
- Upload company logo
- Set brand color
- Configure checkout theme
```

**2.4 Business Details**
```
Dashboard → Account & Settings → Business Details
- Complete business profile
- Upload GST certificate
- Add business address
```

---

## 🔗 Webhook Setup

### Step 1: Configure Webhook URL

**1.1 Generate Webhook Secret**
```
1. Go to: Dashboard → Settings → Webhooks
2. Click "Add New Webhook"
3. Enter webhook URL: https://yourdomain.com/api/webhooks/razorpay
4. Select "Live" mode
5. Copy the "Webhook Secret" generated
6. Add to environment variables:
   RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxx
```

**1.2 Select Events to Listen**

Enable the following events:
```
✓ payment.authorized
✓ payment.captured
✓ payment.failed
✓ order.paid
✓ refund.created
✓ refund.processed
```

**1.3 Set Webhook Configuration**
```json
{
  "url": "https://yourdomain.com/api/webhooks/razorpay",
  "active": true,
  "secret": "whsec_xxxxxxxxxxxxxx",
  "events": [
    "payment.authorized",
    "payment.captured",
    "payment.failed",
    "order.paid",
    "refund.created"
  ]
}
```

### Step 2: Test Webhook Delivery

**2.1 Use Razorpay Test Event**
```bash
# From Razorpay Dashboard → Webhooks → Test Webhook
# Send test event and verify:
1. Event received at endpoint
2. Signature verified successfully
3. Event processed correctly
4. Response: 200 OK returned
```

**2.2 Manual Testing with cURL**
```bash
# Generate test signature
SECRET="whsec_your_webhook_secret"
PAYLOAD='{"event":"payment.captured","payload":{"payment":{"entity":{"id":"pay_test123"}}}}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | cut -d ' ' -f2)

# Send webhook
curl -X POST https://yourdomain.com/api/webhooks/razorpay \
  -H "Content-Type: application/json" \
  -H "X-Razorpay-Signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

**2.3 Verify Webhook Logs**
```bash
# Check application logs for webhook receipt
# Expected output:
[WEBHOOK] Received event: payment.captured
[WEBHOOK] Signature verified: ✓
[WEBHOOK] Processing payment: pay_test123
[WEBHOOK] Order updated: order_abc123 → paid
[WEBHOOK] Response: 200 OK
```

### Step 3: Handle Webhook Failures

**3.1 Retry Mechanism**
```
Razorpay automatically retries failed webhooks:
- Retry Intervals: 5min, 30min, 2hr, 6hr, 12hr, 24hr
- Max Retries: 10 attempts over 3 days
- Ensure your endpoint is idempotent
```

**3.2 Manual Replay**
```
If webhook delivery fails:
1. Dashboard → Webhooks → Event Logs
2. Find failed event
3. Click "Replay Event"
4. Verify successful processing
```

---

## 📧 Email Notifications

### Step 1: Choose Email Service Provider

**Recommended Options:**
- **Resend** (Modern, Developer-friendly)
- **SendGrid** (Enterprise-grade)
- **AWS SES** (Cost-effective, scalable)
- **Mailgun** (Reliable, good deliverability)

### Step 2: Configure Email Service

**Example: Using Resend**

**2.1 Sign Up & Get API Key**
```
1. Visit https://resend.com
2. Sign up for account
3. Navigate to API Keys
4. Generate new key: re_xxxxxxxxxxxxxxxxxx
```

**2.2 Add to Environment Variables**
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=orders@cedarelevators.com
RESEND_FROM_NAME=Cedar Elevator Industries
```

**2.3 Verify Domain**
```
1. Add DNS records provided by Resend
2. Verify domain ownership
3. Enable DKIM signing
4. Test email delivery
```

### Step 3: Email Templates

**3.1 Order Confirmation Email**

Create template: `order-confirmation.tsx` (React Email)

```typescript
import { Body, Container, Head, Heading, Html, Text } from '@react-email/components'

export default function OrderConfirmationEmail({ order }: { order: any }) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Order Confirmed! 🎉</Heading>
          <Text>Order Number: {order.order_number}</Text>
          <Text>Total Amount: ₹{order.total_amount.toLocaleString('en-IN')}</Text>
          {/* Add more details */}
        </Container>
      </Body>
    </Html>
  )
}

const main = { backgroundColor: '#f6f9fc', fontFamily: 'Arial, sans-serif' }
const container = { margin: '0 auto', padding: '20px', maxWidth: '600px' }
const h1 = { color: '#ff6b35', fontSize: '24px' }
```

**3.2 Payment Failure Email**
```typescript
export default function PaymentFailureEmail({ order }: { order: any }) {
  return (
    <Html>
      <Body>
        <Heading>Payment Failed</Heading>
        <Text>Your order #{order.order_number} payment was unsuccessful.</Text>
        <Text>You can retry payment from your orders page.</Text>
        <Button href={`https://yourdomain.com/orders/${order.id}`}>
          Retry Payment
        </Button>
      </Body>
    </Html>
  )
}
```

### Step 4: Implement Email Sending

**4.1 Create Email Service**

`/src/lib/email/send-order-confirmation.ts`
```typescript
import { Resend } from 'resend'
import OrderConfirmationEmail from '@/emails/order-confirmation'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOrderConfirmation(order: any, user: any) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
      to: [user.email],
      subject: `Order Confirmation - ${order.order_number}`,
      react: OrderConfirmationEmail({ order })
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error }
    }

    console.log('Order confirmation email sent:', data.id)
    return { success: true, emailId: data.id }
  } catch (error) {
    console.error('Email service error:', error)
    return { success: false, error }
  }
}
```

**4.2 Trigger Email on Order Paid**

Update webhook handler: `/src/app/api/webhooks/razorpay/route.ts`

```typescript
// After order marked as paid
if (event === 'payment.captured') {
  // ... existing order update logic ...
  
  // Send confirmation email
  const order = await getOrderById(orderId)
  const user = await getUserById(order.clerk_user_id)
  
  await sendOrderConfirmation(order, user)
}
```

### Step 5: Testing Email Delivery

**5.1 Test in Development**
```bash
# Use test email addresses
# Check email logs in provider dashboard
# Verify email rendering and content
```

**5.2 Monitor Delivery Rates**
```
Track in email provider dashboard:
- Delivery rate (should be >95%)
- Open rate (benchmark: 20-30%)
- Bounce rate (should be <5%)
- Spam complaints (should be <0.1%)
```

---

## 📱 SMS Notifications (Optional)

### Step 1: Choose SMS Provider

**Recommended for India:**
- **Twilio** (Global, reliable)
- **MSG91** (India-focused)
- **Gupshup** (Enterprise)

### Step 2: Configuration

**Example: Using Twilio**

**2.1 Setup**
```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+91xxxxxxxxxx
```

**2.2 SMS Templates**
```
Order Confirmed:
"Your order #{order_number} of ₹{amount} is confirmed. Track: {link}. -Cedar Elevators"

Payment Failed:
"Payment failed for order #{order_number}. Retry: {link}. Contact: {support_number}. -Cedar Elevators"
```

**2.3 Send SMS Function**
```typescript
import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function sendOrderSMS(order: any, phone: string) {
  try {
    const message = await client.messages.create({
      body: `Your order #${order.order_number} is confirmed! Track: https://yourdomain.com/orders/${order.id}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    })
    
    return { success: true, messageId: message.sid }
  } catch (error) {
    console.error('SMS send error:', error)
    return { success: false, error }
  }
}
```

### Step 3: Compliance (DND Regulations)

⚠️ **Important for India:**
```
1. Maintain opt-in records for transactional SMS
2. Include opt-out instructions
3. Use registered sender ID
4. Follow TRAI DND regulations
5. Only send transactional messages (not promotional)
```

---

## 📊 Monitoring & Logging

### Step 1: Application Monitoring

**1.1 Setup Error Tracking (Sentry)**
```bash
npm install @sentry/nextjs

# Configuration
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_ORG=your-org
SENTRY_PROJECT=checkout-module
```

**1.2 Configure Sentry**

`sentry.client.config.ts`
```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request) {
      delete event.request.cookies
    }
    return event
  }
})
```

### Step 2: Database Monitoring

**2.1 Query Performance**
```sql
-- Monitor slow queries
SELECT 
  calls,
  mean_exec_time,
  query
FROM pg_stat_statements
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**2.2 Connection Pooling**
```
Monitor in Supabase Dashboard:
- Active connections
- Idle connections
- Connection wait time
- Query execution time
```

### Step 3: Payment Monitoring

**3.1 Key Metrics to Track**
```javascript
// Create monitoring dashboard for:
- Payment success rate (target: >95%)
- Average checkout time
- Cart abandonment rate
- Payment failure reasons
- Webhook delivery success rate
- Order creation errors
```

**3.2 Setup Metrics Collection**

`/src/lib/analytics/checkout-metrics.ts`
```typescript
export async function trackCheckoutMetrics(event: string, data: any) {
  // Send to analytics service (Mixpanel, Segment, etc.)
  await analytics.track({
    event,
    properties: {
      ...data,
      timestamp: new Date().toISOString()
    }
  })
}

// Usage
await trackCheckoutMetrics('order_created', {
  order_id: order.id,
  total_amount: order.total_amount,
  item_count: order.items.length
})
```

### Step 4: Logging Best Practices

**4.1 Structured Logging**
```typescript
import pino from 'pino'

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: ['*.password', '*.credit_card'], // Hide sensitive fields
})

// Log examples
logger.info({ orderId: 'order_123' }, 'Order created successfully')
logger.error({ error, orderId: 'order_123' }, 'Payment processing failed')
logger.warn({ cartId: 'cart_456' }, 'Cart locked for too long')
```

**4.2 Log Aggregation**
```
Options:
- Vercel Logs (built-in for Vercel deployments)
- CloudWatch (AWS)
- Datadog (enterprise)
- LogDNA / New Relic
```

---

## 🚨 Error Alerts

### Step 1: Configure Alert Channels

**1.1 Slack Notifications**
```bash
# Create Slack webhook
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxxxx/xxxxx/xxxxx
SLACK_ALERTS_CHANNEL=#checkout-alerts
```

**1.2 Alert Function**

`/src/lib/alerts/send-alert.ts`
```typescript
export async function sendSlackAlert(message: string, severity: 'info' | 'warning' | 'critical') {
  const colors = {
    info: '#36a64f',
    warning: '#ffcc00',
    critical: '#ff0000'
  }

  await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attachments: [{
        color: colors[severity],
        text: message,
        footer: 'Cedar Checkout Monitor',
        ts: Math.floor(Date.now() / 1000)
      }]
    })
  })
}
```

### Step 2: Alert Triggers

**2.1 Payment Failure Rate Alert**
```typescript
// Monitor payment failures
// Trigger alert if failure rate > 10% in last hour

async function checkPaymentFailureRate() {
  const recentPayments = await getPaymentsLastHour()
  const failureRate = recentPayments.failed / recentPayments.total

  if (failureRate > 0.10) {
    await sendSlackAlert(
      `⚠️ HIGH PAYMENT FAILURE RATE: ${(failureRate * 100).toFixed(2)}% in last hour`,
      'critical'
    )
  }
}
```

**2.2 Webhook Delivery Failure Alert**
```typescript
// Alert if webhook delivery fails repeatedly
// Check Razorpay webhook logs via API

async function checkWebhookHealth() {
  const failedWebhooks = await getFailedWebhooks()
  
  if (failedWebhooks.length > 5) {
    await sendSlackAlert(
      `⚠️ ${failedWebhooks.length} webhooks failed delivery`,
      'warning'
    )
  }
}
```

**2.3 Order Stuck Alert**
```typescript
// Alert if orders stuck in pending_payment > 30 minutes

async function checkStuckOrders() {
  const stuckOrders = await getOrdersStuckInPending()
  
  if (stuckOrders.length > 0) {
    await sendSlackAlert(
      `⚠️ ${stuckOrders.length} orders stuck in pending_payment`,
      'warning'
    )
  }
}
```

### Step 3: Alert Schedule

**3.1 Cron Jobs**
```typescript
// Run health checks every 5 minutes
// Use Vercel Cron or external service

// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/check-payment-health",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/check-webhook-health",
      "schedule": "*/10 * * * *"
    }
  ]
}
```

---

## ⚡ Performance Optimization

### Database Optimization

**1. Index Optimization**
```sql
-- Ensure these indexes exist for checkout queries
CREATE INDEX CONCURRENTLY idx_orders_clerk_user_id ON orders(clerk_user_id);
CREATE INDEX CONCURRENTLY idx_orders_status ON orders(status);
CREATE INDEX CONCURRENTLY idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX CONCURRENTLY idx_payment_transactions_razorpay_payment_id ON payment_transactions(razorpay_payment_id);
CREATE INDEX CONCURRENTLY idx_business_addresses_clerk_user_id ON business_addresses(clerk_user_id);

-- Analyze query performance
ANALYZE orders;
ANALYZE payment_transactions;
```

**2. Connection Pooling**
```typescript
// Configure Supabase client with connection pooling
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    db: {
      schema: 'public'
    },
    auth: {
      persistSession: false
    }
  }
)
```

### API Optimization

**1. Response Caching**
```typescript
// Cache checkout summary for 60 seconds
export async function getCheckoutSummary(cartId: string) {
  const cacheKey = `checkout_summary:${cartId}`
  
  // Try cache first
  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)
  
  // Calculate summary
  const summary = await calculateCheckoutSummary(cartId)
  
  // Cache for 60 seconds
  await redis.setex(cacheKey, 60, JSON.stringify(summary))
  
  return summary
}
```

**2. Webhook Processing**
```typescript
// Process webhooks asynchronously
// Return 200 OK immediately, then process in background

export async function POST(request: Request) {
  const payload = await request.text()
  const signature = request.headers.get('x-razorpay-signature')
  
  // Verify signature
  if (!verifySignature(payload, signature)) {
    return new Response('Invalid signature', { status: 400 })
  }
  
  // Return 200 OK immediately
  const response = new Response('OK', { status: 200 })
  
  // Process webhook in background
  processWebhookAsync(payload) // Non-blocking
  
  return response
}
```

---

## 🔒 Security Hardening

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit'

// Limit checkout API calls
export const checkoutRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per IP
  message: 'Too many checkout requests, please try again later'
})

// Webhook endpoint rate limiting
export const webhookRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 webhooks per minute
  skipSuccessfulRequests: true
})
```

### Input Validation

```typescript
import { z } from 'zod'

// Validate all inputs with Zod schemas
const addressSchema = z.object({
  contact_name: z.string().min(2).max(100),
  contact_phone: z.string().regex(/^[6-9]\d{9}$/),
  postal_code: z.string().regex(/^\d{6}$/),
  // ... other fields
})

export async function addAddress(data: unknown) {
  // Validate before processing
  const validated = addressSchema.parse(data)
  // ... proceed with validated data
}
```

### HTTPS Enforcement

```typescript
// middleware.ts - Force HTTPS in production
export function middleware(request: NextRequest) {
  if (
    process.env.NODE_ENV === 'production' &&
    request.headers.get('x-forwarded-proto') !== 'https'
  ) {
    return NextResponse.redirect(
      `https://${request.headers.get('host')}${request.nextUrl.pathname}`,
      301
    )
  }
}
```

---

## 🔄 Rollback Plan

### Preparation

**1. Create Rollback Branch**
```bash
# Before deployment
git checkout -b pre-deployment-backup
git push origin pre-deployment-backup
```

**2. Database Backup**
```bash
# Create database snapshot
# Via Supabase Dashboard or CLI
supabase db dump > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Rollback Procedure

**If Issues Detected:**

**Step 1: Immediate Actions**
```bash
# 1. Revert to previous deployment
vercel rollback

# 2. Switch Razorpay back to test mode (if needed)
# Dashboard → Settings → Switch to Test Mode

# 3. Disable webhooks temporarily
# Dashboard → Webhooks → Deactivate
```

**Step 2: Restore Database (if needed)**
```bash
# Restore from backup
psql -h db.supabase.co -U postgres -d postgres < backup_file.sql

# Or via Supabase Dashboard: Database → Backups → Restore
```

**Step 3: Communication**
```
1. Notify customers via email (if orders affected)
2. Update status page
3. Internal team notification
4. Investigate root cause
```

---

## 📝 Deployment Day Checklist

### T-1 Day (Before Deployment)

- [ ] All tests passing
- [ ] Code freeze implemented
- [ ] Staging deployment tested
- [ ] Database backup taken
- [ ] Rollback plan reviewed
- [ ] Team briefed
- [ ] Customer support notified
- [ ] Monitoring dashboards prepared

### Deployment Day

**Morning (Low Traffic Period)**

- [ ] Final staging verification
- [ ] Deploy to production
- [ ] Verify deployment health
- [ ] Test live payment (small amount)
- [ ] Verify webhook delivery
- [ ] Test email notifications
- [ ] Monitor error logs (1 hour)

**Post-Deployment (First 24 Hours)**

- [ ] Monitor payment success rate
- [ ] Check webhook delivery success
- [ ] Verify order creation working
- [ ] Monitor error rates
- [ ] Check customer support tickets
- [ ] Review system performance
- [ ] Confirm email/SMS delivery

**Day 2-7 (Stabilization)**

- [ ] Daily metrics review
- [ ] Optimize based on real traffic
- [ ] Address any minor issues
- [ ] Collect user feedback
- [ ] Performance tuning

---

## 📊 Success Metrics

**Key Performance Indicators:**

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Payment Success Rate | >95% | <90% |
| Checkout Completion Rate | >70% | <50% |
| Average Checkout Time | <3 min | >5 min |
| Webhook Delivery Success | >99% | <95% |
| API Response Time (p95) | <500ms | >2s |
| Error Rate | <1% | >5% |
| Email Delivery Rate | >95% | <90% |

---

## 🆘 Emergency Contacts

**Technical Team:**
- DevOps Lead: [Name] - [Phone] - [Email]
- Backend Lead: [Name] - [Phone] - [Email]
- Security Lead: [Name] - [Phone] - [Email]

**External Services:**
- Razorpay Support: https://razorpay.com/support / 1800-123-4567
- Hosting Provider: [Support contact]
- Database Provider: [Support contact]

**Escalation Path:**
1. On-call Engineer (immediate)
2. Team Lead (15 minutes)
3. CTO (30 minutes for critical issues)

---

## ✅ Final Verification

Before marking deployment complete:

```bash
# Run these checks:

# 1. Health Check
curl https://yourdomain.com/api/health

# 2. Test Checkout Flow (end-to-end)
# Manual testing with small real payment

# 3. Verify Monitoring
# Check all dashboards are receiving data

# 4. Confirm Alerts Working
# Trigger test alert to verify channels

# 5. Review First 10 Real Orders
# Verify order creation, payment, emails
```

---

**Deployment Guide Version:** 1.0  
**Last Updated:** January 2025  
**Status:** ✅ Production Ready

For questions or issues during deployment, refer to the [Emergency Contacts](#-emergency-contacts) section.
