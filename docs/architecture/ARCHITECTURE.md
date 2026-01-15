# Architecture Overview

## System Architecture

Cedar Storefront is a **Next.js 16 B2B/B2C e-commerce platform** currently in development with:

- **Frontend**: Next.js 16.0.10 with App Router, React 19, TypeScript 5, Tailwind CSS 4
- **Authentication**: Clerk 6.35.5 (fully implemented)
- **Database**: Supabase (configured, partially implemented) + Medusa backend (partial integration)
- **Real-time**: Pusher 8.4.0 (configured, minimal usage)
- **Payments**: Razorpay (configured, not implemented)
- **Images**: Cloudinary (configured)

**⚠️ Development Status**: ~40% production-ready - Strong frontend, incomplete backend

## Application Structure

```
cedar-storefront/
├── src/
│   ├── app/                    # Next.js App Router (40+ routes)
│   │   ├── (auth)/            # 9 auth routes (sign-in, sign-up, business-signup, etc.)
│   │   ├── (checkout)/        # Checkout flow (2 routes)
│   │   ├── (main)/            # Main app (11 routes: dashboard, profile, cart, etc.)
│   │   ├── admin/             # Admin panel (10+ management sections)
│   │   └── api/               # API endpoints (only 2 implemented)
│   ├── components/            # UI components (100+ components)
│   │   ├── common/            # 10 reusable components
│   │   ├── guards/            # 3 access control components
│   │   ├── providers/         # 2 context providers
│   │   └── ui/                # UI library components
│   ├── lib/
│   │   ├── auth/              # Clerk integration (server/client)
│   │   ├── supabase/          # Supabase client setup
│   │   ├── actions/           # Server actions (mostly TODOs)
│   │   ├── hooks/             # 8 custom hooks
│   │   ├── data/              # Data fetching + demo data fallback
│   │   ├── types/             # TypeScript definitions
│   │   └── utils/             # Utility functions
│   ├── modules/               # 12 feature modules
│   │   ├── admin/             # Admin dashboard & management
│   │   ├── auth/              # Auth flows
│   │   ├── cart/              # Shopping cart
│   │   ├── catalog/           # Product browsing
│   │   ├── checkout/          # Checkout process
│   │   ├── dashboard/         # User dashboards
│   │   ├── home/              # Homepage
│   │   ├── orders/            # Order management
│   │   ├── products/          # Product details
│   │   ├── profile/           # User profiles
│   │   ├── quote/             # Quote management (UI only)
│   │   └── wishlist/          # Wishlist feature
│   └── middleware.ts          # Route protection (fully implemented)
└── docs/                      # Documentation
```

## User Types & Access Control

**Implementation Status**: ✅ Fully implemented in middleware and auth system

### Guest Users
- ✅ Browse products and categories
- ✅ Request quotes (basic form UI)
- ✅ Contact support
- ✅ No account required

### Individual Users  
- ✅ All guest features
- ✅ Personal profile management (UI)
- ⚠️ Order history (UI only, no backend)
- ✅ Wishlist functionality (partial)
- ❌ Quote timeline (UI exists, no data)

### Business Users (Unverified)
- ✅ All individual features
- ✅ Business profile setup (UI)
- ❌ Document upload (not implemented)
- ❌ Bulk quote features (UI only)
- ❌ Quote templates (not implemented)

### Business Users (Verified)
- ❌ Verification workflow not implemented
- ❌ Payment methods not implemented
- ❌ Invoice system not implemented
- ❌ Advanced features not implemented

## Key Features

### ✅ Authentication & Authorization (Fully Implemented)
- Clerk-based authentication with social logins
- Role-based access control (Individual/Business)
- Metadata storage in Clerk (accountType, company)
- Route protection middleware
- User sync to Medusa backend

### ⚠️ Product Catalog (Partially Implemented)
- ✅ Product listing with demo data fallback
- ✅ Category browsing structure
- ✅ Product detail pages
- ❌ Advanced search and filtering (UI only)
- ❌ Product variants (structure exists)
- ✅ Cloudinary image integration

