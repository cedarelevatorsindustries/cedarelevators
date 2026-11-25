# CEDAR ELEVATORS - BACKUP COMPLETENESS & RECOVERABILITY AUDIT

**Document ID:** `CEDAR-TASK-0.1.1-COMPLETENESS-AUDIT`  
**Execution Timestamp:** November 19, 2026, 21:55:00 IST (`2026-11-19T16:25:00.000Z`)  
**Target Project Reference:** `hbkdbrxzqaraarivudej` (PostgreSQL 17.11, `ap-south-1` Mumbai)  
**Endpoint URL:** `https://hbkdbrxzqaraarivudej.supabase.co`  
**Author:** Senior Full-Stack Architect, Database Security Auditor & DevOps Engineer  
**Audit Scope:** Read-only inspection of backup artifacts, live database verification, storage recoverability assessment, and recovery readiness classification.

---

## 1. EXECUTIVE SUMMARY & VERDICT

An exhaustive technical audit of the production database backup artifacts generated in Task 0.1 was conducted against the live Supabase production database (`hbkdbrxzqaraarivudej`).

### 1.1 Overall Recovery Readiness: **PARTIALLY RECOVERABLE / DEFICIENT IN CRITICAL DDL & MEDIA**

```
┌────────────────────────────────────────┬──────────────────────┬────────────────────────────────────────────────────────┐
│ Recovery Domain                        │ Readiness Status     │ Critical Finding                                       │
├────────────────────────────────────────┼──────────────────────┼────────────────────────────────────────────────────────┤
│ 1. Database Table Records (Data)       │ PARTIALLY VERIFIED   │ 859/868 rows (99.0%) backed up. 9 wishlist rows missing│
│ 2. Database DDL / Schema Structure     │ PARTIALLY VERIFIED   │ OpenAPI JSON only; raw PostgreSQL DDL is MISSING       │
│ 3. Row Level Security (RLS) Policies   │ MISSING              │ 0 of 203 active live RLS policies backed up            │
│ 4. Functions, Triggers & Sequences     │ MISSING              │ 0 of 69 functions, 50 triggers, 2 sequences backed up  │
│ 5. Database Roles & Grants             │ MISSING              │ 0 custom roles, 0 GRANT/REVOKE DDL statements backed up│
│ 6. Storage Media Assets (Binary Blobs) │ MISSING              │ Metadata only; 38 binary images (27.3 MB) not exported │
└────────────────────────────────────────┴──────────────────────┴────────────────────────────────────────────────────────┘
```

> [!CAUTION]
> **Definitive Recovery Risk:**  
> The existing backup artifacts **CANNOT** restore a functioning database on a clean Supabase project or local PostgreSQL instance.  
> While the table row data (859 records) is securely captured in `cedar_data_dump.sql` as valid `INSERT` statements, these statements depend on pre-existing tables. Because the backup contains an **OpenAPI JSON schema definition** rather than **PostgreSQL DDL (`CREATE TABLE`, `CREATE FUNCTION`, `CREATE TRIGGER`, `CREATE POLICY`)**, a clean restore would immediately fail with `relation "public.products" does not exist`.

---

## 2. EXISTING BACKUP ARTIFACT INVENTORY

The following 8 backup artifacts are stored in `backups/` and the external secure artifact vault (`<appDataDir>/brain/07104594-f5c2-499b-8c4f-a5cfb47e7956/backups/`):

