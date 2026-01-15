# Deployment Guide

## Production Deployment

### Prerequisites
- Vercel account (recommended)
- Supabase project
- Clerk application
- Redis instance (Upstash)
- Resend account
- Razorpay account

## Vercel Deployment

### Initial Setup

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy from project root
   vercel
   ```

2. **Configure Environment Variables**
   
   In Vercel Dashboard → Project → Settings → Environment Variables:

   ```env
   # Next.js
   NEXT_PUBLIC_BASE_URL=https://your-domain.com
   
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   
   # Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   CLERK_SECRET_KEY=sk_live_...
   
   # Redis (Upstash)
   REDIS_URL=redis://...
   REDIS_TOKEN=...
   
   # Resend
   RESEND_API_KEY=re_...
   
   # Razorpay
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...
   RAZORPAY_KEY_SECRET=...
   ```

3. **Domain Configuration**
   - Add custom domain in Vercel dashboard
   - Configure DNS records
   - SSL certificate is automatically provisioned

### Build Configuration

Create `vercel.json` in project root:

```json
{
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "regions": ["bom1", "sin1"],
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "redirects": [
    {
      "source": "/admin",
      "destination": "/dashboard",
      "permanent": false
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        }
      ]
    }
  ]
}
```

## Database Setup (Supabase)

### Production Database

1. **Create Production Project**
   - Go to Supabase Dashboard
   - Create new project
   - Choose region (Mumbai for Indian users)
   - Set strong database password

2. **Run Migrations**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Link to project
   supabase link --project-ref your-project-ref
   
   # Push migrations
   supabase db push
   ```

3. **Configure Row Level Security (RLS)**
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE customer_meta ENABLE ROW LEVEL SECURITY;
   ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
   ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
   
   -- Create policies
   CREATE POLICY "Users can view own data" ON customer_meta
     FOR SELECT USING (clerk_user_id = auth.jwt() ->> 'sub');
   
   CREATE POLICY "Users can update own data" ON customer_meta
     FOR UPDATE USING (clerk_user_id = auth.jwt() ->> 'sub');
   ```

4. **Set up Storage Buckets**
   ```sql
   -- Create storage buckets
   INSERT INTO storage.buckets (id, name, public) VALUES 
   ('products', 'products', true),
   ('documents', 'documents', false),
   ('avatars', 'avatars', true);
   
   -- Set up storage policies
   CREATE POLICY "Public product images" ON storage.objects
     FOR SELECT USING (bucket_id = 'products');
   
   CREATE POLICY "Users can upload documents" ON storage.objects
     FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

## Authentication Setup (Clerk)

### Production Configuration

1. **Create Production Instance**
   - Go to Clerk Dashboard
   - Create production instance
   - Configure OAuth providers
   - Set up custom domain

2. **Configure Webhooks**
   ```bash
   # Webhook endpoint
   https://your-domain.com/api/webhooks/clerk
   
   # Events to listen for:
   - user.created
   - user.updated
   - user.deleted
   ```

3. **Set up JWT Template**
   ```json
   {
     "sub": "{{user.id}}",
     "email": "{{user.primary_email_address.email_address}}",
     "role": "{{user.unsafe_metadata.accountType}}"
   }
   ```

## Redis Setup (Upstash)

### Production Redis

1. **Create Redis Database**
   - Go to Upstash Console
   - Create new database
   - Choose region close to your users
   - Copy connection details

2. **Configure Connection**
   ```typescript
   // lib/redis.ts
   import { Redis } from '@upstash/redis'
   
   export const redis = new Redis({
     url: process.env.REDIS_URL!,
     token: process.env.REDIS_TOKEN!,
   })
   ```

## Email Setup (Resend)

### Production Configuration

1. **Domain Verification**
   - Add your domain to Resend
   - Configure DNS records
   - Verify domain ownership

2. **Email Templates**
   ```typescript
   // lib/email.ts
   import { Resend } from 'resend'
   
   const resend = new Resend(process.env.RESEND_API_KEY)
   
   export async function sendWelcomeEmail(email: string, name: string) {
     return await resend.emails.send({
       from: 'Cedar <noreply@cedar.com>',
       to: email,
       subject: 'Welcome to Cedar',
       html: `<h1>Welcome ${name}!</h1>`
     })
   }
   ```

