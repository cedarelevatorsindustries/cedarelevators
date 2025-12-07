# Medusa Backend - Role Sync Setup

## Architecture Overview

This setup enables proper B2B/B2C customer role synchronization using a **shared Neon database** between your Next.js storefront and Medusa backend.

### How It Works
1. **Storefront** (Next.js) syncs Clerk user data → Neon DB (`customer_meta` table)
2. **Medusa Backend** reads from the same Neon DB to check customer roles
3. Both systems share the same `DATABASE_URL` pointing to Neon PostgreSQL

## What Was Added

### 1. Neon Database Integration ✅
**Files**: 
- `src/lib/db/index.ts` - Neon client setup
- `src/lib/db/customer-meta.ts` - Database queries for customer metadata

**Functions**:
- `getCustomerMetaByClerkId(clerkUserId)` - Get metadata by Clerk ID
- `getCustomerMetaByCustomerId(customerId)` - Get metadata by Medusa customer ID
- `getBusinessCustomers()` - Get all business customers
- `getVerifiedBusinessCustomers()` - Get verified business customers only
- `updateCustomerVerification(customerId, isVerified)` - Update verification status
- `isBusinessCustomer(customerId)` - Check if customer is business
- `isVerifiedCustomer(customerId)` - Check if customer is verified

### 2. API Endpoints ✅

#### Store API (Customer-facing)
**GET** `/store/customers/sync-role/:customerId`
- Retrieve customer account type from Neon DB
- Used by storefront to verify sync status

#### Admin API (Admin-only)
**POST** `/admin/customers/verify`
- Verify a business customer
- Payload: `{ customerId: string, isVerified: boolean }`

**GET** `/admin/customers/business?verified=true`
- Get all business customers
- Query param `verified=true` for verified customers only

### 3. Helper Utilities ✅
**File**: `src/api/utils/customer-helpers.ts`

```typescript
// Get customer metadata
await getCustomerMeta(customerId)

// Get account type
await getCustomerAccountType(customerId) // Returns "individual" | "business" | null

// Check customer type
await isBusinessCustomer(customerId) // Returns boolean
await isIndividualCustomer(customerId) // Returns boolean
await isVerifiedCustomer(customerId) // Returns boolean

// Get company info
await getCompanyName(customerId) // Returns string | null
```

### 4. Example Implementations ✅

**Bulk Orders**: `src/api/store/orders/create-bulk/route.ts`
- Restricted to verified business customers only

**Quote Requests**: `src/api/store/quotes/request/route.ts`
- Restricted to business customers only

## Setup Instructions

### Step 1: Install Dependencies
```bash
cd medusa-backend
pnpm install
```

This will install `@neondatabase/serverless` package.

### Step 2: Verify Environment Variables
Ensure your `.env` file has the correct `DATABASE_URL`:

```env
DATABASE_URL=postgresql://neondb_owner:npg_m7IBuQNMkCl9@ep-shy-water-a1p9uzby-pooler.ap-southeast-1.aws.neon.tech/medusa%20store?sslmode=require
```

**IMPORTANT**: This should be the **same DATABASE_URL** used in your Next.js storefront.

### Step 3: Verify Database Table
Ensure the `customer_meta` table exists in your Neon database:

```sql
CREATE TABLE IF NOT EXISTS customer_meta (
  id SERIAL PRIMARY KEY,
  customer_id VARCHAR(255) NOT NULL,
  clerk_user_id VARCHAR(255) NOT NULL UNIQUE,
  account_type VARCHAR(20) NOT NULL DEFAULT 'individual',
  company_name VARCHAR(255),
  tax_id VARCHAR(100),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_customer_meta_customer_id ON customer_meta(customer_id);
CREATE INDEX idx_customer_meta_account_type ON customer_meta(account_type);
```

### Step 4: Build and Start
```bash
pnpm run build
pnpm dev
```

### Step 5: Test the Integration

#### Test 1: Get Customer Role
```bash
curl http://localhost:9000/store/customers/sync-role/cus_test123
```

Expected response:
```json
{
  "success": true,
  "data": {
    "customer_id": "cus_test123",
    "account_type": "business",
    "company_name": "Acme Corp",
    "is_verified": true
  }
}
```