| File Name | Format | File Size | SHA-256 Checksum | Exact Contents & Classification |
| :--- | :---: | :---: | :--- | :--- |
| **`cedar_schema_definition.json`** | JSON | 735,977 B | `a42f0cad7ffb85e5ece9c266fe964cf899dfdc7b34d31bc025fbf918045f22b0` | **OpenAPI 3.0 / PostgREST Specification.** Contains 77 table endpoint schemas, column property types (string, integer), and OpenAPI path descriptions. **Does NOT contain PostgreSQL DDL.** |
| **`cedar_data_dump.json`** | JSON | 9,896,478 B | `34d07dc9502b89f01243305edd94b8b46236dc4d9b925b789109205b7853138a` | **Structured JSON Table Dumps.** Contains 859 rows across 50 populated tables (from a hardcoded list of 68 tables). |
| **`cedar_data_dump.sql`** | SQL | 9,889,651 B | `3fad6b3894300e127b3a8b022175c0e884201fea776f311708d66f961388bbde` | **Data-Only SQL Inserts.** 859 verified `INSERT INTO public."<table>" (...) VALUES (...) ON CONFLICT DO NOTHING;` statements. Contains zero `CREATE TABLE` DDL statements. |
| **`cedar_storage_inventory.json`** | JSON | 33,254 B | `25ddb7ea815c03c605cc451852318174a5cc7c9c9762befadf752c82e8beeaa1` | **Storage Metadata Manifest.** Documents configuration for all 8 buckets and metadata (size, MIME type, eTag, timestamps) for 38 hosted assets. Contains **zero downloadable binary files**. |
| **`cedar_migration_history.json`** | JSON | 15,496 B | `4e229aa6add402df4935059f2998899df10327348fe904cd9ef6847635dcfa53` | **Remote Migration Snapshot.** Array of 163 applied migration version timestamps and names from `supabase_migrations.schema_migrations`. Contains **zero SQL migration code**. |
| **`cedar_table_security_roles.json`** | JSON | 6,055 B | `4e1372fc912e7504f23b55961ac1c3b75a714cc6b20da6114394f56597855b5f` | **Table Query Status Metadata.** Records HTTP query response status and row counts for the 68 queried tables. Contains **zero PostgreSQL roles, grants, or RLS policy definitions**. |
| **`cedar_checksums.sha256`** | Text | 660 B | `0f0bf608bfa0c04fa282d8d85f8546b412bfd5e08b1a511ff05d76d41865a7d5` | Standalone cryptographic verification manifest. |
| **`backup_summary.json`** | JSON | 8,924 B | `1f33adcf1ea09f27329b3b879c5c93d95ebf899e0bf0dc834e569c73efb71946` | Machine-readable execution log, table row counts, and target configuration. |

---

## 3. DATABASE SCHEMA & DDL COMPLETENESS AUDIT

### 3.1 OpenAPI vs. Native PostgreSQL Schema DDL
The file `cedar_schema_definition.json` was generated by querying PostgREST (`GET /rest/v1/` with `Accept: application/openapi+json`).  
While valuable for API client generation and type checking, **it is NOT a database schema backup**:

| Component | In OpenAPI (`cedar_schema_definition.json`) | In Native PostgreSQL DDL (`pg_dump --schema-only`) | Impact on Restoration |
| :--- | :---: | :---: | :--- |
| Table Names & Column Types | Yes (JSON Schema) | Yes (`CREATE TABLE (...)`) | Column names and basic types are documented |
| Primary Key Constraints | Partial (via description) | Yes (`CONSTRAINT pk PRIMARY KEY (...)`) | Cannot enforce uniqueness or row identity |
| Foreign Key Constraints | **NO** | Yes (`REFERENCES table(col) ON DELETE CASCADE`) | Relational integrity and cascades cannot be created |
| CHECK Constraints | **NO** | Yes (`CHECK (price >= 0)`) | Domain validation rules lost |
| Default Expressions | Partial (basic string/num) | Yes (`DEFAULT gen_random_uuid()`, `now()`) | Automatic UUID and timestamp generation lost |
| Indexes (`btree`, `gin`) | **NO** | Yes (`CREATE INDEX ... ON ... USING gin(...)`) | Full-text search and query performance lost |
| Custom Types & Enums | **NO** | Yes (`CREATE TYPE admin_role AS ENUM (...)`) | Custom PostgreSQL enums lost |
| Table Inheritance / Schemas | **NO** | Yes | Structural hierarchy lost |

### 3.2 Functions, Triggers, Sequences & Policies in Live Database
Direct system catalog inspection of the live production database (`pg_proc`, `information_schema.triggers`, `information_schema.sequences`, `pg_policies`) revealed that the existing backup completely omits massive application logic:

