# System Architecture

Complete architecture overview of the Cedar E-Commerce platform.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Layer                           │
│  Individual Customers (B2C)  |  Business Customers (B2B)    │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    Authentication                            │
│                      Clerk Auth                              │
│  - User management                                           │
│  - Role storage (unsafeMetadata)                            │
│  - Session management                                        │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                 Next.js Storefront                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Client Side                                         │   │
│  │  - React components                                  │   │
│  │  - Role detection hooks                              │   │
│  │  - Guard components                                  │   │
│  │  - Protected routes                                  │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Server Side                                         │   │
│  │  - API routes (/api/sync-role)                       │   │
│  │  - Server actions                                    │   │
│  │  - Middleware (route protection)                     │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              Neon PostgreSQL Database                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  customer_meta table (Shared)                        │   │
│  │  - customer_id (Medusa)                              │   │
│  │  - clerk_user_id (Clerk)                             │   │
│  │  - account_type (individual/business)                │   │
│  │  - company_name, tax_id                              │   │
│  │  - is_verified                                       │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                  Medusa Backend                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Store API (Customer-facing)                         │   │
│  │  - Get customer role                                 │   │
│  │  - Bulk orders                                       │   │
│  │  - Quote requests                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Admin API                                           │   │
│  │  - Verify customers                                  │   │
│  │  - List business customers                           │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Helper Utilities                                    │   │
│  │  - isBusinessCustomer()                              │   │
│  │  - getCustomerAccountType()                          │   │
│  │  - isVerifiedCustomer()                              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### User Sign Up Flow

```
1. User visits storefront
   ↓
2. Clicks "Sign Up"
   ↓
3. Clerk modal opens
   ↓
4. User selects account type (Individual/Business)
   ↓
5. Clerk creates user account
   ↓
6. accountType stored in Clerk unsafeMetadata
   ↓
7. User redirected to dashboard
   ↓
8. RoleSyncProvider triggers
   ↓
9. POST /api/sync-role called
   ↓
10. Storefront creates Medusa customer
    ↓
11. Storefront writes to customer_meta table
    ↓
12. ✅ Sync complete
```

### User Login Flow

```
1. User logs in via Clerk
   ↓
2. Clerk session established
   ↓
3. RoleSyncProvider detects login
   ↓
4. POST /api/sync-role called
   ↓
5. Updates customer_meta if needed
   ↓
6. useAccountType() hook reads role
   ↓
7. Correct dashboard rendered
```

### Business Feature Access Flow

```
1. Business user clicks "Request Quote"
   ↓
2. Storefront: POST /store/quotes/request
   ↓
3. Medusa: isBusinessCustomer(customerId)
   ↓
4. Medusa: Query customer_meta table
   ↓
5. If business → Process quote
   If individual → Return 403 Forbidden
```

---

## Component Architecture

### Storefront Components

```
cedar-storefront/
├── src/
│   ├── app/
│   │   ├── (auth)/                    # Auth routes
│   │   ├── (dashboard)/               # Dashboard routes
│   │   ├── api/sync-role/             # Sync API
│   │   └── layout.tsx                 # Root layout
│   ├── components/
│   │   ├── guards/                    # Role-based guards
│   │   │   ├── AuthOnly.tsx
│   │   │   ├── BusinessOnly.tsx
│   │   │   └── IndividualOnly.tsx
│   │   └── providers/
│   │       └── role-sync-provider.tsx # Auto-sync
│   ├── lib/
│   │   ├── auth/
│   │   │   └── server.ts              # Server auth utils
│   │   ├── db/
│   │   │   ├── index.ts               # Neon client
│   │   │   └── customer-meta.ts       # DB queries
│   │   ├── hooks/
│   │   │   ├── use-account-type.ts    # Role detection
│   │   │   └── use-role-sync.ts       # Sync hook
│   │   └── medusa/
│   │       └── client.ts              # Medusa SDK
│   ├── modules/
│   │   └── dashboard/
│   │       └── templates/             # Dashboard templates
│   └── middleware.ts                  # Route protection
```

### Backend Components

```
medusa-backend/
├── src/
│   ├── api/
│   │   ├── admin/
│   │   │   └── customers/
│   │   │       ├── verify/            # Verify endpoint
│   │   │       └── business/          # List endpoint
│   │   ├── store/
│   │   │   ├── customers/sync-role/   # Get role
│   │   │   ├── orders/create-bulk/    # Bulk orders
│   │   │   └── quotes/request/        # Quotes
│   │   └── utils/
│   │       └── customer-helpers.ts    # Helper functions
│   ├── lib/
│   │   └── db/
│   │       ├── index.ts               # Neon client
│   │       └── customer-meta.ts       # DB queries
│   └── types/
│       └── customer-meta.ts           # TypeScript types
```

