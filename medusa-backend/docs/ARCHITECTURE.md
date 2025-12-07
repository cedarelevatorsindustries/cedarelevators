# Architecture Overview - Role Sync System

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER LAYER                                 │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
              Individual User            Business User
              (B2C Customer)             (B2B Customer)
                    │                           │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION                                │
│                         Clerk Auth                                   │
│  - Stores: accountType, company, tax_id in unsafeMetadata           │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    STOREFRONT (Next.js)                              │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  RoleSyncProvider (Auto-triggers on login)                    │  │
│  │    ↓                                                           │  │
│  │  POST /api/sync-role                                          │  │
│  │    1. Get user from Clerk                                     │  │
│  │    2. Create/get Medusa customer                              │  │
│  │    3. Write to customer_meta table                            │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  Client-Side:                                                        │
│  - useAccountType() → Detects role                                  │
│  - <BusinessOnly> → Guards components                               │
│  - middleware.ts → Protects routes                                  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    NEON DATABASE (PostgreSQL)                        │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  customer_meta table                                          │  │
│  │  ┌─────────────────────────────────────────────────────────┐ │  │
│  │  │ id              SERIAL PRIMARY KEY                      │ │  │
│  │  │ customer_id     VARCHAR(255)  ← Medusa customer ID     │ │  │
│  │  │ clerk_user_id   VARCHAR(255)  ← Clerk user ID (unique) │ │  │
│  │  │ account_type    VARCHAR(20)   ← "individual"|"business"│ │  │
│  │  │ company_name    VARCHAR(255)  ← Company name (nullable)│ │  │
│  │  │ tax_id          VARCHAR(100)  ← Tax ID (nullable)      │ │  │
│  │  │ is_verified     BOOLEAN       ← Admin verification     │ │  │
│  │  │ created_at      TIMESTAMP                              │ │  │
│  │  │ updated_at      TIMESTAMP                              │ │  │
│  │  └─────────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  Indexes:                                                            │
│  - idx_customer_meta_customer_id                                    │
│  - idx_customer_meta_account_type                                   │
│  - UNIQUE constraint on clerk_user_id                               │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    MEDUSA BACKEND                                    │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Database Layer (src/lib/db/)                                 │  │
│  │  - getCustomerMetaByCustomerId()                              │  │
│  │  - getCustomerMetaByClerkId()                                 │  │
│  │  - getBusinessCustomers()                                     │  │
│  │  - updateCustomerVerification()                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                  │                                   │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Helper Utilities (src/api/utils/)                            │  │
│  │  - isBusinessCustomer(customerId)                             │  │
│  │  - getCustomerAccountType(customerId)                         │  │
│  │  - isVerifiedCustomer(customerId)                             │  │
│  │  - getCompanyName(customerId)                                 │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                  │                                   │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  API Endpoints                                                │  │
│  │                                                               │  │
│  │  Store API (Customer-facing):                                │  │
│  │  - GET /store/customers/sync-role/:id                        │  │
│  │  - POST /store/orders/create-bulk (business only)            │  │
│  │  - POST /store/quotes/request (business only)                │  │
│  │                                                               │  │
│  │  Admin API:                                                   │  │
│  │  - POST /admin/customers/verify                              │  │
│  │  - GET /admin/customers/business?verified=true               │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Sequence

### 1. User Sign Up Flow

```
User fills sign-up form
    ↓
Clerk creates user account
    ↓
accountType stored in Clerk unsafeMetadata
    ↓
User redirected to dashboard
    ↓
RoleSyncProvider triggers
    ↓
POST /api/sync-role called
    ↓
Storefront creates Medusa customer
    ↓
Storefront writes to customer_meta table
    ↓
✅ Sync complete
```

### 2. User Login Flow

```
User logs in via Clerk
    ↓
RoleSyncProvider detects login
    ↓
POST /api/sync-role called
    ↓
Updates customer_meta if needed
    ↓
useAccountType() hook reads role
    ↓
Correct dashboard rendered
```

### 3. Business Feature Access Flow

```
Business user clicks "Request Quote"
    ↓
Storefront: POST /store/quotes/request
    ↓
Medusa: isBusinessCustomer(customerId)
    ↓
Medusa: Query customer_meta table
    ↓
If business → Process quote
If individual → Return 403 Forbidden
```

### 4. Admin Verification Flow