### ❌ Quote Management (UI Only, No Backend)
- ✅ Quote request forms (UI)
- ❌ Template-based quotes (not implemented)
- ❌ Bulk quote upload (not implemented)
- ❌ Quote-to-order conversion (TODO comments)
- ❌ Timeline tracking (UI exists, no data)

### ⚠️ Order Management (Partial Implementation)
- ✅ Shopping cart UI and context
- ⚠️ Cart persistence (server actions with TODOs)
- ❌ Payment integration (configured, not implemented)
- ❌ Order tracking (UI only)
- ❌ Order history (no backend)

### ❌ Business Features (Not Implemented)
- ✅ Business profile UI
- ❌ Document verification workflow
- ❌ Bulk operations
- ❌ Invoice system
- ❌ Team management
- ⚠️ Analytics (charts UI only)

## Database Schema

**Status**: ⚠️ Configured but not fully implemented

### Supabase Tables (Referenced in Code)
```sql
-- Products (partially implemented)
products (
  id, title, handle, description, price, images,
  category_id, stock_quantity, is_active, created_at
)

-- Categories (partially implemented)  
categories (
  id, name, slug, parent_id, image_url, is_active
)

-- Cart items (server actions exist, minimal implementation)
cart_items (
  id, cart_id, product_id, quantity, created_at
)

-- Orders (referenced, not implemented)
orders (
  id, clerk_user_id, status, total_amount, created_at
)

-- Quotes (referenced, not implemented)
quotes (
  id, clerk_user_id, status, items, total_amount
)
```

### Medusa Backend Integration
- Customer sync via `/api/sync-role`
- Metadata sync to `customer_meta` table
- **Status**: Partial integration, endpoints exist but incomplete

### Demo Data Fallback System
- Located in `src/lib/data/demo/`
- JSON files for products, categories, orders, carts
- Used when `isDemoMode()` returns true
- Allows development without database connection

## API Design

**Status**: ⚠️ Minimal implementation - only 2 routes exist

### ✅ Implemented API Routes
```typescript
POST /api/sync-role
  - Syncs Clerk user to Medusa backend
  - Creates/updates customer in Medusa
  - Syncs metadata to Medusa customer_meta table
  - Returns: { success, customer_id, clerk_user_id, account_type }

POST /api/auth/update-role  
  - Updates user's accountType in Clerk metadata
  - Accepts: { accountType, companyName }
  - Returns: { success, userId, accountType }
```

### ❌ Missing API Routes (Referenced but not implemented)
- `/api/products` - Product listing
- `/api/categories` - Category hierarchy  
- `/api/quotes` - Quote management
- `/api/orders` - Order management
- `/api/cart` - Cart operations
- `/api/checkout` - Checkout processing
- `/api/payments` - Payment processing
- `/api/webhooks` - Webhook handlers

### Data Fetching Pattern
- **Server Components** for initial data (products, categories)
- **Server Actions** for mutations (cart, quotes) - mostly TODOs
- **Client hooks** for real-time data (notifications, cart context)
- **Demo data fallback** when database unavailable

## Security Considerations

### Data Protection
- Row Level Security (RLS) in Supabase
- Environment variable protection
- Input validation and sanitization
- CORS configuration

### Authentication Security
- Clerk's enterprise-grade security
- JWT token validation
- Session management with Redis
- Rate limiting on sensitive endpoints

### Payment Security
- Razorpay's PCI-compliant infrastructure
- Webhook signature verification
- Secure payment flow
- No sensitive data storage

## Performance Optimization

### Frontend
- Next.js App Router with RSC
- Image optimization with Next.js Image
- Code splitting by route
- Lazy loading for heavy components

### Backend
- Supabase connection pooling
- Redis caching for frequently accessed data
- Database query optimization
- CDN for static assets

### Monitoring
- Vercel Analytics for performance metrics
- Supabase Dashboard for database monitoring
- Error tracking and logging
- Real-time performance monitoring

---

**Last Updated**: December 19, 2024