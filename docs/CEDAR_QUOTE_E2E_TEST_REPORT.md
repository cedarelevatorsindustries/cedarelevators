# Cedar Elevators — Unified Quotation Module E2E Test & Stabilization Report

**Test Date:** 2026-11-26  
**Environment Audited:** Local Next.js 16.1.1 (Node v22.14.0) connected to live Supabase (`hbkdbrxzqaraarivudej`) & live Resend (`updates.cedarelevators.in`)

---

## A. Executive Summary

- **Overall Health:** Core storefront submission, atomic PostgreSQL persistence, Quote List prefill, Resend customer transactional delivery, guest OTP cooldown/session revocation, issued private PDF downloads, anonymous RLS isolation, and expiry cron workflows are **operational and verified passing** (`5/5` unit tests, `19/19` live E2E integration/security checks, `tsc` + `eslint` `0` errors, `pnpm build` exit `0`).
- **Original "Unable to reach the server right now" Root Cause:**
  1. **Upstash Redis DNS Retry Hang (`ENOTFOUND full-imp-14776.upstash.io`):** `src/lib/services/redis.ts` initialized `@upstash/redis` with default exponential retries enabled (~5 retries per command). Because `POST /api/quotes` called `checkRateLimit()` sequentially for IP and email, every request blocked for **~11.7–13.0 seconds** before falling back to in-memory rate limiting—causing serverless/client timeouts and timed-out requests during dev rebuilds (`5s+` timeout observed on port `3000`).
  2. **Non-JSON Response Handling in Client Form:** `src/modules/quote/components/quote-form.tsx` previously called `response.json()` unconditionally and caught all errors with a generic `"Unable to reach the server right now"` message, masking HTML error responses or timeouts.
  3. **Secondary Issues Discovered & Fixed During Testing:**
     - **Quote List / PDP Prefill Flash (`quote-items-input.tsx`):** `productOptions` initialized to `[]` instead of pre-populating from `initialItems`, hiding prefilled product names until the client Server Action completed.
     - **Malformed JSON HTTP Code (`POST /api/quotes`):** Invalid JSON returned `500` instead of `400 Bad Request`.
     - **Resend Sender Verification:** `RESEND_FROM_EMAIL` previously referenced unverified apex domain `@cedarelevators.in` instead of the verified Resend subdomain `updates.cedarelevators.in`.
- **Fixes Applied & Latency Verified:** Disabled `@upstash/redis` retries (`retry: false`), added a fast-fail `1,000ms` timeout and 5-minute circuit breaker in `redis.ts`/`rate-limit.ts` (cutting full `POST /api/quotes` + DB + Resend time from **13.0s** down to **1.3s–2.9s**), improved client timeout/non-JSON error differentiation, populated `productOptions` from `initialItems`, returned `400` on malformed JSON, and updated `.env` / `email.ts` to use the verified `updates.cedarelevators.in` domain and API key.

---

## B. Environment & External Service Configuration Audit

