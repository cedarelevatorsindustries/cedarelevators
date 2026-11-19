# Role Sync System - Clerk to Supabase

This document explains how the role synchronization system works between Clerk authentication and Supabase database.

## Overview

The system keeps user roles (individual/business) synchronized between:
1. **Clerk** - `unsafeMetadata.accountType` (for UI & auth logic)
2. **Supabase** - `customer_meta` table (for backend logic)

## Database Schema

The `customer_meta` table in Supabase:

```sql
CREATE TABLE customer_meta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,  -- Clerk userId
  account_type TEXT NOT NULL CHECK (account_type IN ('individual', 'business')),
  company_name TEXT,
  tax_id TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customer_meta_clerk_user_id ON customer_meta(clerk_user_id);
```

## How It Works

### 1. User Signs Up
- User selects account type (individual/business) at `/choose-type`
- Account type is stored in Clerk's `unsafeMetadata.accountType`
- Company name (for business) stored in `unsafeMetadata.company`

### 2. Automatic Sync on Login
- `RoleSyncProvider` wraps the entire app in `src/app/layout.tsx`
- On every login, `useRoleSync()` hook automatically calls `/api/sync-role`
- The API route:
  1. Gets user data from Clerk
  2. Syncs role to `customer_meta` table in Supabase

### 3. Usage in Backend

Now the backend can query the user's role directly:

```sql
SELECT cm.account_type, cm.company_name, cm.is_verified
FROM customer_meta cm
WHERE cm.clerk_user_id = 'user_123'
```

## Files Created

### Database Layer
- `src/lib/db/index.ts` - Supabase client setup
- `src/lib/db/customer-meta.ts` - Database queries for customer_meta table

### API Routes
- `src/app/api/sync-role/route.ts` - POST endpoint to sync role from Clerk to Supabase

### Client Hooks
- `src/lib/hooks/use-role-sync.ts` - React hook for automatic sync
- `src/components/providers/role-sync-provider.tsx` - Provider component

## Environment Variables Required

Add to `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Clerk (already configured)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

## Use Cases

### 1. Show Different Pricing
```sql
-- In backend
SELECT 
  p.price,
  CASE 
    WHEN cm.account_type = 'business' THEN p.bulk_price
    ELSE p.retail_price
  END as final_price
FROM products p
JOIN customer_meta cm ON cm.clerk_user_id = $1
```

### 2. Allow/Deny Bulk Orders
```sql
-- Check if user can place bulk orders
SELECT account_type = 'business' as can_bulk_order
FROM customer_meta
WHERE clerk_user_id = $1
```

### 3. Generate Tax Invoices
```sql
-- Get company details for invoice
SELECT company_name, tax_id, is_verified
FROM customer_meta
WHERE clerk_user_id = $1 AND account_type = 'business'
```

### 4. Filter Analytics
```sql
-- Business customers only
SELECT COUNT(*) as business_customers
FROM customer_meta
WHERE account_type = 'business'
```

## Testing

1. Sign up as a business user
2. Check browser console for: `✅ Role synced successfully to Supabase`
3. Query Supabase:
```sql
SELECT * FROM customer_meta WHERE clerk_user_id = 'user_xxx';
```

## Troubleshooting

### Sync fails silently
- Check browser console for errors
- Verify Supabase environment variables are set correctly
- Ensure `customer_meta` table exists in Supabase

### Role not syncing
- Clear browser cache and re-login
- Check `/api/sync-role` endpoint directly
- Verify Clerk metadata contains `accountType`
- Check Supabase RLS policies allow inserts/updates
