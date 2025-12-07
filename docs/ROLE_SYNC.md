# Role Sync System

Complete guide to the B2B/B2C role synchronization system.

---

## Overview

The role sync system automatically synchronizes customer types (Individual vs Business) between Clerk authentication, Next.js storefront, and Medusa backend using a shared Neon PostgreSQL database.

---

## Architecture

```
User Signs Up (Clerk)
    ↓
Storefront: Auto-sync on login
    ↓
Neon Database (customer_meta table)
    ↓
Medusa Backend: Read customer role
    ↓
Apply role-based logic
```

---

## Customer Types

### Individual (B2C)
- Standard e-commerce features
- Regular pricing
- Single-item orders
- Personal account

### Business (B2B)
- Bulk order capabilities
- Quote requests
- Business pricing (discounts)
- Invoice generation
- Team management
- Company information

---

## How It Works

### 1. User Sign Up
- User selects account type in Clerk
- Role stored in Clerk metadata
- User redirected to dashboard

### 2. Automatic Sync
- `RoleSyncProvider` triggers on login
- Calls `/api/sync-role` endpoint
- Creates Medusa customer (if new)
- Writes to `customer_meta` table

### 3. Role Enforcement
- Storefront: Client-side hooks and middleware
- Backend: Server-side validation
- Database: Single source of truth

---

## Storefront Implementation

### Client-Side Hook

```typescript
import { useAccountType } from "@/lib/hooks/use-account-type"

export default function Dashboard() {
  const { isBusiness, isIndividual, companyName } = useAccountType()
  
  if (isBusiness) {
    return <BusinessDashboard company={companyName} />
  }
  
  return <IndividualDashboard />
}
```

### Route Protection

```typescript
// middleware.ts
if (isBusiness Only Route && !isBusiness) {
  return NextResponse.redirect('/dashboard')
}
```

### Guard Components

```tsx
<BusinessOnly>
  <BulkOrderButton />
</BusinessOnly>

<IndividualOnly>
  <StandardCheckout />
</IndividualOnly>
```

---

## Backend Implementation

### Check Customer Type

```typescript
import { isBusinessCustomer } from "./utils/customer-helpers"

export const POST = async (req, res) => {
  const customerId = (req as any).auth?.actor_id
  
  if (!await isBusinessCustomer(customerId)) {
    return res.status(403).json({
      message: "Business customers only"
    })
  }
  
  // Process business feature...
}
```

### Get Account Type

```typescript
import { getCustomerAccountType } from "./utils/customer-helpers"

const accountType = await getCustomerAccountType(customerId)
// Returns: "individual" | "business" | null

if (accountType === "business") {
  // Apply business pricing
}
```

### Require Verification

```typescript
import { isVerifiedCustomer } from "./utils/customer-helpers"

if (!await isVerifiedCustomer(customerId)) {
  return res.status(403).json({
    message: "Account verification required"
  })
}
```

---

## Database Schema

```sql
customer_meta table:
- id (serial)
- customer_id (varchar) → Medusa customer ID
- clerk_user_id (varchar) → Clerk user ID (unique)
- account_type (varchar) → "individual" | "business"
- company_name (varchar) → Company name (nullable)
- tax_id (varchar) → Tax ID (nullable)
- is_verified (boolean) → Admin verification status
- created_at (timestamp)
- updated_at (timestamp)
```

---

## API Endpoints

### Storefront API

#### POST /api/sync-role
Syncs user role from Clerk to database (automatic)

### Medusa Store API

#### GET /store/customers/sync-role/:customerId
Get customer role and metadata

**Response:**
```json
{
  "success": true,
  "data": {
    "customer_id": "cus_123",
    "account_type": "business",
    "company_name": "Acme Corp",
    "is_verified": true
  }
}
```

### Medusa Admin API

#### POST /admin/customers/verify
Verify a business customer

**Body:**
```json
{
  "customerId": "cus_123",
  "isVerified": true
}
```

#### GET /admin/customers/business
List all business customers

**Query:** `?verified=true` for verified only

---

## Helper Functions

### Storefront

```typescript
// Client-side
const { isBusiness, isIndividual, companyName } = useAccountType()

// Server-side
const userType = await getUserType() // "guest" | "individual" | "business"
const company = await getCompanyName()
```

### Backend

```typescript
// Check type
await isBusinessCustomer(customerId)
await isIndividualCustomer(customerId)

// Get info
await getCustomerAccountType(customerId)
await getCompanyName(customerId)
await isVerifiedCustomer(customerId)

// Get full metadata
await getCustomerMeta(customerId)
```

---

## Protected Features

### Business-Only Routes (Storefront)
- `/quotes` - Quote requests
- `/bulk-orders` - Bulk order creation
- `/invoices` - Invoice management
- `/team` - Team member management
- `/company` - Company settings
- `/analytics` - Business analytics

### Business-Only Endpoints (Backend)
- `POST /store/orders/create-bulk` - Create bulk orders
- `POST /store/quotes/request` - Request quotes
- Requires verification for sensitive operations

---

## Admin Verification

### Purpose
- Verify business customers before granting full access
- Prevent fraud and abuse
- Ensure legitimate business accounts

### Process
1. Business user signs up
2. Admin reviews in admin panel
3. Admin verifies customer via API
4. Customer gains access to verified-only features

### Implementation

```typescript
// Admin endpoint
POST /admin/customers/verify
{
  "customerId": "cus_123",
  "isVerified": true
}

// Check in business logic
if (!await isVerifiedCustomer(customerId)) {
  return res.status(403).json({
    message: "Account verification required"
  })
}
```

---

## Testing

### Test User Signup
1. Sign up at http://localhost:3000
2. Check browser console for sync status
3. Verify in database: `SELECT * FROM customer_meta;`

### Test Role Enforcement
1. Sign up as individual user
2. Try accessing `/quotes` → Should redirect
3. Sign up as business user
4. Access `/quotes` → Should work

### Test Backend
```bash
# Get customer role
curl http://localhost:9000/store/customers/sync-role/cus_123

# List business customers
curl http://localhost:9000/admin/customers/business

# Verify customer
curl -X POST http://localhost:9000/admin/customers/verify \
  -H "Content-Type: application/json" \
  -d '{"customerId":"cus_123","isVerified":true}'
```

---

## Troubleshooting

### Sync Not Working
- Check browser console for errors
- Verify `DATABASE_URL` is same in both apps
- Ensure `customer_meta` table exists

### Role Not Detected
- Clear browser cache and cookies
- Re-login to trigger sync
- Check database for customer record

### Permission Denied
- Verify customer type in database
- Check if verification is required
- Ensure middleware is configured

---

## Best Practices

1. **Always validate on server-side** - Client-side checks are for UX only
2. **Use verification for sensitive features** - Protect high-value operations
3. **Log role changes** - Track when roles are updated
4. **Handle edge cases** - Guest users, missing data, etc.
5. **Test both paths** - Individual and business user flows

---

For more details:
- Storefront implementation: `cedar-storefront/docs/`
- Backend implementation: `medusa-backend/docs/`
- API reference: [API_REFERENCE.md](API_REFERENCE.md)