## Payment Setup (Razorpay)

### Production Configuration

1. **Activate Live Mode**
   - Complete KYC verification
   - Activate live mode in Razorpay dashboard
   - Get live API keys

2. **Configure Webhooks**
   ```bash
   # Webhook URL
   https://your-domain.com/api/webhooks/razorpay
   
   # Events:
   - payment.captured
   - payment.failed
   - order.paid
   ```

3. **Test Payment Flow**
   ```typescript
   // Test with live credentials
   const options = {
     key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
     amount: amount * 100, // Amount in paise
     currency: 'INR',
     name: 'Cedar Storefront',
     description: 'Order Payment',
     order_id: razorpayOrderId,
     handler: function (response) {
       // Handle successful payment
     }
   }
   ```

## Monitoring & Analytics

### Performance Monitoring

1. **Vercel Analytics**
   ```bash
   # Install Vercel Analytics
   npm install @vercel/analytics
   ```
   
   ```tsx
   // app/layout.tsx
   import { Analytics } from '@vercel/analytics/react'
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     )
   }
   ```

2. **Error Tracking**
   ```typescript
   // lib/error-tracking.ts
   export function trackError(error: Error, context?: any) {
     console.error('Error:', error, context)
     // Send to error tracking service
   }
   ```

### Health Checks

Create health check endpoints:

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database connection
    const { data, error } = await supabase
      .from('customer_meta')
      .select('count')
      .limit(1)
    
    if (error) throw error
    
    // Check Redis connection
    await redis.ping()
    
    return Response.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        redis: 'up'
      }
    })
  } catch (error) {
    return Response.json(
      { 
        status: 'unhealthy',
        error: error.message 
      },
      { status: 500 }
    )
  }
}
```

## Security Checklist

### Pre-deployment Security

- [ ] Environment variables are secure
- [ ] API endpoints have proper validation
- [ ] Database has RLS policies
- [ ] File uploads are validated
- [ ] Rate limiting is implemented
- [ ] CORS is properly configured
- [ ] JWT tokens are validated
- [ ] Webhook signatures are verified

### Post-deployment Security

- [ ] SSL certificate is active
- [ ] Security headers are configured
- [ ] Content Security Policy is set
- [ ] Regular security updates
- [ ] Monitor for vulnerabilities
- [ ] Backup and recovery plan

## Backup & Recovery

### Database Backups

```bash
# Automated backups (Supabase Pro)
# Manual backup
supabase db dump --file backup.sql

# Restore from backup
supabase db reset --file backup.sql
```

### File Storage Backups

```typescript
// Backup storage files
async function backupStorage() {
  const { data: files } = await supabase.storage
    .from('documents')
    .list()
  
  // Download and backup files
  for (const file of files) {
    const { data } = await supabase.storage
      .from('documents')
      .download(file.name)
    
    // Save to backup location
  }
}
```

## Rollback Strategy

### Quick Rollback

```bash
# Rollback to previous deployment
vercel rollback

# Rollback specific deployment
vercel rollback <deployment-url>
```

### Database Rollback

```bash
# Rollback database migration
supabase db reset --to-migration <migration-name>
```

## Performance Optimization

### CDN Configuration

```json
// vercel.json
{
  "headers": [
    {
      "source": "/images/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_customer_meta_clerk_user_id ON customer_meta(clerk_user_id);
CREATE INDEX idx_quotes_user_status ON quotes(clerk_user_id, status);
CREATE INDEX idx_orders_user_created ON orders(clerk_user_id, created_at);
```

## Maintenance

### Regular Tasks

- [ ] Monitor application performance
- [ ] Review error logs
- [ ] Update dependencies
- [ ] Check security vulnerabilities
- [ ] Backup verification
- [ ] Performance optimization
- [ ] User feedback review

### Monthly Tasks

- [ ] Security audit
- [ ] Performance review
- [ ] Cost optimization
- [ ] Feature usage analysis
- [ ] Database cleanup
- [ ] Documentation updates

---

**Last Updated**: December 19, 2024