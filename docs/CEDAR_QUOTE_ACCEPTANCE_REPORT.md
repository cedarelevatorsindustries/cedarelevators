# Cedar Elevators — Quotation Module Acceptance Report

**Date:** 2026-11-25  
**Target:** Unified Guest-First Phase 1 Quotation System  
**Build & Type Status:** `npx tsc --noEmit` (Pass, 0 errors), `npx eslint` on quotation module (0 errors), `pnpm build` (`next build --webpack`, Pass, 153/153 static pages + all dynamic/API routes compiled cleanly).

---

## 1. Verification Summary

### Verified Against Live Build / Database / HTTP Server
- **Database Integrity:** All 5 historical `quotes` and 5 `quote_items` preserved intact (`quotes_count = 5`, `quote_items_count = 5`). Additive migrations only; zero destructive drops/truncations.
- **RLS Isolation (Live PostgREST Anon Key Test):** Direct REST queries using `NEXT_PUBLIC_SUPABASE_ANON_KEY` returned `0` rows across `quotes`, `quote_items`, `quote_audit_log`, `quote_revisions`, `quote_notifications`, `quote_email_verifications`, `quote_guest_sessions`, and `quote_counters`.
- **Storefront & Route Availability (`next start` production build):**
  - `GET /products` -> `200`
  - `GET /categories` -> `200`
  - `GET /wishlist` (Quote List) -> `200`
  - `GET /quotes/new` -> `200`
  - `GET /quotes/new?from=quote-list&productIds=...` -> `200`
  - `GET /quotes/track` -> `200`
  - `GET /quotes/track/verify` -> `200`
  - `GET /quotes/success?quoteNumber=TEST&itemsCount=0` -> `200`
  - `GET /quotes/view/invalid-token-test` -> `200` (renders invalid-link screen, exposes 0 quote fields)
- **Server-Side Validation & Security Enforcement (`next start` production build):**
  - `POST /api/quotes` with 2 distinct products and missing `company_name` -> `400` (`"Company name is required for bulk quotation requests with 2 or more products."`)
  - `POST /api/quotes` with malformed GSTIN -> `400`
  - `POST /api/quotes` with invalid/non-existent `product_id` -> `400`
  - `POST /api/quotes` with `hp_website` honeypot filled -> `200` spam trap response (no DB record created)
  - `GET /api/quotes/track/history` without verified guest cookie -> `401`
  - `GET /api/quotes/view/invalid-token-123/pdf` -> `404`
  - `GET /api/admin/quotes/[id]/pdf` without active Supabase admin session -> `401`
  - `POST /api/quotes/track/verify` with invalid OTP -> `401`
- **PDF Rendering:** Confirmed `public/logo/cedarelevators.png` exists and `jspdf` + `jspdf-autotable` produces valid `%PDF-` buffers.

### Implemented — Requires Manual / Live Credential E2E Walkthrough
The following end-to-end stateful flows are implemented, compiled cleanly, and wired to the live Supabase & Resend architecture, and should be executed once with a real admin login and real test email inbox to verify external delivery:
1. Full browser submit of General, Single-Product, and Quote List Bulk quotation (`POST /api/quotes` -> `create_quote_atomic` -> `/quotes/success` -> Resend customer confirmation & admin alert emails).
2. Admin login on `/admin/quotes/[id]` -> pricing save -> PDF preview -> **Issue Quotation** (uploads to private `quote-documents` bucket, creates `quote_revisions` Rev 1, updates status to `quoted`, sends issued email) -> **Reissue Revision 2** -> **Reject Quotation**.
3. Customer opening `/quotes/view/[token]` before and after issuance + downloading private PDF via `/api/quotes/view/[token]/pdf`.
4. Customer completing 6-digit email OTP verification on `/quotes/track` -> `/quotes/track/verify` -> viewing multiple historical quotes -> downloading issued PDF -> ending session via **End Session**.
5. Automated cron expiry (`GET /api/cron/quotes/expiry` with `CRON_SECRET`).

---

## 2. Configuration Notes Observed During Verification

1. **Upstash Redis Host (`UPSTASH_REDIS_REST_URL`):** Live server verification logged `ENOTFOUND full-imp-14776.upstash.io`. `src/lib/services/rate-limit.ts` automatically fell back to in-memory rate limiting without failing requests, but updating `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` in `.env` is recommended for multi-instance serverless rate limiting on Vercel.
2. **Store GSTIN & Terms Configuration:** `tax_settings.store_gstin` is `null` and `store_settings.gst_number` is `'9784562318546'` (13 characters instead of standard 15-character Indian GSTIN), while `policies` (`terms`) `content` is `[]`. Admin UI surfaces missing GSTIN warning and lets administrators review/edit terms per quotation before issuance rather than fabricating unverified commercial terms.
3. **Admin Notification Recipient:** Reads `store_settings.admin_notification_email` -> `process.env.ADMIN_NOTIFICATION_EMAIL` -> `store_settings.support_email` (`support@cedarelevator.com`). Update `store_settings.admin_notification_email` or `ADMIN_NOTIFICATION_EMAIL` if alerts should route to a dedicated sales inbox.