| Configuration / Variable | Status | Notes / Action |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` / `ANON` / `SERVICE_ROLE` | Present & Operational | Verified live queries, `create_quote_atomic` RPC, private storage, and RLS |
| `RESEND_API_KEY` | Updated & Operational | Updated to new `Cedar Mailer` key; live send succeeded (`provider_message_id` returned) |
| `RESEND_FROM_EMAIL` | Updated & Operational | Set to verified domain `Cedar Elevators <noreply@updates.cedarelevators.in>` |
| `ADMIN_NOTIFICATION_EMAIL` / `store_settings.admin_notification_email` | Fallback active | `admin_notification_email` is `null`; falls back to `store_settings.support_email` (`support@cedarelevator.com`) |
| `UPSTASH_REDIS_REST_URL` (`stirring-wren-221328.upstash.io`) | Updated & Operational | Provisioned Upstash Redis DB `cedarelevators` (`ap-south-1` / Mumbai, Free Tier); `PING`/`SET`/`GET`/`INCR`/`DEL` verified live via `@upstash/redis` (`src/lib/redis.ts`) with circuit-breaker fallback intact |
| `tax_settings.store_gstin` | `null` in DB | `tax_settings.gst_enabled = true`, `default_gst_percentage = 18.00`, `store_state = Tamil Nadu`, `store_gstin = null` (`store_settings.gst_number` has legacy non-15-char `"9784562318546"`). Admin issuance blocks GST quotes until valid Store GSTIN is configured |
| `CRON_SECRET` | Present & Operational | Verified `401` without secret and `200` with `Bearer <CRON_SECRET>` |
| `GUEST_QUOTE_SECRET` | Optional fallback used | Uses `SUPABASE_SERVICE_ROLE_KEY` server pepper cleanly; setting a dedicated `GUEST_QUOTE_SECRET` is recommended for rotation hygiene |

---

## C. Automated Test Coverage (`tests/quote-module.test.mjs` & `e2e_comprehensive.mjs`)

| # | Test Case | Method | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| U1–U5 | Unit tests (GSTIN regex, integer paise math, zero legacy B2B UI strings, Redis circuit-breaker, Resend sender domain) | `node --test tests/quote-module.test.mjs` | 5/5 pass | 5/5 pass (`92.7ms`) | PASS |
| E1 | General Enquiry `POST /api/quotes` + speed + Resend | HTTP + Supabase + Resend (`delivered@resend.dev`) | `201`, `emailStatus=sent`, `< 8s` | `201`, `CED-QT-GS-261126-000009`, `emailStatus=sent`, `2364ms` | PASS |
| E2 | Single-Product Quote (no company required) | HTTP + Supabase | `201`, `requestType=single`, `itemsCount=1` | `201`, `CED-QT-GS-261126-000010`, `3012ms` | PASS |
| E3 | Idempotent duplicate key retry | HTTP + Supabase | `200`, `duplicate=true`, same `quoteId` | `200`, `duplicate=true`, `quoteIdMatch=true` | PASS |
| E4 | Bulk Multi-Product Quote (2 products + company + GSTIN) | HTTP + Supabase | `201`, `requestType=bulk`, `itemsCount=2` | `201`, `CED-QT-GS-261126-000011`, `items=2` | PASS |
| E5 | Outbox notification delivery tracking | Supabase `quote_notifications` | `status=sent` + Resend ID | `status=sent`, `msgId=01a21825-abc3-7291-a486-84a95eb9ca19` | PASS |
| E6 | Atomic DB product snapshots (`quote_items`) | Supabase `quote_items` | 2 item snapshots persisted | `storedItems=2` | PASS |
| E7 | Negative validation (name, email, phone, bulk no company, GSTIN, bad product UUID, qty 0, notes > 1000, malformed JSON, honeypot) | HTTP `POST /api/quotes` | `400` for invalid inputs; trap response on honeypot | All 9 `400` + honeypot `CED-QT-GS-RECEIVED` | PASS |
| E8 | In-memory IP rate-limit threshold | 11 rapid POSTs | Blocks excess with `429` | `triggered=true` (`429`) | PASS |
| E9 | Quote List `/wishlist` prefill into `/quotes/new?from=quote-list` | Cookie session + SSR HTML | Both product names present immediately | `200`, `includesProd1=true`, `includesProd2=true` | PASS |
| E10 | Guest OTP request email (`POST /api/quotes/track/request-code`) | HTTP + Resend | `200`, code sent | `200` | PASS |
| E11 | Guest OTP 60s resend cooldown | Immediate repeat POST | `429` | `429` | PASS |
| E12 | Invalid 6-digit OTP verify | `POST /api/quotes/track/verify` | `401` | `401` | PASS |
| E13 | Unauthenticated tracking history | `GET /api/quotes/track/history` | `401` | `401` | PASS |
| E14 | Authenticated guest history & pre-issuance pricing guard | Session cookie + HTTP | Lists quotes, `quoted_total=null`, `can_download_pdf=false` | `200`, `total=3`, `pricingHidden=true` | PASS |
| E15 | Unissued quotation PDF blocked | `GET /api/quotes/track/[id]/pdf` | `403` | `403` | PASS |
| E16 | Issued PDF retrieval via guest session & secure `/quotes/view/[token]` | Private bucket + HTTP | Valid `%PDF-` bytes & token page renders quote # | `200` (`1012590B`, `%PDF-` header verified) | PASS |
| E17 | Guest session termination (`logout`) | `POST /logout` -> `GET /history` | `200` logout -> `401` on subsequent read | `logout=200`, `postLogoutHistory=401` | PASS |
| E18 | Expiry Cron (`CRON_SECRET` + live past-due quote + idempotency) | `GET /api/cron/quotes/expiry` | `401` unauth; expires overdue quote; `0` on rerun | `unauth=401`, `run1=1` (`dbStatus=expired`), `run2=0` | PASS |
| E19 | Bad token + Anon RLS (9 tables) + Private bucket | HTTP + Anon Supabase SDK | `404` PDF; `0` anon rows; `public=false` | `badTokenPdf=404`, `rlsZeroRows=true`, `bucketPublic=false` | PASS |

*(Synthetic test rows, storage test PDFs, temporary wishlists, and temporary guest sessions created during `e2e_comprehensive.mjs` were deleted cleanly on exit.)*

---

## D & E. Security & Workflow Verification Summary

- **RLS & Storage Privacy:** Anonymous queries via `NEXT_PUBLIC_SUPABASE_ANON_KEY` returned `0` rows (or permission error) across `quotes`, `quote_items`, `quote_counters`, `quote_audit_log`, `quote_revisions`, `quote_notifications`, `quote_email_verifications`, `quote_guest_sessions`, and `quote_admin_responses`. The `quote-documents` bucket has `public: false`.
- **RBAC & Endpoint Protection:** Unauthenticated requests to `/api/admin/quotes/[id]/pdf`, `/api/cron/quotes/expiry`, and `/api/quotes/track/history` all returned `401 Unauthorized`.

---

## F. Bugs Fixed in This Session

1. **Redis Retry Hang (`src/lib/services/redis.ts`, `src/lib/services/rate-limit.ts`):** Disabled `@upstash/redis` default exponential retries (`retry: false`), added `1,000ms` timeout race and 5-minute circuit breaker (`isRedisCircuitOpen` / `tripRedisCircuit`).
2. **Client Error Classification (`src/modules/quote/components/quote-form.tsx`):** Added `25s` `AbortController`, non-JSON response status reporting, and distinct timeout vs network failure copy.
3. **Malformed JSON Status (`src/app/api/quotes/route.ts`):** Caught `request.json()` syntax errors cleanly as `400 Bad Request` instead of `500`.
4. **Quote List Prefill Initial Render (`src/modules/quote/components/quote-items-input.tsx`):** Initialized `productOptions` from `initialItems` so prefilled products render immediately without waiting for client fetch.
5. **Resend Configuration (`.env`, `src/lib/services/email.ts`):** Updated `RESEND_API_KEY` and aligned `RESEND_FROM_EMAIL` / code fallback to the verified `updates.cedarelevators.in` subdomain (`noreply@updates.cedarelevators.in`).

---

## G. Outstanding Issues & Manual Actions

1. **Upstash Redis Provisioned:** Replaced the unreachable `full-imp-14776.upstash.io` endpoint with the live `cedarelevators` Upstash Redis database (`ap-south-1`, `stirring-wren-221328.upstash.io`) in `.env`; distributed Redis caching and rate limiting are now active alongside the fast-fail circuit-breaker fallback.
2. **Admin Commercial Config:** Set a valid 15-character GSTIN in Admin Tax Settings (`tax_settings.store_gstin`) so admins can issue GST-enabled quotations cleanly without configuration warnings.
3. **Browser Interactive Automation Limitation:** The `chrome_devtools` MCP session available here disabled interactive `click`, `fill`, `navigate_page`, and network/console list tools (`click`/`fill` returned disabled-tool errors), so live UI click-through testing inside Chrome and authenticated Supabase Admin browser workflow steps were verified via server-side SSR/API/DB tests rather than interactive Chrome DevTools automation.

---

## H. Final Acceptance Matrix

| Workflow / Requirement | Status | Notes |
| :--- | :--- | :--- |
| Server unreachable / timeout root cause fixed | PASS | Cut `POST /api/quotes` from 13s+ hang / timeout to ~1.3–2.9s |
| General enquiry submission & persistence | PASS | `201 Created`, atomic DB + outbox verified |
| Single-product submission & URL prefill | PASS | `201 Created` + SSR `productId` prefill verified |
| Bulk multi-product submission & conditional company | PASS | `201 Created`, `400` when company missing |
| Quote List (`/wishlist`) prefill transfer | PASS | `from=quote-list` SSR transfer verified |
| Resend customer & OTP emails | PASS | Verified on `delivered@resend.dev` (`updates.cedarelevators.in`) |
| Guest OTP tracking, cooldown & session termination | PASS | Request/cooldown/wrong OTP/history/logout verified via HTTP + DB |
| Issued PDF retrieval & private bucket security | PASS | Valid `%PDF-` bytes via session & token; `403` pre-issuance; `404` bad token |
| Expiry cron (`CRON_SECRET`, transition, idempotency) | PASS | Verified live overdue expiration + `0` on second run |
| Anonymous RLS across all 9 quote tables | PASS | Verified `0` accessible rows with anon key |
| TypeScript (`tsc --noEmit`), ESLint (`0` errors), Build (`pnpm build`) | PASS | Clean exit `0` across all three checks |
| Interactive Chrome DevTools click-through UI E2E | BLOCKED | `click`/`fill`/`navigate_page` disabled on `chrome_devtools` MCP in this session |
| Authenticated Admin Dashboard browser issuance/reissue E2E | NOT TESTED | Interactive admin browser login credentials not used; backend auth guards verified |