1. **Custom Procedures & Functions:**
   * **69 custom functions** exist in `public` (e.g., `build_product_search_vector`, `generate_quote_number`, `increment_quote_counter`, `get_or_create_cart`, `lock_cart_for_checkout`, `mark_order_as_paid`, `search_products`).
   * **Backup Status: MISSING.** None of the 69 PL/pgSQL function bodies are in the backup.
2. **Database Triggers:**
   * **50 active triggers** exist in `public` (e.g., `set_quote_number` on `quotes`, `trigger_initialize_variant_inventory` on `product_variants`, `products_search_vector_update` on `products`, `sync_verification_status_trigger` on `business_verifications`).
   * **Backup Status: MISSING.** None of the 50 trigger definitions are in the backup.
3. **Sequence Generators:**
   * **2 active sequences** exist in `public`: `quote_number_seq` and `order_number_seq` (both initialized at `1000`).
   * **Backup Status: MISSING.** If recreated, sequences would restart at 1, causing primary key collisions with existing quote and order numbers.
4. **Row Level Security (RLS) Policies:**
   * **203 active RLS policies** are currently enforced in `public`.
   * **Backup Status: MISSING.** `cedar_table_security_roles.json` only tested HTTP endpoint reachability; it did not extract the SQL expressions (`USING`, `WITH CHECK`, `FOR SELECT/INSERT/UPDATE/DELETE`) for any of the 203 policies.
5. **Database Extensions:**
   * **5 extensions installed:** `uuid-ossp` (1.1), `pgcrypto` (1.3), `pg_stat_statements` (1.11), `supabase_vault` (0.3.1), `wrappers` (0.5.7).
   * **Backup Status: MISSING.** Not cataloged in any DDL script.

---

## 4. DATA COUNT RECONCILIATION & DISCREPANCY INVESTIGATION

### 4.1 Live Database vs. Exported Backup Reconciliation
Every single base table in the live production database was queried directly via read-only SQL (`COUNT(*)`) and compared against the records in `cedar_data_dump.json` / `cedar_data_dump.sql`:

