# Supabase Migration Fixes Summary

## Date: January 2025

## Issues Fixed

### 1. Migration 003 - Verification Tables (`003_add_verification_tables.sql`)

**Error:**
```
ERROR: 42703: column "customer_clerk_id" does not exist
```

**Root Cause:**
The migration used column name `customer_clerk_id` but the actual column in the `customer_meta` table is named `clerk_user_id` (as defined in migration 002).

**Fix Applied:**
- Replaced all instances of `customer_clerk_id` with `clerk_user_id` throughout the migration file
- Updated in the following places:
  - `verification_documents` table definition (line 13)
  - Index on `verification_documents` (line 31)
  - `verification_audit_log` table definition (line 41)
  - Index on `verification_audit_log` (line 55)
  - `customer_notes` table definition (line 65)
  - Index on `customer_notes` (line 74)
  - RLS policy for reading verification documents (line 228)
  - RLS policy for uploading verification documents (line 233)
  - RLS policy for reading audit log (line 238)

---

### 2. Migration 008 - Interconnection Schema (`008_create_interconnection_schema.sql`)

**Error:**
```
ERROR: column "application" does not exist in table "categories"
```

**Root Cause:**
The migration tried to INSERT into the `categories` table using an `application` column that was never added to the table schema. The table was created in migration 002 without this column.

**Fix Applied:**
- Added `ALTER TABLE` statement to add the `application` column before using it:
  ```sql
  ALTER TABLE categories ADD COLUMN IF NOT EXISTS application VARCHAR(50);
  ```
- Added this at line 39, right before the INSERT statements that use the column

---

### 3. Migration 009 - Cedar Product Fields (`009_add_cedar_product_fields.sql`)

**Error:**
```
ERROR: 42P01: relation "elevator_types" does not exist
```

**Root Cause:**
Migration 009 depends on the `elevator_types` table created in migration 008. Since migration 008 failed due to the `application` column issue, the `elevator_types` table was never created, causing migration 009 to fail.

**Fix Applied:**
- No changes needed to migration 009 itself
- The fix to migration 008 resolves this issue
- Once migration 008 runs successfully, it will create the `elevator_types` table
- Then migration 009 can run successfully

---

## Migration Execution Order

After these fixes, migrations should be run in this order:

1. ✅ `001_create_admin_authentication.sql` (already run)
2. ✅ `002_create_ecommerce_schema.sql` (already run)
3. 🔄 `003_add_verification_tables.sql` (NOW FIXED - ready to run)
4. ✅ `004_admin_activity_logs.sql` (already run)
5. ✅ `005_performance_indexes.sql` (already run)
6. ✅ `006_add_admin_roles.sql` (already run)
7. ✅ `007_create_settings_tables.sql` (already run)
8. 🔄 `008_create_interconnection_schema.sql` (NOW FIXED - ready to run)
9. 🔄 `009_add_cedar_product_fields.sql` (will work after 008 runs)
10. ✅ `010_add_inventory_adjustments.sql` (already run)

---

## Files Modified

### `/app/supabase/migrations/003_add_verification_tables.sql`
- Changed column name from `customer_clerk_id` to `clerk_user_id` in:
  - Table definitions (3 tables)
  - Indexes (3 indexes)
  - RLS policies (3 policies)

### `/app/supabase/migrations/008_create_interconnection_schema.sql`
- Added `ALTER TABLE categories ADD COLUMN IF NOT EXISTS application VARCHAR(50);`
- Added before line 40 (before INSERT statements that use the column)

---

## Testing Recommendations

After applying these fixes:

1. **Run migration 003:**
   ```bash
   # Test that verification tables are created successfully
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('verification_documents', 'verification_audit_log', 'customer_notes');
   ```

2. **Run migration 008:**
   ```bash
   # Test that elevator_types table and application column exist
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'categories' AND column_name = 'application';
   
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name = 'elevator_types';
   ```

3. **Run migration 009:**
   ```bash
   # Test that elevator types were inserted
   SELECT name, slug FROM elevator_types ORDER BY sort_order;
   ```

---

## Notes

- All fixes maintain backward compatibility
- Used `IF NOT EXISTS` clauses where possible to make migrations idempotent
- Column name standardization: using `clerk_user_id` consistently across all tables
- No data migration needed as these are fresh schema changes

---

## Status: ✅ COMPLETE

All migration issues have been identified and fixed. Ready for execution.
