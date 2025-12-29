# 📘 Database Migration Guide - Cedar Interconnection Logic

**Migration File:** `/app/supabase/migrations/008_create_interconnection_schema.sql`  
**Status:** Ready to Apply  
**Risk Level:** LOW (Adds new tables/columns, doesn't modify existing data)

---

## 🎯 What This Migration Does

This migration implements the **Cedar Interconnection Logic** (Golden Rule: Products own relationships).

### Creates:
1. ✅ **elevator_types** table - Standalone classifier for elevator types
2. ✅ **product_elevator_types** junction table - Many-to-many product ↔ elevator type relationships
3. ✅ New columns in **products** table - `application_id`, `category_id`, `subcategory_id`, `is_categorized`
4. ✅ System categories - Erection, Testing, Service, General, Uncategorized
5. ✅ Helper SQL functions - `get_product_hierarchy()`, `get_category_products()`, `get_elevator_type_products()`
6. ✅ RLS policies - Security rules for new tables
7. ✅ Storage bucket - `elevator-types` for type-specific images

### Seeds:
- **4 Elevator Types:** Residential, Commercial, Industrial, Hospital
- **5 Applications:** Erection, Testing, Service, General (with Uncategorized sub-category)

---

## 🚀 How to Apply Migration

### **Method 1: Supabase Dashboard** ⭐ (Recommended)

**Steps:**
1. Open your Supabase Dashboard
2. Navigate to: **SQL Editor** (left sidebar)
3. Click **"New Query"**
4. Open `/app/supabase/migrations/008_create_interconnection_schema.sql`
5. Copy the entire file contents (258 lines)
6. Paste into the SQL Editor
7. Click **"Run"** button
8. Wait for success message (should take ~2-3 seconds)

**Dashboard URL Pattern:**
```
https://app.supabase.com/project/YOUR_PROJECT_ID/sql
```

---

### **Method 2: Supabase CLI** (If installed)

**Prerequisites:**
- Supabase CLI installed: `npm install -g supabase`
- Linked to your project: `supabase link --project-ref YOUR_PROJECT_ID`

**Command:**
```bash
cd /app
supabase db push
```

This will apply all pending migrations in `/app/supabase/migrations/`.

---

### **Method 3: Direct PostgreSQL Connection**

**Prerequisites:**
- PostgreSQL client (`psql`) installed
- Database connection string from Supabase Dashboard → Settings → Database

**Command:**
```bash
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  < /app/supabase/migrations/008_create_interconnection_schema.sql
```

Replace `[PASSWORD]` and `[HOST]` with your actual credentials.

---

### **Method 4: Node.js Script** (Informational)

We've included a helper script at `/app/scripts/apply-interconnection-migration.js`.

**Note:** This script only provides guidance since Supabase REST API doesn't support raw SQL execution. It will show you the migration preview and instructions.

**Usage:**
```bash
node /app/scripts/apply-interconnection-migration.js
```

---

## ✅ Verification Steps

After applying the migration, verify it worked:

### 1. Check Elevator Types Table
```sql
SELECT * FROM elevator_types ORDER BY sort_order;
```

**Expected Result:** 4 rows
| name | slug | is_active |
|------|------|-----------|
| Residential | residential | true |
| Commercial | commercial | true |
| Industrial | industrial | true |
| Hospital | hospital | true |

---

### 2. Check Products Table Columns
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND column_name IN ('application_id', 'category_id', 'subcategory_id', 'is_categorized')
ORDER BY column_name;
```

**Expected Result:** 4 rows showing the new columns

---

### 3. Check System Categories
```sql
SELECT name, slug, parent_id 
FROM categories 
WHERE application IN ('erection', 'testing', 'service', 'general')
ORDER BY sort_order;
```

**Expected Result:** 5 rows (Erection, Testing, Service, General, Uncategorized)

---

### 4. Check Junction Table
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'product_elevator_types';
```

**Expected Result:** 1 row confirming table exists

---

### 5. Test Helper Function
```sql
SELECT get_category_products('YOUR_CATEGORY_ID_HERE');
```

**Expected Result:** Should execute without error (may return empty array if no products yet)

---

## 🛡️ Safety & Rollback

### Migration Safety:
- ✅ **Non-destructive:** Only adds new tables and columns
- ✅ **No data loss:** Existing data remains untouched
- ✅ **Backward compatible:** Old `products.category` column kept temporarily
- ✅ **Nullable fields:** New columns allow NULL (won't break existing products)

### Rollback Plan (If needed):
If you need to undo this migration:

```sql
-- Drop new tables
DROP TABLE IF EXISTS product_elevator_types CASCADE;
DROP TABLE IF EXISTS elevator_types CASCADE;

-- Drop new columns from products
ALTER TABLE products DROP COLUMN IF EXISTS application_id;
ALTER TABLE products DROP COLUMN IF EXISTS category_id;
ALTER TABLE products DROP COLUMN IF EXISTS subcategory_id;
ALTER TABLE products DROP COLUMN IF EXISTS is_categorized;

-- Drop helper functions
DROP FUNCTION IF EXISTS get_product_hierarchy;
DROP FUNCTION IF EXISTS get_category_products;
DROP FUNCTION IF EXISTS get_elevator_type_products;

-- Delete seeded system categories (optional)
DELETE FROM categories WHERE slug IN ('erection', 'testing', 'service', 'general', 'uncategorized');
```

**⚠️ Warning:** Only rollback if absolutely necessary. This will delete elevator type data.

---

## 🐛 Troubleshooting

### Error: "relation already exists"
**Cause:** Migration already applied  
**Solution:** Check if tables exist:
```sql
SELECT tablename FROM pg_tables WHERE tablename IN ('elevator_types', 'product_elevator_types');
```
If they exist, migration is already complete.

---

### Error: "permission denied"
**Cause:** Using anon key instead of service role key  
**Solution:** Use service role key (from Dashboard → Settings → API)

---

### Error: "function update_updated_at_column() does not exist"
**Cause:** Missing trigger function from previous migrations  
**Solution:** Apply this function first:
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### Error: "categories table does not exist"
**Cause:** Missing previous migrations  
**Solution:** Apply migrations in order:
1. `001_create_admin_authentication.sql`
2. `002_create_ecommerce_schema.sql`
3. ...all the way to...
4. `008_create_interconnection_schema.sql`

---

## 📊 Migration Impact

### Performance:
- **Execution Time:** ~2-3 seconds
- **Database Downtime:** None (migration is non-blocking)
- **New Indexes:** 7 indexes added (improves query performance)

### Data Changes:
- **New Tables:** 2 tables
- **New Columns:** 4 columns in `products` table
- **Seeded Data:** 9 rows (4 elevator types + 5 categories)
- **Existing Data:** Unchanged

### Application Impact:
- **Breaking Changes:** None
- **New Features Enabled:** Product hierarchy, elevator type classification
- **Required Code Changes:** Already implemented in Phases 1-5

---

## 🎯 Post-Migration Tasks

After successful migration:

1. ✅ **Verify** tables and data (see Verification Steps above)
2. ✅ **Test** product creation form with new Organization tab
3. ✅ **Update** existing products to use new hierarchy (optional, can be gradual)
4. ✅ **Continue** to Phase 6 implementation

---

## 📞 Need Help?

If you encounter issues:

1. Check the [Troubleshooting](#-troubleshooting) section above
2. Review Supabase logs: Dashboard → Logs → Postgres Logs
3. Verify environment variables are correct
4. Ensure you're using the **service role key** (not anon key)

---

## 📝 Migration Checklist

Before applying:
- [ ] Backup database (optional, but recommended for production)
- [ ] Have Supabase Dashboard access
- [ ] Note your project ID and service role key

During application:
- [ ] Copy migration SQL from file
- [ ] Paste into SQL Editor
- [ ] Click "Run"
- [ ] Wait for success confirmation

After applying:
- [ ] Run verification queries (Section: Verification Steps)
- [ ] Check that elevator_types has 4 rows
- [ ] Confirm products table has new columns
- [ ] Test product creation form
- [ ] Mark this checklist complete in `CEDAR-INTERCONNECTION-LOGIC-STATUS.md`

---

**Migration Status:** 🔴 Pending Application  
**Updated:** Current Session  
**Next Step:** Apply migration, then proceed to Phase 6

---

**End of Migration Guide** 🎉