| Table Name | Live Row Count | Exported Row Count | Difference | Reconciliation Status |
| :--- | :---: | :---: | :---: | :--- |
| `public.products` | **78** | **78** | 0 | ✅ VERIFIED EXACT |
| `public.product_variants` | **96** | **96** | 0 | ✅ VERIFIED EXACT |
| `public.categories` | **3** | **3** | 0 | ✅ VERIFIED EXACT |
| `public.subcategories` | **13** | **13** | 0 | ✅ VERIFIED EXACT |
| `public.product_applications` | **99** | **99** | 0 | ✅ VERIFIED EXACT |
| `public.product_elevator_types` | **150** | **150** | 0 | ✅ VERIFIED EXACT |
| `public.product_categories` | **78** | **78** | 0 | ✅ VERIFIED EXACT |
| `public.product_subcategories` | **36** | **36** | 0 | ✅ VERIFIED EXACT |
| `public.product_collections` | **30** | **30** | 0 | ✅ VERIFIED EXACT |
| `public.collections` | **4** | **4** | 0 | ✅ VERIFIED EXACT |
| `public.applications` | **3** | **3** | 0 | ✅ VERIFIED EXACT |
| `public.application_categories` | **7** | **7** | 0 | ✅ VERIFIED EXACT |
| `public.category_subcategories` | **15** | **15** | 0 | ✅ VERIFIED EXACT |
| `public.elevator_types` | **7** | **7** | 0 | ✅ VERIFIED EXACT |
| `public.inventory_items` | **96** | **96** | 0 | ✅ VERIFIED EXACT |
| `public.quotes` | **5** | **5** | 0 | ✅ VERIFIED EXACT |
| `public.quote_items` | **5** | **5** | 0 | ✅ VERIFIED EXACT *(See 4.2)* |
| `public.quote_counters` | **10** | **10** | 0 | ✅ VERIFIED EXACT |
| `public.quote_audit_log` | **3** | **3** | 0 | ✅ VERIFIED EXACT |
| `public.quote_attachments` | **1** | **1** | 0 | ✅ VERIFIED EXACT |
| `public.users` | **11** | **11** | 0 | ✅ VERIFIED EXACT |
| `public.admin_users` | **1** | **1** | 0 | ✅ VERIFIED EXACT |
| `public.admin_profiles` | **1** | **1** | 0 | ✅ VERIFIED EXACT |
| `public.admin_settings` | **1** | **1** | 0 | ✅ VERIFIED EXACT |
| `public.user_profiles` | **16** | **16** | 0 | ✅ VERIFIED EXACT |
| `public.user_addresses` | **4** | **4** | 0 | ✅ VERIFIED EXACT |
| `public.business_verifications` | **4** | **4** | 0 | ✅ VERIFIED EXACT |
| `public.business_verification_documents`| **2** | **2** | 0 | ✅ VERIFIED EXACT |
| `public.businesses` | **7** | **7** | 0 | ✅ VERIFIED EXACT |
| `public.business_members` | **7** | **7** | 0 | ✅ VERIFIED EXACT |
| `public.carts` | **11** | **11** | 0 | ✅ VERIFIED EXACT |
| `public.cart_items` | **2** | **2** | 0 | ✅ VERIFIED EXACT |
| `public.orders` | **9** | **9** | 0 | ✅ VERIFIED EXACT |
| `public.order_items` | **17** | **17** | 0 | ✅ VERIFIED EXACT |
| `public.pricing_settings` | **1** | **1** | 0 | ✅ VERIFIED EXACT |
| `public.payment_settings` | **1** | **1** | 0 | ✅ VERIFIED EXACT |
| `public.tax_settings` | **1** | **1** | 0 | ✅ VERIFIED EXACT |
| `public.shipping_settings` | **1** | **1** | 0 | ✅ VERIFIED EXACT |
| `public.system_settings` | **1** | **1** | 0 | ✅ VERIFIED EXACT |
| `public.store_settings` | **1** | **1** | 0 | ✅ VERIFIED EXACT |
| `public.pickup_locations` | **1** | **1** | 0 | ✅ VERIFIED EXACT |
| `public.policies` | **4** | **4** | 0 | ✅ VERIFIED EXACT |
| `public.why_choose_hero` | **1** | **1** | 0 | ✅ VERIFIED EXACT |
| `public.why_choose_items` | **3** | **3** | 0 | ✅ VERIFIED EXACT |
| `public.why_choose_stats` | **3** | **3** | 0 | ✅ VERIFIED EXACT |
| `public.why_choose_cta` | **1** | **1** | 0 | ✅ VERIFIED EXACT |
| `public.warranty_hero` | **1** | **1** | 0 | ✅ VERIFIED EXACT |
| `public.warranty_period` | **1** | **1** | 0 | ✅ VERIFIED EXACT |
| `public.warranty_coverage` | **3** | **3** | 0 | ✅ VERIFIED EXACT |
| `public.warranty_claim_steps` | **3** | **3** | 0 | ✅ VERIFIED EXACT |
| `public.wishlists` | **5** | **0** | **-5** | ⚠️ **OMITTED FROM EXPORT** |
| `public.wishlist_items` | **4** | **0** | **-4** | ⚠️ **OMITTED FROM EXPORT** |
| Remaining 21 empty tables* | **0** | **0** | 0 | ✅ VERIFIED EXACT |
| **TOTALS** | **868** | **859** | **-9** | **99.0% Backed Up (9 rows omitted)** |

*\*The 21 verified empty tables are: `admin_invites`, `banner_slides`, `banners`, `business_addresses`, `business_documents`, `checkout_sessions`, `customer_meta`, `customer_notes`, `documents`, `inventory_adjustments`, `order_audit_log`, `payment_transactions`, `product_reviews`, `product_types`, `profiles`, `quote_admin_responses`, `quote_baskets`, `recently_viewed`, `user_favourites`, `verification_audit_log`, `verification_documents`.*