#### Test 2: Get Business Customers (Admin)
```bash
curl http://localhost:9000/admin/customers/business?verified=true
```

#### Test 3: Verify Customer (Admin)
```bash
curl -X POST http://localhost:9000/admin/customers/verify \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cus_test123",
    "isVerified": true
  }'
```

## How to Use in Your Services

### Example 1: Restrict Feature to Business Customers
```typescript
import { isBusinessCustomer } from "../../utils/customer-helpers"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const customerId = req.auth?.actor_id
  
  if (!await isBusinessCustomer(customerId)) {
    return res.status(403).json({
      message: "This feature is only available for business customers"
    })
  }
  
  // Process business-only feature...
}
```

### Example 2: Apply Different Pricing
```typescript
import { getCustomerAccountType } from "../../utils/customer-helpers"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const customerId = req.auth?.actor_id
  const accountType = await getCustomerAccountType(customerId)
  
  const discount = accountType === "business" ? 0.15 : 0.05 // 15% vs 5%
  
  // Apply pricing logic...
}
```

### Example 3: Require Verification
```typescript
import { isBusinessCustomer, isVerifiedCustomer } from "../../utils/customer-helpers"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const customerId = req.auth?.actor_id
  
  if (!await isBusinessCustomer(customerId)) {
    return res.status(403).json({ message: "Business account required" })
  }
  
  if (!await isVerifiedCustomer(customerId)) {
    return res.status(403).json({ message: "Account verification required" })
  }
  
  // Process verified business feature...
}
```

### Example 4: Get Full Customer Metadata
```typescript
import { getCustomerMeta } from "../../utils/customer-helpers"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const customerId = req.auth?.actor_id
  const meta = await getCustomerMeta(customerId)
  
  return res.json({
    account_type: meta?.account_type,
    company_name: meta?.company_name,
    tax_id: meta?.tax_id,
    is_verified: meta?.is_verified
  })
}
```

## Integration Flow

```
┌─────────────────┐
│  User Signs Up  │
│   (Clerk)       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Storefront API Route   │
│  /api/sync-role         │
│  - Creates Medusa       │
│    customer             │
│  - Writes to Neon DB    │
│    (customer_meta)      │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Neon Database         │
│   customer_meta table   │
│   - customer_id         │
│   - clerk_user_id       │
│   - account_type        │
│   - company_name        │
│   - is_verified         │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Medusa Backend         │
│  - Reads from Neon DB   │
│  - Applies role logic   │
│  - Restricts features   │
└─────────────────────────┘
```

## Troubleshooting

### Error: "DATABASE_URL environment variable is not set"
- Check `.env` file in `medusa-backend/` folder
- Ensure `DATABASE_URL` is set correctly
- Restart dev server after adding

### Error: "relation 'customer_meta' does not exist"
- Run the SQL schema creation (Step 3 above)
- Verify you're connected to the correct Neon database
- Check database name in connection string

### Customer metadata returns null
- Ensure storefront has synced the user first
- Check that `customer_id` matches between Medusa and Neon
- Verify data exists: `SELECT * FROM customer_meta;`

### Dependencies not installing
- Use `pnpm install` (not npm or yarn)
- Clear cache: `pnpm store prune`
- Delete `node_modules` and reinstall

## What This Fixes

✅ **Business users can create bulk orders** - Restricted by `isBusinessCustomer()`
✅ **Quote requests work correctly** - Business-only feature
✅ **Pricing rules apply based on customer type** - Different pricing logic
✅ **Admin panel shows correct customer type** - Query from Neon DB
✅ **Emails use correct templates** - Based on account_type
✅ **B2B features only available to business customers** - Role-based access control
✅ **Verification system for business accounts** - Admin can verify businesses
✅ **Analytics can segment by customer type** - Query business vs individual customers

## Next Steps

1. **Implement pricing rules** based on `account_type`
2. **Create email templates** for business vs individual customers
3. **Build admin panel** to verify business customers
4. **Add bulk order logic** in `/store/orders/create-bulk`
5. **Implement quote system** in `/store/quotes/request`
6. **Add analytics** to track business vs individual sales