```
Admin views business customers
    ↓
GET /admin/customers/business
    ↓
Admin clicks "Verify" button
    ↓
POST /admin/customers/verify
    ↓
Updates is_verified in customer_meta
    ↓
Business user can now access verified-only features
```

## Component Interaction

### Storefront Components

```
┌─────────────────────────────────────────────────────────────┐
│  Root Layout                                                 │
│  ├── ClerkProvider                                          │
│  │   └── RoleSyncProvider (Auto-syncs on login)            │
│  │       └── Page Content                                   │
│  │           ├── useAccountType() → Client-side detection  │
│  │           ├── <BusinessOnly> → Guards                   │
│  │           └── <IndividualOnly> → Guards                 │
│  └── middleware.ts → Route protection                       │
└─────────────────────────────────────────────────────────────┘
```

### Medusa Backend Components

```
┌─────────────────────────────────────────────────────────────┐
│  API Route Handler                                           │
│  ├── Get customerId from req.auth                           │
│  ├── Call isBusinessCustomer(customerId)                    │
│  │   └── Query customer_meta table                          │
│  ├── Apply business logic                                   │
│  └── Return response                                         │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema Relationships

```
┌─────────────────────────────────────────────────────────────┐
│  Medusa Database (Managed by Medusa)                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  customer table                                       │  │
│  │  - id (Primary Key)                                   │  │
│  │  - email                                              │  │
│  │  - first_name                                         │  │
│  │  - last_name                                          │  │
│  │  - metadata (JSON)                                    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ customer_id (Foreign Key)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Neon Database (Shared - Custom Tables)                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  customer_meta table                                  │  │
│  │  - id (Primary Key)                                   │  │
│  │  - customer_id → References Medusa customer.id       │  │
│  │  - clerk_user_id (Unique)                            │  │
│  │  - account_type                                       │  │
│  │  - company_name                                       │  │
│  │  - tax_id                                             │  │
│  │  - is_verified                                        │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Security Model

### Authentication
- **Clerk** handles user authentication
- **JWT tokens** passed to Medusa backend
- **Session management** handled by Clerk

### Authorization
- **Role stored** in Neon `customer_meta` table
- **Medusa backend** queries role before processing requests
- **Storefront middleware** protects routes client-side
- **API endpoints** validate role server-side

### Data Access
- **Storefront**: Reads/writes to `customer_meta` via Neon client
- **Medusa Backend**: Reads from `customer_meta` via Neon client
- **No direct Medusa customer table modification** (uses Medusa SDK)

## Performance Considerations

### Caching Strategy
- Customer role cached in client-side hook
- Database queries use indexes for fast lookups
- Consider adding Redis cache for frequently accessed roles

### Database Indexes
```sql
-- Fast lookup by customer_id (most common query)
CREATE INDEX idx_customer_meta_customer_id ON customer_meta(customer_id);

-- Fast filtering by account_type
CREATE INDEX idx_customer_meta_account_type ON customer_meta(account_type);

-- Unique constraint ensures no duplicate Clerk users
CREATE UNIQUE INDEX idx_customer_meta_clerk_user_id ON customer_meta(clerk_user_id);
```

### Query Optimization
- Use `LIMIT 1` for single customer queries
- Index on `account_type` for business customer lists
- Connection pooling via Neon serverless driver

## Scalability

### Horizontal Scaling
- **Storefront**: Can deploy multiple Next.js instances
- **Medusa Backend**: Can deploy multiple Medusa instances
- **Database**: Neon handles connection pooling and scaling

### Vertical Scaling
- Neon database can scale compute resources
- Add read replicas for heavy read workloads
- Consider caching layer (Redis) for high traffic

## Monitoring & Debugging

### Logs to Check
- **Storefront**: Browser console for sync status
- **Medusa Backend**: Server logs for role queries
- **Database**: Neon dashboard for query performance

### Common Debug Points
1. Check if `customer_meta` record exists
2. Verify `customer_id` matches between systems
3. Confirm `DATABASE_URL` is same in both apps
4. Test database connection independently

### Health Checks
```bash
# Test Neon connection
node -e "const {neon} = require('@neondatabase/serverless'); const sql = neon(process.env.DATABASE_URL); sql\`SELECT NOW()\`.then(console.log)"

# Test Medusa endpoint
curl http://localhost:9000/store/customers/sync-role/cus_test123

# Check customer_meta data
psql $DATABASE_URL -c "SELECT * FROM customer_meta LIMIT 5;"
```