---

## Database Schema

### customer_meta Table

```sql
CREATE TABLE customer_meta (
  id SERIAL PRIMARY KEY,
  customer_id VARCHAR(255) NOT NULL,      -- Medusa customer ID
  clerk_user_id VARCHAR(255) NOT NULL UNIQUE,  -- Clerk user ID
  account_type VARCHAR(20) NOT NULL DEFAULT 'individual',
  company_name VARCHAR(255),
  tax_id VARCHAR(100),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_customer_meta_customer_id ON customer_meta(customer_id);
CREATE INDEX idx_customer_meta_account_type ON customer_meta(account_type);
```

### Relationships

```
Clerk User (clerk_user_id)
    ↓
customer_meta.clerk_user_id (UNIQUE)
    ↓
customer_meta.customer_id
    ↓
Medusa Customer (customer.id)
```

---

## Security Model

### Authentication
- **Clerk** handles user authentication
- **JWT tokens** for API requests
- **Session-based** for storefront
- **Secure cookies** for session storage

### Authorization
- **Role stored** in Neon database (single source of truth)
- **Server-side validation** on all protected endpoints
- **Client-side guards** for UX only (not security)
- **Middleware protection** for routes

### Data Access
- **Storefront**: Read/write to customer_meta
- **Medusa Backend**: Read from customer_meta
- **No direct Medusa customer table modification**

---

## Performance Considerations

### Caching
- Customer role cached in client-side hook
- Database queries use indexes
- Consider Redis for high-traffic scenarios

### Database Optimization
- Indexes on frequently queried columns
- Connection pooling via Neon serverless
- Efficient query patterns

### API Performance
- Minimal database queries per request
- Async/await for non-blocking operations
- Error handling to prevent cascading failures

---

## Scalability

### Horizontal Scaling
- **Storefront**: Multiple Next.js instances
- **Backend**: Multiple Medusa instances
- **Database**: Neon handles scaling automatically

### Load Balancing
- Use load balancer for multiple instances
- Session affinity not required (stateless)
- Database connection pooling

### Monitoring
- Log all role sync operations
- Track API response times
- Monitor database query performance

---

## Technology Stack

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Clerk** - Authentication
- **Neon** - PostgreSQL database

### Backend
- **Medusa 2.x** - E-commerce framework
- **TypeScript** - Type safety
- **Neon** - PostgreSQL database
- **Redis** - Caching (Upstash)

### Infrastructure
- **Neon** - Serverless PostgreSQL
- **Vercel** - Storefront hosting (recommended)
- **Railway/Render** - Backend hosting (recommended)

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Users                                │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                      CDN / Load Balancer                     │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌──────────────┐      ┌──────────────┐
│  Storefront  │      │   Backend    │
│  (Vercel)    │      │  (Railway)   │
└──────┬───────┘      └──────┬───────┘
       │                     │
       └──────────┬──────────┘
                  │
                  ▼
        ┌─────────────────┐
        │  Neon Database  │
        │   (Shared)      │
        └─────────────────┘
```

---

## Error Handling

### Client-Side
- Try-catch blocks for async operations
- User-friendly error messages
- Fallback UI for errors
- Retry logic for failed requests

### Server-Side
- Comprehensive error logging
- Proper HTTP status codes
- Detailed error messages (dev only)
- Generic messages (production)

---

## Monitoring & Logging

### What to Monitor
- Role sync success/failure rates
- API response times
- Database query performance
- Error rates by endpoint
- User authentication events

### Logging Strategy
- Log all role changes
- Log failed sync attempts
- Log permission denials
- Log database errors

---

## Future Enhancements

### Planned Features
- Webhook support for real-time sync
- Redis caching layer
- Advanced analytics
- Multi-tenant support
- Role hierarchy (admin, manager, member)

### Scalability Improvements
- Read replicas for database
- CDN for static assets
- Edge functions for auth
- GraphQL API layer

---

For implementation details:
- Getting Started: [GETTING_STARTED.md](GETTING_STARTED.md)
- Role Sync: [ROLE_SYNC.md](ROLE_SYNC.md)
- API Reference: [API_REFERENCE.md](API_REFERENCE.md)
