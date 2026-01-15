# Tech Stack Overview

This document outlines the current technology stack and architecture of the Cedar Storefront application.

## Core Technologies

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

### Backend & Database
- **Supabase** - PostgreSQL database with real-time features
- **Supabase Auth** - Authentication (integrated with Clerk)
- **Supabase Storage** - File storage for images and assets

### Authentication
- **Clerk** - User authentication and management
- **Role-based access** - Individual vs Business user types

### Caching & Performance
- **Redis (Upstash)** - Session storage and caching
- **Next.js ISR** - Incremental Static Regeneration

### Email & Notifications
- **Resend** - Transactional emails
- **Pusher** - Real-time notifications (optional)

### Payments
- **Razorpay** - Payment processing for Indian market

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │    Supabase     │    │      Redis      │
│                 │    │                 │    │                 │
│  • App Router   │◄──►│  • PostgreSQL   │    │  • Sessions     │
│  • TypeScript   │    │  • Auth         │    │  • Cache        │
│  • Tailwind     │    │  • Storage      │    │  • Rate Limit   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      Clerk      │    │     Resend      │    │    Razorpay     │
│                 │    │                 │    │                 │
│  • User Auth    │    │  • Emails       │    │  • Payments     │
│  • Roles        │    │  • Templates    │    │  • Webhooks     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Key Features

### User Management
- **Clerk Integration**: Secure authentication with social logins
- **Role-based Access**: Individual vs Business user types
- **Profile Management**: Company details, tax information
- **Account Verification**: Business account verification flow

### Product Catalog
- **Supabase Database**: Product information and inventory
- **Image Storage**: Supabase Storage for product images
- **Search & Filtering**: Advanced product discovery
- **Categories**: Hierarchical product organization

### E-commerce Features
- **Shopping Cart**: Redis-based cart persistence
- **Checkout Flow**: Integrated with Razorpay
- **Order Management**: Order tracking and history
- **Bulk Orders**: Business-specific features

### Business Features
- **Quote System**: Request for quotes (RFQ)
- **Bulk Pricing**: Tiered pricing for business users
- **Tax Invoices**: GST-compliant invoicing
- **Team Management**: Multi-user business accounts

## Environment Configuration

### Required Environment Variables

```env
# Next.js
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Redis (Upstash)
REDIS_URL=redis://...
REDIS_TOKEN=...

# Resend (Email)
RESEND_API_KEY=re_...

# Razorpay (Payments)
NEXT_PUBLIC_RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
```

## Database Schema

### Core Tables

```sql
-- User metadata synced from Clerk
CREATE TABLE customer_meta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('individual', 'business')),
  company_name TEXT,
  tax_id TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product catalog
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  bulk_price DECIMAL(10,2),
  category_id UUID REFERENCES categories(id),
  image_url TEXT,
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES categories(id),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(255) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  payment_id TEXT,
  shipping_address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Development Workflow

### Local Development
```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Start development server
pnpm dev
```

### Database Setup
1. Create Supabase project
2. Run migrations in Supabase SQL editor
3. Set up RLS policies
4. Configure storage buckets

### Authentication Setup
1. Create Clerk application
2. Configure OAuth providers
3. Set up webhooks for user sync
4. Configure role metadata

## Deployment

### Vercel Deployment
- Automatic deployments from main branch
- Environment variables configured in Vercel dashboard
- Edge functions for API routes

### Database Migrations
- Supabase migrations via CLI
- Version controlled schema changes
- Automated backups

## Monitoring & Analytics

### Performance Monitoring
- Vercel Analytics for Core Web Vitals
- Supabase Dashboard for database metrics
- Redis monitoring via Upstash dashboard

### Error Tracking
- Next.js built-in error boundaries
- Supabase logs for database errors
- Clerk dashboard for auth issues

## Security Considerations

### Data Protection
- Row Level Security (RLS) in Supabase
- Clerk's security features for auth
- Environment variable protection

### API Security
- Rate limiting with Redis
- Input validation and sanitization
- CORS configuration

### Payment Security
- Razorpay's secure payment flow
- Webhook signature verification
- PCI compliance through Razorpay

---

**Last Updated**: December 19, 2024