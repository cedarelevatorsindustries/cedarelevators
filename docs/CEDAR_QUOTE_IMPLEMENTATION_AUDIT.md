# Cedar Elevators — Quotation Implementation Audit

**Date:** 2026-11-25  
**Scope:** Complete repository, API, server action, and live Supabase PostgreSQL schema inspection prior to unified Phase 1 implementation.

---

## 1. Existing Architecture Summary

Cedar Elevators previously accumulated three partially overlapping quotation flows (`guest`, `individual`, `business`) across UI, validation schemas, server actions, and RLS policies:

1. **Customer Entry Points:**
   - `/quotes` (`src/app/(main)/quotes/page.tsx`) redirects guests to `/quotes/new`.
   - `/quotes/new` (`src/app/(main)/quotes/new/page.tsx`) reads only `productId`, `productName`, `quantity`, `variantId` (ignoring `productIds` passed by Quote List `/wishlist`).
   - `/quotes/success` (`src/app/(main)/quotes/success/page.tsx`) passes hardcoded `itemsCount={2}` to `QuoteConfirmationPage`.
   - `/quotes/[id]` (`src/app/(main)/quotes/[id]/page.tsx`) and `/profile/quotes` are Clerk-gated (`redirect('/sign-in')`).
   - `/wishlist` (renamed to **Quote List**) stores selected items in `wishlists` + `wishlist_items` via `guest_session_id` cookie and navigates to `/quotes/new?productIds=...`.

2. **Submission API & Legacy Server Actions:**
   - Active Phase 1 form (`src/modules/quote/components/quote-form.tsx`) submits via `POST /api/quotes` (`src/app/api/quotes/route.ts`) using `createAdminClient()`.
   - Legacy `createQuote()` (`src/lib/actions/quotes.ts`) uses Clerk + `createClerkSupabaseClient()` and is orphaned by the current form.
   - `POST /api/quotes` previously inserted `quotes` first and `quote_items` second without a transaction (partial-creation risk), lacked idempotency, stuffed `company_name` into `notes` as `[Company: ...]`, lacked conditional company validation for bulk requests, lacked variant/specification validation & snapshots, and used in-memory IP rate limiting only.

3. **Database Schema & Numbering (Live Inspection):**
   - `quotes` (5 historical rows: 2 `guest`, 3 `business`), `quote_items` (5 rows), `quote_counters` (10 rows), `quote_audit_log` (3 rows), `quote_attachments` (1 row), `quote_admin_responses` (0 rows), `quote_baskets` (0 rows).
   - **Status Mismatch:** Live DB constraint `quotes_status_check1` allowed only `draft, submitted, reviewing, approved, rejected`, whereas `src/lib/quote-state-machine.ts` and `admin-quotes` referenced `pending, converted, expired`. Historical rows contain `'reviewing'`, `'approved'`, `'rejected'`.
   - **Numbering Conflict:** `set_quote_number` trigger executed `generate_quote_number()` (`Q-000001`), while `increment_quote_counter()` RPC returned `000002` on the first call of each day (`INSERT ... VALUES (..., 1)` then `UPDATE + 1`).
   - **Missing Columns:** `quotes` lacked structured `company_name`, `gst_number`, `project_name`, `project_location`, `request_type`, `currency`, `issued_at`, `issued_by`, `terms_and_conditions`, `current_revision`, `latest_pdf_path`, `access_token_hash`, `idempotency_key`; `quote_items` lacked `variant_title`, `variant_sku`, `specifications`, `discount_amount`, `tax_rate`, `tax_amount`, `line_total`.

