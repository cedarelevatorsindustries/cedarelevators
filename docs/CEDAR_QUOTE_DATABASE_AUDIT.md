# Cedar Elevators — Quotation Database Audit

**Audit Date:** 2026-11-25  
**Database:** Supabase PostgreSQL (`hbkdbrxzqaraarivudej`) — Verified via read-only Supabase MCP queries.

---

## 1. Involved Tables & Current Row Counts

| Table | Purpose | Current Row Count | Phase 1 Active? |
|---|---|---:|---|
| `quotes` | Master quotation header | **5** | Yes |
| `quote_items` | Line items per quotation | **5** | Yes |
| `quote_counters` | Daily sequence per user type (`date`, `user_type`, `last_number`) | **10** | Yes |
| `quote_audit_log` | Status & priority change log (via trigger `log_quote_status_change`) | **3** | Yes |
| `quote_attachments` | Uploaded specs/drawings per quote | **1** | Legacy (`createQuote()` only) |
| `quote_admin_responses` | Admin responses table | **0** | Legacy / Unused by `POST /api/quotes` |
| `quote_baskets` | Authenticated user persistent quote basket | **0** | Legacy / Unused (`wishlists` used instead) |
| `wishlists` / `wishlist_items` | Storefront **Quote List** shortlist storage (guest `session_id` + `user_id`) | Active | Yes |

---

## 2. Historical Data Integrity (`quotes` Breakdown)

Queried directly from `public.quotes`:

| `account_type` | `status` | Count | With `user_id` | Guest (`user_id IS NULL`) |
|---|---|---:|---:|---:|
| `business` | `approved` | 1 | 1 | 0 |
| `business` | `rejected` | 1 | 1 | 0 |
| `business` | `reviewing` | 1 | 1 | 0 |
| `guest` | `approved` | 1 | 0 | 1 |
| `guest` | `reviewing` | 1 | 0 | 1 |
| **Total** | | **5** | **3** | **2** |

- All 5 historical quotes and 5 `quote_items` conform to existing constraints (`quotes_account_type_check`, `quotes_status_check1`, `quote_items_quantity_check1`).
- No `individual` (B2C) quotes exist in the database.

---

## 3. Schema, Columns & Drift Analysis

### `public.quotes`
- **Identity & Ownership:** `id` (uuid PK), `quote_number` (text, nullable), `user_id` (text, nullable), `account_type` (text NOT NULL: `'guest' | 'individual' | 'business'`).
- **Contact Duplication:** Stores **both** `guest_name`, `guest_email`, `guest_phone` **and** `requester_name`, `requester_email`, `requester_phone` (both populated identically by `POST /api/quotes`, while legacy `createQuote()` only populates `guest_*`).
- **Missing Company/Project Columns:** No `company_name`, `gst_number`, `project_name`, or `project_location` columns exist. `POST /api/quotes` prepends `[Company: ...]` to `notes`.
- **Status & Priority:**
  - DB Check Constraint `quotes_status_check1`: `status IN ('draft', 'submitted', 'reviewing', 'approved', 'rejected')`.
  - **Mismatch:** `src/lib/quote-state-machine.ts` & `src/types/b2b/quote.ts` expect `'pending'`, `'converted'`, `'expired'` — none of `'pending'`, `'converted'`, or `'expired'` are permitted by `quotes_status_check1`!
  - DB Check Constraint `quotes_priority_check`: `priority IN ('low', 'normal', 'high', 'urgent')`.
- **Pricing & Lifecycle:** `subtotal`, `discount_total`, `tax_total`, `estimated_total`, `approved_by` (uuid), `approved_at`, `valid_until`, `rejected_at`, `rejected_reason`, `converted_at`, `admin_notes`, `admin_internal_notes`, `admin_response_message`, `admin_response_at`, `checkout_enabled`, `approved_pricing` (jsonb).

### `public.quote_items`
- `id` (uuid PK), `quote_id` (uuid FK -> `quotes.id` `ON DELETE CASCADE`), `product_id` (uuid FK -> `products.id` `ON DELETE SET NULL`), `variant_id` (uuid nullable, **no FK constraint**), `quantity` (int NOT NULL, `CHECK (quantity > 0)`), `unit_price`, `total_price`, `discount_percentage`, `product_name` (text NOT NULL), `product_sku` (varchar), `product_thumbnail` (text), `bulk_pricing_requested` (boolean), `notes` (text).
- **Gap:** Missing `variant_title` / `specifications` snapshot columns on `quote_items`.

### Database Functions & Triggers
1. `increment_quote_counter(p_date date, p_user_type text)` — Locks row and increments `quote_counters(date, user_type)` (`CED-QT-{TYPE}-{YYMMDD}-{SEQ}`). Note: on initial insert, inserts `last_number = 1` then immediately `UPDATE ... SET last_number = last_number + 1`, so first quote of the day starts at `000002` instead of `000001`.
2. `generate_quote_number()` — Legacy trigger function generating `Q-000001` from `quote_number_seq` when `NEW.quote_number IS NULL`.
3. `log_quote_status_change()` — Trigger logging `status_changed` and `priority_changed` into `quote_audit_log`.
4. `create_order_from_quote(...)` — Legacy Phase 2 RPC referencing `business_addresses`, `user_addresses`, `orders`, `order_items`.

---

## 4. Critical Security & RLS Findings

> **CRITICAL SECURITY FINDING (Documented Only — Not Modified):**  
> On `public.quotes` and `public.quote_items`, the following RLS policies apply to role `{public}`:
> - `quotes`: `Users can read own quotes` (`SELECT` where `(user_id = jwt.sub) OR (user_id IS NULL)`)
> - `quote_items`: `Users can read own quote items` (`SELECT` where `quote_id IN (SELECT id FROM quotes WHERE user_id = jwt.sub OR user_id IS NULL)`)
> - `quote_attachments`: `Users can read own attachments` (`... OR user_id IS NULL`)
>
> Because `user_id IS NULL` is true for **all guest quotes**, any unauthenticated user with the public Supabase `anon` key can query `quotes` and `quote_items` directly via PostgREST and read **every guest customer's PII** (`guest_name`, `guest_email`, `guest_phone`, `notes`).  
> **Recommendation:** Remove `OR (user_id IS NULL)` from public `SELECT` policies on `quotes`, `quote_items`, and `quote_attachments`. Guest submissions already use `createAdminClient()` (service role) inside `POST /api/quotes` and do not need public `SELECT` access.
