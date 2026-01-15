# Quick Migration Execution Guide

## Fixed Migrations Ready to Run

You now have 2 fixed migrations ready to execute:

### 1. Run Migration 003 (Verification Tables)
```bash
# Navigate to your Supabase project
cd /app

# Run the migration
psql YOUR_DATABASE_URL -f supabase/migrations/003_add_verification_tables.sql

# Or if using Supabase CLI:
supabase db push
```

**Expected Result:**
- Creates `verification_documents` table
- Creates `verification_audit_log` table  
- Creates `customer_notes` table
- Adds verification fields to `business_profiles`
- Adds account fields to `customer_meta`
- Sets up RLS policies

---

### 2. Run Migration 008 (Interconnection Schema)
```bash
# Run the migration
psql YOUR_DATABASE_URL -f supabase/migrations/008_create_interconnection_schema.sql

# Or if using Supabase CLI:
supabase db push
```

**Expected Result:**
- Creates `elevator_types` table with 4 default types
- Adds `application` column to `categories` table
- Creates `product_elevator_types` junction table
- Adds relationship columns to `products` table
- Seeds application categories (Erection, Testing, Service, General)
- Sets up RLS policies

---

### 3. Migration 009 Should Now Work

After running migrations 003 and 008, migration 009 should run successfully without errors because:
- The `elevator_types` table now exists (created by 008)
- The `application` column now exists in categories (added by 008)

---

## Verification Queries

### After Migration 003:
```sql
-- Check if tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('verification_documents', 'verification_audit_log', 'customer_notes');

-- Should return 3 rows
```

### After Migration 008:
```sql
-- Check if elevator_types table exists
SELECT * FROM elevator_types ORDER BY sort_order;

-- Should return: Residential, Commercial, Industrial, Hospital

-- Check if application column was added
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'categories' AND column_name = 'application';

-- Should return: application
```

### After Migration 009:
```sql
-- Check if new elevator types were added
SELECT name, slug FROM elevator_types ORDER BY sort_order;

-- Should return 7 types: Passenger, Residential, Commercial, Industrial, Hospital, Freight, Home

-- Check if new product fields exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('voltage', 'load_capacity_kg', 'speed_ms', 'variant_group', 'technical_specs');

-- Should return all 5 columns
```

---

## Summary of Changes

### Migration 003 Fixed:
✅ Changed `customer_clerk_id` → `clerk_user_id` (9 occurrences)

### Migration 008 Fixed:
✅ Added `ALTER TABLE categories ADD COLUMN IF NOT EXISTS application VARCHAR(50);`

### Migration 009:
✅ No changes needed - will work once 008 runs successfully

---

## Run Order

1. Run `003_add_verification_tables.sql` ✅
2. Run `008_create_interconnection_schema.sql` ✅  
3. Migration `009_add_cedar_product_fields.sql` should now work ✅

---

## Need Help?

If you encounter any issues:
1. Check the error message carefully
2. Verify the migration ran in the correct order
3. Check if previous migrations completed successfully
4. Refer to `/app/MIGRATION_FIXES_SUMMARY.md` for detailed information