4. **Security & Authorization Findings (Pre-Remediation):**
   - **Release Blocker Fixed:** `quotes`, `quote_items`, `quote_attachments` had `{public}` RLS policies containing `OR (user_id IS NULL)`, exposing all guest quotes and PII to anonymous PostgREST queries. `quote_audit_log` and `quote_counters` had RLS disabled (`relrowsecurity = false`).
   - **Admin Auth Bypass:** `src/lib/actions/admin-quotes/quote-status.ts` had `canApproveQuotes()` commented out, and `quote-pricing.ts`, `quote-management.ts`, `quote-queries.ts`, `quote-messages.ts` did not invoke `requireAdmin()`.
   - **JWT Metadata RLS:** `quotes` had admin RLS policies reading `jwt.user_metadata->>'role'` rather than `public.is_admin()`.

5. **Verified Commercial Configuration (From Live DB & Assets):**
   - `store_settings`: `store_name` = `"Cedar Elevators Industries"`, `address_line1` = `"67/37, N Mada St, Padi"`, `address_line2` = `"D.S.Complex"`, `city` = `"Chennai"`, `state` = `"Tamil Nadu"`, `postal_code` = `"600050"`, `country` = `"India"`, `support_email` = `"support@cedarelevator.com"`, `support_phone` = `"+91 8220202757"`, `whatsapp_number` = `"+91 82202 02757"`, `gst_number` = `"9784562318546"`, `currency` = `"INR"`.
   - `tax_settings`: `gst_enabled = true`, `default_gst_percentage = 18.00`, `prices_include_tax = true`, `use_cgst_sgst_igst = true`, `store_state = "Tamil Nadu"`, `store_gstin = null`.
   - **Note for Admin Issuance:** Because `store_settings.gst_number` (`9784562318546`, 13 chars) is non-standard Indian GSTIN length (15 chars) and `tax_settings.store_gstin` is `null` and `policies` (`terms`) `content` is `[]`, quotation issuance validates GST / terms configuration before issuing and allows admin review/override rather than inventing unverified legal terms or GST numbers.
   - **PDF & Email Dependencies:** `jspdf` (`3.0.4`), `jspdf-autotable` (`5.0.7`), `resend` (`4.0.1`), `@upstash/redis` (`1.36.0`) are already installed and configured. Logo asset exists at `public/logo/cedarelevators.png`.

---

## 2. Exact Files Modified / Added Across Implementation

- **Database Migrations (Supabase):** `test_additive_quote_columns`, `harden_quote_rls_policies_via_alter`, `add_quote_items_revisions_notifications_sessions_tables`, `update_quote_constraints`, `create_quote_atomic_and_backfill`.
- **Quotation Engine & Domain (`src/lib/`):** `quote-state-machine.ts`, `utils/quote-number-generator.ts`, `services/quote-service.ts`, `services/quote-pdf.ts`, `services/quote-notifications.ts`, `services/email.ts`, `services/rate-limit.ts`, `auth/guest-quote-auth.ts`, `actions/admin-quotes/*`, `actions/quotes.ts`.
- **Customer UI & Routes:** `src/modules/quote/forms/quote-schema.ts`, `src/modules/quote/components/quote-form.tsx`, `src/modules/quote/components/quote-items-input.tsx`, `src/app/(main)/quotes/new/page.tsx`, `src/app/(main)/quotes/success/page.tsx`, `src/app/(main)/quotes/view/[token]/page.tsx`, `src/app/(main)/quotes/track/page.tsx`, `src/app/(main)/quotes/track/verify/page.tsx`, `src/modules/wishlist/*`.
- **API Endpoints:** `src/app/api/quotes/route.ts`, `src/app/api/quotes/view/[token]/route.ts`, `src/app/api/quotes/view/[token]/pdf/route.ts`, `src/app/api/quotes/track/request-code/route.ts`, `src/app/api/quotes/track/verify/route.ts`, `src/app/api/quotes/track/history/route.ts`, `src/app/api/quotes/track/logout/route.ts`, `src/app/api/admin/quotes/[id]/pdf/route.ts`, `src/app/api/cron/quotes/expiry/route.ts`.
- **Admin Workspace:** `src/app/admin/(dashboard)/quotes/page.tsx`, `src/app/admin/(dashboard)/quotes/[id]/page.tsx`, `src/domains/admin/components/*`.
