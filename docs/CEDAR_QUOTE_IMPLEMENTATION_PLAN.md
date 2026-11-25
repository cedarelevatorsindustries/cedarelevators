# Cedar Elevators — Unified Quotation Implementation Plan

**Date:** 2026-11-25  
**Target State:** One cohesive, guest-first B2B quotation system preserving all 5 historical quote records, existing catalog/filters, and Supabase admin authentication.

---

## Phased Execution Roadmap

### Phase 1 — Foundation & Security (Complete)
- Audit live Supabase schema, constraints, triggers, functions, and RLS policies.
- Remediate all `{public}`/`anon` guest PII exposure on `quotes`, `quote_items`, `quote_attachments`, `quote_admin_responses`, `quote_audit_log`, `quote_counters`.
- Add additive columns (`company_name`, `gst_number`, `project_name`, `project_location`, `request_type`, `currency`, tax/discount/revision/token fields) and new tables (`quote_revisions`, `quote_notifications`, `quote_email_verifications`, `quote_guest_sessions`) + private `quote-documents` storage bucket.
- Align `quotes_status_check1` and `quote_audit_log_action_type_check` with canonical lifecycle (`submitted -> reviewing -> quoted | rejected | expired`, preserving legacy `approved`, `pending`, `converted`, `draft`).
- Fix `increment_quote_counter` off-by-one and unify `generate_quote_number()` trigger fallback.
- Create transactional `create_quote_atomic` RPC.

### Phase 2 — Unified Quotation Engine
- Replace 4 fragmented Zod schemas with one unified `quoteSubmissionSchema` enforcing server-side conditional `company_name` (mandatory for `>= 2` distinct products) and optional GSTIN format check.
- Rewrite `POST /api/quotes` to validate products/variants from DB, calculate snapshots, support idempotency keys, call `create_quote_atomic`, persist durable rate limits (Upstash Redis + fallback), generate single-quote access token (stored as SHA-256 hash), and dispatch notifications via outbox.
- Unify `src/lib/quote-state-machine.ts` & `src/types/b2b/quote.ts` while preserving legacy display compatibility.

### Phase 3 — Customer Quotation Experience
- Update `/quotes/new` (`NewQuotePage`) to resolve `productId` (single), `productIds` (Quote List multi-product, plus quantities/variants from wishlist session), or empty (general enquiry).
- Update `QuoteForm` & `QuoteItemsInput` with conditional Company Name indicator, optional GSTIN, Project Name, Project Location, product/variant/spec preview, and idempotency key per form submit attempt.
- Update Quote List (`WishlistProductCard` / `WishlistActions`) to support per-item quantity adjustments and carry all items cleanly into `/quotes/new`.
- Fix `/quotes/success` hardcoded `itemsCount={2}` bug and link to `/quotes/track`.

### Phase 4 — Admin Quotation Workspace
- Enforce `requireAdmin()` across every function in `src/lib/actions/admin-quotes/*` (view: `staff`, review/price/issue/reject: `manager`, delete: `admin`).
- Enhance `/admin/quotes` with search (quote #, customer, email, company), status/request-type/date filters, pagination, and sorting.
- Enhance `/admin/quotes/[id]` with structured Company/GST/Project details, item pricing & item discount, quotation-level discount, configurable GST rate (validated against `tax_settings`), validity period, terms & conditions, customer message, private internal notes, notification delivery log & retry, revision history, PDF preview/download, and explicit **Issue Quotation** / **Reissue Revision** workflow.

### Phase 5 — Quotation PDF & Email Outbox
- Build `src/lib/services/quote-pdf.ts` with `jspdf` + `jspdf-autotable` generating multi-page, crisp A4 quotations using verified `store_settings` branding (`public/logo/cedarelevators.png`), integer-paise arithmetic, CGST/SGST or IGST/GST breakdown, terms, and validity.
- Upload issued PDFs to private Supabase Storage (`quote-documents/{quoteId}/rev-{n}.pdf`) with SHA-256 integrity hash before transitioning status to `quoted`.
- Implement Resend notifications logged in `quote_notifications`:
  1. Customer submission confirmation (`We received your quotation request — [QUOTE_NUMBER]`)
  2. Admin new quotation alert
  3. Customer quotation issued (`Your Cedar Elevators quotation is ready — [QUOTE_NUMBER]`)
  4. Safe admin retry for failed notifications without duplicating quotes/revisions.

### Phase 6 — Secure Guest Access & History
- Individual access: `/quotes/view/[token]` + short-lived HttpOnly cookie session + authorized PDF download route `/api/quotes/view/[token]/pdf` (strictly hiding pricing until `quoted`/`approved`).
- Guest history: `/quotes/track` & `/quotes/track/verify` using 6-digit email OTP (SHA-256 hashed, 10-min expiry, 5 attempt limit, 60s resend cooldown, generic non-enumerating responses) establishing a short-lived HttpOnly cookie backed by `quote_guest_sessions`, plus sign-out.

### Phase 7 — Lifecycle, Regression & Verification
- Update `/api/cron/quotes/expiry` to expire both `quoted` and legacy `approved` quotes past `valid_until` safely and idempotently.
- Verify direct PostgREST anonymous access returns 0 rows, run TypeScript (`tsc --noEmit`), ESLint, production build (`pnpm build`), and end-to-end acceptance tests.
- Complete `docs/CEDAR_QUOTE_ACCEPTANCE_REPORT.md`.