---

### 4.2 Investigation: Quote Items Discrepancy (14 vs. 5)

* **Prior Documented Baseline:** An earlier audit document (`docs/audits/database.md:26`) listed `quote_items = 14`.
* **Actual Live Database Count:** `SELECT count(*) FROM public.quote_items;` returns **exactly 5 rows**.
* **Exported Backup Count:** `cedar_data_dump.json` contains **exactly 5 rows**.
* **Detailed Record Analysis:**
  The 5 quote items in production correspond 1:1 with the 5 quotes:
  1. `5a1e9553-aee6-43dc-9235-1615bc048e27`: Quote `9f05643b...` &rarr; Emergency Wall Mount Alarm (Created `2026-01-19 07:00:14 UTC`)
  2. `c863b6ce-8dc5-4f09-a724-69f522d48d9f`: Quote `e207b632...` &rarr; Door Sensor (Created `2026-01-19 07:02:50 UTC`)
  3. `f566629e-e6c1-44b3-93ee-e6725c212ac2`: Quote `049f981a...` &rarr; Door Rope Roller (Created `2026-01-18 09:18:22 UTC`)
  4. `85dcad79-bfc8-470a-857d-3f7f75372472`: Quote `1e5af2b6...` &rarr; Door Rope Roller (Created `2026-01-18 09:20:33 UTC`)
  5. `a36879b5-c414-4d28-b734-14a1efa5dbe6`: Quote `dfde85d8...` &rarr; Door Rope Roller (Created `2026-01-18 09:19:13 UTC`)
* **Finding & Root Cause:**  
  Zero quote items were deleted or lost between the database and the backup. All 5 records are accounted for. The figure "14" in the prior audit document was an **unverified manual error** (or confusion with `subcategories` which has 13 rows, or test data from a previous local mock). The backup data for `quote_items` is 100% accurate and complete.

### 4.3 Discovery: The 9 Omitted Wishlist Records
Inspection of the backup runner (`run-backup.mjs`) showed that data export was executed against a hardcoded array of 68 table names.  
Two populated tables in the live database were omitted from that list:
* `wishlists`: Contains **5 rows** (Customer wishlist containers).
* `wishlist_items`: Contains **4 rows** (Product variant bookmarks).

While wishlists are a non-essential convenience feature for Phase 1, their omission confirms that **table-enumeration backups based on hardcoded arrays risk data omission**.

---

## 5. STORAGE RECOVERABILITY AUDIT

Inspection of `cedar_storage_inventory.json` against Supabase Storage API established the following:

### 5.1 What is Stored in the Backup
* **Bucket Configurations:** ✅ Captured. All 8 buckets (`banners`, `collections`, `categories`, `elevator-types`, `avatars`, `images`, `business-verification-documents`, `business-documents`) have their names, public/private status, max file sizes, and allowed MIME types recorded.
* **Object Metadata:** ✅ Captured. All 38 hosted assets have file paths, names, IDs, byte sizes, MIME types, and eTags documented.
* **Access Information:** ✅ Captured. `business-verification-documents` is identified as private; the remaining 7 buckets are identified as public.

### 5.2 What is MISSING from the Backup (Critical)
* **Binary File Contents (Image & Document Blobs):** ❌ **COMPLETELY MISSING.**  
  The backup contains **only a 33.2 KB JSON metadata catalog**. It does not contain the actual binary image bytes (`.png`, `.jpg`, `.webp`, `.pdf`).

### 5.3 Specific Assets Requiring Binary Backup
If the Supabase storage buckets were corrupted or deleted, the following **38 media files (total ~27.3 MB)** could not be recovered from the current backup:

