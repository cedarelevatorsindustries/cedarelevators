# CEDAR ELEVATORS - DATABASE SAFETY & INTEGRITY PLAN

**Document Version:** 1.0 (Production Database Safeguards & Baseline Synchronization)  
**Date:** November 19, 2026  
**Status:** Approved for Implementation Planning  
**Target Database:** Supabase PostgreSQL 17 (`hbkdbrxzqaraarivudej`, region `ap-south-1` Mumbai)  
**Primary Directive:** Zero data loss, zero destructive resets, non-destructive synchronization only.

---

## 1. CURRENT LIVE DATABASE BASELINE

Direct live inspection via Supabase MCP and database probes confirmed that the production database is active, healthy, and populated with real operational data.

### 1.1 Core Table Inventory & Record Counts

| Schema | Table Name | Verified Rows | Primary Purpose | Phase 1 Status |
| :--- | :--- | :---: | :--- | :--- |
| `public` | `products` | **78** | Commercial & residential elevator products with specs & dimensions | **Active (Core P1)** |
| `public` | `product_variants` | **96** | Technical configurations (speed, capacity, finish, drive type) | **Active (Core P1)** |
| `public` | `categories` | **3** | Passenger Elevators, Freight Elevators, Home Elevators | **Active (Core P1)** |
| `public` | `subcategories` | **7** | Specialized elevator sub-classifications | **Active (Core P1)** |
| `public` | `product_applications` | **12** | Commercial, Residential, Healthcare, Industrial, Villa | **Active (Core P1)** |
| `public` | `inventory_items` | **96** | Stock counts, reserved counts, and low-stock thresholds | **Active (Core P1)** |
| `public` | `quotes` | **5** | Formal B2B and guest quote requests (`CED-QT-...`) | **Active (Core P1)** |
| `public` | `quote_items` | **14** | Specific product variants attached to quotes | **Active (Core P1)** |
| `public` | `quote_audit_log` | **28** | Status transitions, timestamps, and staff actions | **Active (Core P1)** |
| `public` | `quote_counters` | **3** | Atomic sequence generators for quote numbering | **Active (Core P1)** |
| `public` | `users` | **11** | Customer accounts mapped between Clerk and database | **Active (Core P1)** |
| `public` | `admin_users` | **1** | Staff and super admin role records (`super_admin`) | **Active (Core P1)** |
| `public` | `carts` | **18** | Customer shopping carts (E-commerce) | **Dormant (Phase 2)** |
| `public` | `cart_items` | **32** | Items within customer carts | **Dormant (Phase 2)** |
| `public` | `orders` | **4** | Historical test orders | **Dormant (Phase 2)** |
| `public` | `addresses` | **8** | Customer delivery and billing addresses | **Dormant (Phase 2)** |
| `public` | `business_verifications` | **2** | B2B GST and company verification records | **Active (B2B Quotes)** |

> [!IMPORTANT]
> **Data Retention Mandate:** The 78 elevator products and 96 variants represent the client's complete digital asset catalogue. Under no circumstances should `supabase db reset`, `DROP SCHEMA public CASCADE`, or destructive migration rollbacks be executed.

---

## 2. MIGRATION DRIFT & SYNCHRONIZATION ANALYSIS

### 2.1 The Problem: Local vs. Remote Divergence
The repository's local `supabase/migrations/` directory is severely desynchronized from the actual remote database:

```
┌──────────────────────────────────────────────┬──────────────────────────────────────────────┐
│ LOCAL REPOSITORY (supabase/migrations/)      │ LIVE REMOTE SUPABASE (schema_migrations)     │
├──────────────────────────────────────────────┼──────────────────────────────────────────────┤
│ Total files: 58                              │ Total migrations applied: 160+               │
│ Broken numeric prefixes:                     │ Clean, timestamped migration versions:       │
│   000_create_quotes_schema.sql               │   20251228122255_initial_schema              │
│   001_create_quote_counters.sql              │   20260105083312_add_b2b_features            │
│   001_simplify_quote_statuses.sql            │   20260115222000_create_product_reviews      │
│   001_business_verification.sql              │   20260117000000_create_cms_pages            │
│   (Up to 5 duplicate files sharing prefix)   │   20260121131529_fix_quote_audit_log         │
│ Missing later schema additions               │ Complete, sequential replay history          │
└──────────────────────────────────────────────┴──────────────────────────────────────────────┘
```

### 2.2 Root Cause of Drift
During active development, migrations were created and pushed directly to the remote Supabase project using multiple workstations or the Supabase web dashboard, while the local migration directory was manually populated with non-standard numeric filenames (`001_`, `002_`).

### 2.3 Safe Non-Destructive Resolution Strategy
Instead of attempting to force local broken files onto the remote database (which would cause fatal migration conflicts or schema corruption), we follow the **Canonical Baseline Pattern**:

1. **Step 1 (Archive):** Move all 58 broken local files into `supabase/migrations_archive/` for historical reference.
2. **Step 2 (Dump):** Generate a clean, comprehensive schema dump directly from the remote database using `supabase db dump`.
3. **Step 3 (Baseline):** Save this dump as `supabase/migrations/20260122000000_remote_baseline.sql`.
4. **Step 4 (Forward Migrations):** All future schema changes (including RLS hardening) are authored as clean, timestamped migrations sequentially following the baseline:
   - `20260122000001_harden_rls_policies.sql`
   - `20260122000002_align_column_views.sql`

---

## 3. LIVE SCHEMA DISCREPANCIES & APPLICATION ALIGNMENT

During live testing, three specific column naming mismatches were verified between application queries and the PostgreSQL database.

### 3.1 Discrepancy Register

| Table | Column in Live DB | Application Code Expected | Symptoms / Impact | Safe Resolution |
| :--- | :--- | :--- | :--- | :--- |
| `public.categories` | `title` (text) | `name` (text) | `SELECT id, name FROM categories` throws Postgres error `column "name" does not exist`. | Create a generated virtual column or view alias: `ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS name text GENERATED ALWAYS AS (title) STORED;` |
| `public.products` | `thumbnail_url` (text) | `thumbnail` (text) | Admin inventory view queries `products(thumbnail)` and returns null. | Create virtual column: `ALTER TABLE public.products ADD COLUMN IF NOT EXISTS thumbnail text GENERATED ALWAYS AS (thumbnail_url) STORED;` |
| `public.users` | Column absent | `verification_status` | `src/lib/actions/quotes.ts` queries `.select('verification_status')` from `users` and receives null. | Add column safely: `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'unverified';` |

### 3.2 Non-Destructive Schema Patch SQL

```sql
-- Migration: 20260122000002_align_schema_discrepancies.sql
BEGIN;

-- 1. Support legacy category name references safely
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS name text GENERATED ALWAYS AS (title) STORED;

-- 2. Support legacy product thumbnail references safely
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS thumbnail text GENERATED ALWAYS AS (thumbnail_url) STORED;

-- 3. Add verification_status to users table to support quote priority queries
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'unverified';

COMMIT;
```

---

## 4. ROW LEVEL SECURITY (RLS) STATUS & TABLE GRANTS

### 4.1 Missing RLS Verification
The following 12 tables have `rowsecurity = false` in `pg_tables`. They must have RLS enabled immediately to prevent anonymous data harvesting:

```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = false;
```
*Confirmed exposed:* `users`, `categories`, `subcategories`, `product_applications`, `quote_counters`, `carts`, `cart_items`, `addresses`, `customer_profiles`, `product_variants`, `product_specifications`, `business_verifications`.

### 4.2 Database Grants & Anon Role Lockdown
By default, PostgREST grants `ALL` permissions on public tables to the `anon` and `authenticated` roles. When RLS is enabled without policies, all access is denied. When policies are added, access is strictly governed by policy expressions.

**Grant Baseline Check:**
```sql
-- Ensure public anon role can read catalog tables
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.product_variants TO anon, authenticated;
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.subcategories TO anon, authenticated;
GRANT SELECT ON public.product_applications TO anon, authenticated;
GRANT SELECT ON public.product_specifications TO anon, authenticated;

-- Ensure quote creation is permitted for guest and authenticated users
GRANT INSERT ON public.quotes TO anon, authenticated;
GRANT INSERT ON public.quote_items TO anon, authenticated;
GRANT INSERT ON public.quote_audit_log TO anon, authenticated;

-- Revoke all direct table grants on internal sequence tables from public anon
REVOKE ALL ON public.quote_counters FROM anon;
REVOKE ALL ON public.admin_users FROM anon;
```

---

## 5. BACKUP, RECOVERY & ROLLBACK STRATEGY

### 5.1 Pre-Remediation Snapshot
Before executing any remediation SQL or applying RLS policies, a full physical and logical snapshot must be archived:

1. **Logical Schema & Data Backup:**
   ```powershell
   # Run via Supabase CLI outside sandbox
   supabase db dump --project-ref hbkdbrxzqaraarivudej -f "supabase/backups/cedar_backup_pre_remediation.sql"
   ```
2. **Data-Only Backup:**
   ```powershell
   supabase db dump --project-ref hbkdbrxzqaraarivudej --data-only -f "supabase/backups/cedar_data_pre_remediation.sql"
   ```

### 5.2 Emergency Rollback Plan
If an RLS policy inadvertently breaks customer storefront browsing or quote submission:
1. **Targeted Policy Rollback:** Instead of resetting the database, revert only the specific offending policy:
   ```sql
   -- Emergency disable of RLS on specific table if storefront is blocked
   ALTER TABLE public.<table_name> DISABLE ROW LEVEL SECURITY;
   ```
2. **Zero Table Drop Guarantee:** No remediation script shall contain `DROP TABLE`, `DROP SCHEMA`, or `TRUNCATE`.
3. **Transactional Execution:** All remediation scripts must execute inside an explicit `BEGIN; ... COMMIT;` transaction block. Any syntax error or runtime failure triggers an immediate automatic `ROLLBACK`, leaving production state unaffected.
