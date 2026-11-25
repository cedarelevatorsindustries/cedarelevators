# Cedar Elevators — Database Migrations Log

**Database:** Supabase PostgreSQL (`hbkdbrxzqaraarivudej`)  
**Policy:** Strictly additive, reversible migrations. Zero table drops, zero truncation, zero historical data deletion. All 5 existing `quotes` and 5 `quote_items` preserved intact.

---

## Applied Migrations

### 1. `test_additive_quote_columns`
Added nullable / defaulted columns to `public.quotes`:
- `company_name text`, `gst_number text`, `project_name text`, `project_location text`
- `request_type text DEFAULT 'general'`, `currency text DEFAULT 'INR'`
- `overall_discount_type text DEFAULT 'fixed'`, `overall_discount_value numeric(12,2) DEFAULT 0`
- `tax_rate numeric(5,2) DEFAULT 0`, `tax_enabled boolean DEFAULT true`, `taxable_amount numeric(12,2) DEFAULT 0`
- `terms_and_conditions text`
- `reviewing_started_at timestamptz`, `reviewing_by uuid`
- `issued_at timestamptz`, `issued_by uuid`, `rejected_by uuid`, `expired_at timestamptz`
- `current_revision integer DEFAULT 0`, `latest_pdf_path text`
- `access_token_hash text`, `access_token_expires_at timestamptz`, `access_token_revoked_at timestamptz`
- `idempotency_key text`

### 2. `harden_quote_rls_policies_via_alter`
- Enabled RLS on `quote_audit_log` and `quote_counters` (alongside `quotes`, `quote_items`, `quote_attachments`, `quote_admin_responses`).
- Altered `Users can read/insert/update own quotes`, `Users can read/insert own quote items`, `Users can read/insert own attachments`, `Users can read admin responses` from `{public}` to `{authenticated}` and removed `OR (user_id IS NULL)`.
- Altered `Allow guest insert quote items` (`{anon}`) to `WITH CHECK (false)`.
- Altered `Admins can read/update all quotes` from untrusted JWT metadata checks to `public.is_admin()`.
- Added `service_role` full-access and `is_admin()` SELECT policies on `quote_audit_log` and `quote_counters`.

### 3. `add_quote_items_revisions_notifications_sessions_tables`
- Added snapshot & pricing columns to `public.quote_items`: `variant_title`, `variant_sku`, `specifications`, `discount_amount`, `tax_rate`, `tax_amount`, `line_total`.
- Added `actor_type text DEFAULT 'system'` to `public.quote_audit_log`.
- Added `default_quote_validity_days`, `quote_terms_and_conditions`, `admin_notification_email` to `public.store_settings`.
- Created indexes on `quotes(idempotency_key)` (unique partial), `quotes(access_token_hash)`, `quotes(lower(guest_email))`, `quotes(lower(requester_email))`.
- Created RLS-protected tables:
  - `public.quote_revisions` (immutable issued quotation snapshots & storage pointers)
  - `public.quote_notifications` (email delivery outbox with `dedupe_key`)
  - `public.quote_email_verifications` (hashed OTP verification challenges)
  - `public.quote_guest_sessions` (hashed guest history sessions)
- Created private storage bucket `quote-documents` (`public = false`, PDF only, 10 MB limit).
- Fixed `public.increment_quote_counter` off-by-one (`VALUES (p_date, p_user_type, 0)` before `+1` update) and unified `public.generate_quote_number()` trigger fallback.

### 4. `update_quote_constraints`
- Updated `quotes_status_check1` to allow `('draft', 'pending', 'submitted', 'reviewing', 'quoted', 'approved', 'rejected', 'expired', 'converted')`.
- Added `quotes_request_type_check` (`'general' | 'single' | 'bulk'`) and `quotes_overall_discount_type_check` (`'fixed' | 'percentage'`).
- Updated `quote_audit_log_action_type_check` to include all submission, review, pricing, revision/issuance, PDF, email notification, and guest-access audit events.

### 5. `create_quote_atomic_and_backfill`
- Non-destructively backfilled `requester_*`, `request_type`, `issued_at`, `issued_by`, `taxable_amount` on the 5 existing historical rows.
- Created `public.create_quote_atomic(...)` RPC (`SECURITY DEFINER`) executing idempotency check, conditional bulk company rule verification, IST counter numbering, atomic `quotes` + `quote_items` + `quote_audit_log` insertion in a single database transaction.
