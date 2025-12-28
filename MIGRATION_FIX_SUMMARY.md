# Migration 003 Fix Summary

## Problem
When executing `003_create_rbac_system.sql`, you encountered this error:
```
ERROR: 42703: column "user_id" does not exist
```

## Root Cause
**Migration 002 and Migration 003 had conflicting table definitions:**

1. **Migration 002** created these tables:
   - `orders` table with column `clerk_user_id`
   - `products` table
   - `order_items` table

2. **Migration 003** tried to create the same tables with:
   - `orders` table with column `user_id` (different name!)
   - `products` table
   - `order_items` table

Because Migration 003 used `CREATE TABLE IF NOT EXISTS`, when you ran it after Migration 002:
- The tables already existed, so they were NOT recreated
- Migration 003's RLS policies then tried to reference `user_id` 
- But the actual column name was `clerk_user_id` from Migration 002
- **Result:** Column not found error! ❌

## Changes Made

### 1. Removed Duplicate Table Creations
- Removed `orders`, `order_items`, and `products` table definitions from Migration 003
- Added comment explaining these tables are already created in Migration 002

### 2. Updated RLS Policies
Changed policies to use `clerk_user_id` instead of `user_id`:

**Before:**
```sql
USING (user_id = get_current_user_id())
```

**After:**
```sql
USING (clerk_user_id = get_current_user_id())
```

### 3. Updated Policy Names
Added "RBAC -" prefix to new policies to distinguish them from Migration 002 policies:
- `"RBAC - Business users can view own orders"`
- `"RBAC - Individual users can view own orders"`
- `"RBAC - Users can view own order items"`

### 4. Removed Duplicate Operations
- Removed RLS enabling for tables already enabled in Migration 002
- Removed triggers for tables already having triggers
- Removed duplicate seed data (products)
- Updated verification queries to only check new tables

## What Migration 003 Now Does

✅ **Creates New Tables:**
- `profiles` - User profile information with role and verification status
- `verification_documents` - Business verification documents

✅ **Creates Helper Functions:**
- `get_current_user_id()` - Get user ID from Clerk JWT
- `is_authenticated()` - Check if user is authenticated
- `get_user_role()` - Get user role from JWT
- `get_verification_status()` - Get verification status from JWT

✅ **Adds Enhanced RLS Policies:**
- Policies for `profiles` table
- Policies for `verification_documents` table
- **Supplementary** policies for existing `orders` and `order_items` tables

## How to Run the Fixed Migration

### Option 1: Fresh Database
If you have a fresh database:
```sql
-- Run migrations in order
\i supabase/migrations/001_create_admin_authentication.sql
\i supabase/migrations/002_create_ecommerce_schema.sql
\i supabase/migrations/003_create_rbac_system.sql
```

### Option 2: Existing Database with Error
If you already ran the migrations and got the error:

1. **First, check what exists:**
```sql
-- Check existing tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check existing policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

2. **Then run the fixed migration:**
```sql
\i supabase/migrations/003_create_rbac_system.sql
```

## Verification

After running the fixed migration, verify success:

```sql
-- Should show: profiles, verification_documents
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'verification_documents');

-- Should show RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'verification_documents');

-- Check that helper functions exist
SELECT proname FROM pg_proc 
WHERE proname IN ('get_current_user_id', 'is_authenticated', 'get_user_role', 'get_verification_status');
```

## Key Takeaways

1. ✅ Always use consistent column naming across migrations
2. ✅ Avoid creating the same table in multiple migrations
3. ✅ Use clear comments to document table ownership/creation
4. ✅ Make migrations idempotent (safe to run multiple times)
5. ✅ Test migrations on a copy of production data before deploying

## Need Help?

If you encounter any issues:
1. Check the migration execution logs
2. Verify table structures match expectations
3. Review RLS policies for correct column references
4. Test with sample data to ensure policies work correctly