1. **`banners` bucket (Public) - 9 files (~6.6 MB):**
   * `slide-005lzq5gw33e2-1767119703847.png` (733.9 KB)
   * `slide-34t0j0wxjhh-1767119095576.png` (733.9 KB)
   * `slide-3a6x67j190s-1767119642057.png` (733.9 KB)
   * `slide-6d1z36b801-1767119853920.png` (733.9 KB)
   * `slide-j5e2i3r70o-1767119427092.png` (733.9 KB)
   * `slide-t42t8s3r8n-1767119602071.png` (733.9 KB)
   * `slide-u2m41q1u49-1767119477046.png` (733.9 KB)
   * `slide-u9z5z18q3x-1767119782531.png` (733.9 KB)
   * `slide-yp1x62j3j-1767119532675.png` (733.9 KB)
2. **`categories` bucket (Public) - 26 files (~19.5 MB):**
   * 26 high-resolution category hero banners and cards (e.g., `passenger-elevators.png`, `freight-elevators.png`, `home-elevators.png`, and subcategory graphics).
3. **`avatars` bucket (Public) - 3 files (~1.2 MB):**
   * 3 staff and administrator user avatar graphics.

---

## 6. MIGRATION HISTORY CONSISTENCY AUDIT

### 6.1 Remote vs. Local Discrepancy
Comparing `cedar_migration_history.json` (captured from `supabase_migrations.schema_migrations`) with the local filesystem (`supabase/migrations/`):

```
┌───────────────────────────────────────┬───────────────────────────────────────┐
│ REMOTE DATABASE (Live History)        │ LOCAL REPOSITORY (Filesystem)         │
├───────────────────────────────────────┼───────────────────────────────────────┤
│ 163 Applied Migrations Recorded       │ 58 Total Migration Files              │
│ Timestamp prefixes (e.g. 20251228...) │ Mixed/arbitrary prefixes (001_, etc.) │
│ Earliest: 20251228122255_create_quotes│ Earliest: 001_create_roles_and_perm...│
│ Latest: 20260121131529_add_gst_and... │ Missing all 100+ recent migrations    │
└───────────────────────────────────────┴───────────────────────────────────────┘
```

### 6.2 Key Findings:
1. **Name Overlap:** Only **19 of the 58 local files** match names recorded in the remote migration history.
2. **Missing Remote Files:** Over **140 migrations** applied to the remote database do NOT exist as local `.sql` files in the repository.
3. **Local Duplicates:** Local migrations contain disordered sequential prefixes (`001_`, `002_`, `010_`) with duplicate numbering.
4. **Catastrophic CLI Risk:** Running `supabase db push` with the current local `supabase/migrations/` directory would fail or attempt to re-execute obsolete schema alterations, potentially causing schema corruption or migration table divergence.

---

## 7. DETAILED RECOVERY READINESS ASSESSMENT

Each domain is evaluated on whether a clean system restore can be achieved using **ONLY** the existing backup files:

```
┌────────────────────────────────────────┬──────────────────────┬────────────────────────────────────────────────────────┐
│ Domain                                 │ Classification       │ Recoverability Assessment                              │
├────────────────────────────────────────┼──────────────────────┼────────────────────────────────────────────────────────┤
│ 1. Database Structure (Tables/Columns) │ PARTIALLY VERIFIED   │ OpenAPI JSON documents column names and types, but     │
│                                        │                      │ lacks PostgreSQL DDL (PK, FK, CHECK, DEFAULT, INDEX).  │
├────────────────────────────────────────┼──────────────────────┼────────────────────────────────────────────────────────┤
│ 2. Database Records (Table Data)       │ PARTIALLY VERIFIED   │ 859 rows (99.0%) verified and formatted as valid SQL   │
│                                        │                      │ INSERTs. Missing 9 rows (wishlists & wishlist_items).  │
├────────────────────────────────────────┼──────────────────────┼────────────────────────────────────────────────────────┤
│ 3. Database Roles & Grants             │ MISSING              │ Zero role creation DDL or table GRANTs exist in backup.│
├────────────────────────────────────────┼──────────────────────┼────────────────────────────────────────────────────────┤
│ 4. RLS Security Policies               │ MISSING              │ Zero of the 203 live RLS policies exist in backup.     │
├────────────────────────────────────────┼──────────────────────┼────────────────────────────────────────────────────────┤
│ 5. Functions, Triggers & Sequences     │ MISSING              │ Zero of 69 functions, 50 triggers, 2 sequences backed  │
│                                        │                      │ up. Custom business and numbering logic is unprotected.│
├────────────────────────────────────────┼──────────────────────┼────────────────────────────────────────────────────────┤
│ 6. Storage Media Objects (Images)      │ MISSING              │ Metadata is cataloged; 38 binary images are absent.    │
└────────────────────────────────────────┴──────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 8. MISSING RECOVERY COMPONENTS (WHAT IS UNPROTECTED)

Before any remediation or migration work begins, the following database components are completely unbacked:

1. **Native PostgreSQL DDL Schema Script:**  
   A full `pg_dump --schema-only` SQL file containing exact `CREATE TABLE`, `ALTER TABLE ... ADD CONSTRAINT`, and `CREATE INDEX` statements.
2. **Full PL/pgSQL Function & Trigger DDL:**  
   SQL definitions for the 69 custom functions and 50 table triggers.
3. **Active Sequence Definitions:**  
   DDL and current value snapshots for `quote_number_seq` and `order_number_seq`.
4. **All 203 Row Level Security Policies:**  
   The full SQL expressions (`CREATE POLICY ... ON ... USING (...)`) for all 203 active security policies.
5. **Database Role Privileges & Grants:**  
   The `GRANT SELECT, INSERT, UPDATE, DELETE ON ... TO anon, authenticated, service_role` DDL statements.
6. **Binary Storage Asset Archives:**  
   The 38 physical image files residing in the `banners`, `categories`, and `avatars` buckets.
7. **The 9 Omitted Wishlist Records:**  
   `wishlists` (5 rows) and `wishlist_items` (4 rows).

---

## 9. RECOMMENDED ACTIONS IN PRIORITY ORDER

To upgrade the backup status from **PARTIALLY VERIFIED / DEFICIENT** to **VERIFIED & COMPLETE**, execute the following non-destructive read-only export operations:

### Priority 1: Export Complete PostgreSQL DDL (Schema, Triggers, Functions, Policies)
* **Action:** Generate a single, comprehensive DDL backup (`cedar_complete_schema.sql`) from the live database.
* **Method:** Since Supabase CLI `db dump` requires a direct connection pooler password or access token, we can extract the complete DDL for all 69 functions, 50 triggers, 2 sequences, and 203 RLS policies directly using PostgreSQL system queries (`pg_get_functiondef`, `pg_get_triggerdef`, `pg_policies`) via read-only SQL into a verified schema file.

### Priority 2: Download All 38 Storage Media Blobs
* **Action:** Download the 38 image files from `banners`, `categories`, and `avatars` into a local directory (`backups/storage/`) and archive them into `cedar_storage_assets.zip`.
* **Method:** Execute a non-destructive Node script using `@supabase/supabase-js` `storage.from(bucket).download()`.

### Priority 3: Append Missing Wishlist Data to Backup
* **Action:** Export the 5 `wishlists` and 4 `wishlist_items` rows into `cedar_data_dump.sql` and `cedar_data_dump.json`.
* **Method:** Query both tables and append their `INSERT INTO` statements to achieve 100.0% data capture (868/868 rows).

### Priority 4: Reconcile Local Migration Directory (Task 0.2)
* **Action:** Safely archive the 58 disordered local files into `supabase/archive/` and generate a single unified baseline migration (`20260122000000_remote_baseline.sql`) representing the verified remote schema.

---

## 10. CONCLUSION & NEXT STEPS

The live Cedar Elevators database is healthy, intact, and contains **868 live records**.  
However, the initial backup is **data-rich but DDL-poor**: it holds the data rows, but lacks the structural DDL, procedural logic, security policies, and binary assets required to rebuild the system from scratch.

**Recommendation:**  
Execute Priority 1, 2, and 3 (all 100% read-only exports taking < 2 minutes) to achieve a complete, foolproof backup archive before any schema alterations or remediation tasks begin.
