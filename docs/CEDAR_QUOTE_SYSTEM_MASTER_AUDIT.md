# Cedar Elevators — Quotation System Master Audit

**Audit Date:** 2026-11-25  
**Scope:** Strictly read-only technical and functional audit of the three original quotation contexts (Guest, B2C/Individual, B2B/Business) and the current Phase 1 implementation.

---

## 1. Executive Summary

Cedar Elevators originally implemented **three differentiated quotation tiers** (`guest`, `individual` / B2C, and `business` / `verified` B2B) across shared UI/database primitives (`quotes`, `quote_items`, `QuoteForm`, `createQuote()`), layered with Clerk authentication, business verification checks, quote baskets, and quote-to-order conversion.

During **Phase 1 simplification**, the storefront was pivoted to a **guest-accessible B2B product catalogue and quotation request platform**:
- Customer-facing `/quotes` redirects to `/quotes/new` (`src/app/(main)/quotes/page.tsx`).
- `QuoteForm` (`src/modules/quote/components/quote-form.tsx`) now submits **exclusively** to `POST /api/quotes` (`src/app/api/quotes/route.ts`), which creates `account_type = 'guest'` records via `createAdminClient()` with `user_id = null`.
- However, legacy B2C/B2B schemas, permissions, `createQuote()` server action, `quote_baskets`, `/quotes/[id]`, and `convertQuoteToOrder()` remain in the codebase, creating **dual submission paths**, **conflicting permission limits**, and **unwired multi-product prefill** between the Quote List (`/wishlist`) and `/quotes/new`.

---

## 2. Analysis of the Three Original Quotation Systems

### A. Guest Quotation System (`account_type = 'guest'`)

| Dimension | Evidence & Behaviour |
|---|---|
| **Initiation** | Product card `Quote` button (`src/components/ui/product-card.tsx`), PDP `Request a Quote` (`src/modules/products/components/product/price-action-card.tsx`), navbar/hero/footer CTAs linking to `/quotes/new`. |
| **Single vs Bulk** | **Original permissions** (`src/modules/quote/utils/quote-permissions.ts`): `maxItems: 1`, `maxAttachments: 0`, `notesMaxLength: 300`, `canViewList: false`. **Current Phase 1 (`guestQuoteSchema` & `POST /api/quotes`)**: `items: z.array(quoteItemSchema).default([])` — supports `0` (general inquiry), `1`, or `N` items; `notes` max `2000` chars. |
| **Selection Storage** | URL query params (`?productId=...&productName=...&quantity=...&variantId=...`) for single-product prefill, plus `Quote List` (`/wishlist` backed by `wishlists` / `wishlist_items` with `session_id` or `user_id`). |
| **Identity & Contact Fields** | Mandatory: `name` (2–100 chars), `email` (valid email), `phone` (10–20 chars). Optional: `company_name` (max 150 chars, prepended into `notes` as `[Company: ...]`), `notes` (max 2000 chars). |
| **Submission & Spam Guard** | `POST /api/quotes` validates with Zod, checks in-memory IP rate limit (5 requests / 10 min), traps `hp_website` honeypot, generates `CED-QT-GS-{YYMMDD}-{SEQ}` via `increment_quote_counter` RPC, inserts into `quotes` (`user_id: null`, `account_type: 'guest'`, `status: 'reviewing'`, `priority: 'normal'`) and `quote_items`. |
| **Duplicate Submission Prevention** | Client disables submit button while `isSubmitting`; **no** server-side idempotency key or duplicate-payload deduplication exists. |
| **Admin Identification** | `quotes.account_type = 'guest'`, `quotes.user_id IS NULL`, `guest_name`, `guest_email`, `guest_phone`. |
| **Emails** | **Submission:** None sent on `POST /api/quotes` (neither customer confirmation nor admin alert). **Admin decision:** `approveQuote` / `rejectQuote` call `sendQuoteApprovedEmail` / `sendQuoteRejectedEmail` via Resend (`src/lib/services/email.ts`) using `guest_email`. |
| **Phase 1 Changes** | `POST /api/quotes` added using `createAdminClient()` so guests bypass Clerk and RLS. `QuoteForm` switched from `createQuote()` server action to `fetch('/api/quotes')`. |

---

### B. B2C Quotation System (`account_type = 'individual'`)

| Dimension | Evidence & Behaviour |
|---|---|
| **Authentication & Profile** | Required Clerk auth (`auth()`, `currentUser()`). `NewQuotePage` (`src/app/(main)/quotes/new/page.tsx`) pre-populated `name`, `email`, `phone` from Clerk `unsafeMetadata` (`full_name`, `phone_number`) and `emailAddresses[0]`. |
| **Permissions & Limits** | `getQuotePermissions('individual')`: `canViewList: true`, `canViewPricing: false`, `canCheckout: false`, `maxAttachments: 1`, `maxItems: 10`, `notesMaxLength: 500`. |
| **Workflow & Pricing** | Submitted via `createQuote()` (`src/lib/actions/quotes.ts`) with `individualQuoteSchema` (`items.min(1)`, `phone` optional). Priority set to `'normal'`; quote number `CED-QT-IN-{YYMMDD}-{SEQ}`. |
| **Quote History & Detail** | `/quotes` (`src/app/(main)/profile/quotes/page.tsx` -> `/quotes`) and `/quotes/[id]` (`src/app/(main)/quotes/[id]/page.tsx`) gated behind `if (!userId) redirect('/sign-in?...')`. Used `getQuotes()` / `getQuoteById()` filtering `.eq('user_id', userId)`. |
| **Conversion / Checkout** | `convertQuoteToOrder()` in `src/lib/actions/quotes.ts` added approved quote items to Clerk user's cart (`getOrCreateCart`, `addItemToCart`) and set `status = 'converted'`. |
| **Phase 1 Status** | Customer auth routes (`/sign-in`, `/sign-up`, `/cart`, `/checkout`, `/profile`) are redirected to `/products` or `/` in `src/proxy.ts` and route pages. `QuoteForm` ignores `createQuote()` and submits as guest via `POST /api/quotes`. |
| **Retention Assessment** | **Genuinely B2C-specific:** Saved quote history under user account, cart conversion. **Shareable with Guest:** Single/multi-product selection, contact form, email/PDF quote delivery. |

---

### C. B2B Quotation System (`account_type = 'business'` / `'verified'`)

| Dimension | Evidence & Behaviour |
|---|---|
| **Verification & Profiles** | Checked Clerk `unsafeMetadata.accountType === 'business'`, `is_verified`, `verificationStatus`, and `businesses.verification_status` in Supabase (`src/app/(main)/quotes/[id]/page.tsx`, `src/lib/actions/quotes.ts` querying `users.verification_status`). |
| **Permissions & Limits** | Unverified Business: `maxItems: 50`, `maxAttachments: 2`, `notesMaxLength: 1000`, `canViewPricing: true`, `hasBulkPricing: true`. Verified Business (`userType === 'verified'`): `maxItems: 50`, `maxAttachments: 5`, `canCheckout: true`, `canSaveDraft: true`, `canExportCSV: true`, `canUseTemplates: true`. |
| **Quote Number & Priority** | `CED-QT-BZ-{YYMMDD}-{SEQ}` (unverified) or `CED-QT-BV-{YYMMDD}-{SEQ}` (verified). Priority `'high'` (unverified) or `'urgent'` (verified). |
| **Company / GST / Addresses** | **Critical Finding:** In `quotes` table (`information_schema.columns`), there are **no** `company_name`, `gstin`, `company_details`, or address columns! `POST /api/quotes` encodes `company_name` as `[Company: ...]` inside `notes`. `admin-quotes/quote-conversion.ts` references `quote.company_details` and `quote.user_type` / `quote.clerk_user_id` — columns that **do not exist** on `quotes`! |
| **Admin Negotiation & Expiry** | `src/lib/actions/admin-quotes/` supports item-level unit pricing, discount %, subtotal/discount/tax/estimated_total, `admin_response_message`, `admin_internal_notes`, `valid_until`, `approveQuote()`, `rejectQuote()`, `expireOverdueQuotes()` (`/api/cron/quotes/expiry`), and `quote_audit_log`. |
| **PDF & Order Conversion** | **Quote PDF:** **Not implemented** (`src/lib/utils/export.ts` throws `'PDF export not yet implemented'`; `jspdf` is only used for `/api/orders/[id]/invoice` and `src/lib/reports/generator.ts`). **Order conversion:** `convertQuoteToOrder()` in `admin-quotes/quote-conversion.ts` (deferred in Phase 1). |
| **Phase 1 Retention Assessment** | **Keep for Phase 1 B2B:** Optional company name/GST/project details, multi-product bulk requests, item-level admin pricing, tax/discount calculation, validity date, customer-visible response & email, audit trail. **Defer to Phase 2:** Business verification gating, login-gated history, cart/checkout/order conversion. |

---

## 3. Critical Architectural & Security Findings

1. **Critical — Unauthenticated `POST /api/quotes` vs Dual `createQuote()` Path:** `QuoteForm` uses `POST /api/quotes` (`createAdminClient()`), leaving `createQuote()` (`src/lib/actions/quotes.ts`) orphaned on the main quote form.
2. **Critical — Weak Public RLS on `quotes` & `quote_items`:** `pg_policies` shows `Users can read own quotes` (`qual: (user_id = sub) OR (user_id IS NULL)`) and `Users can read own quote items` (`... OR (quotes.user_id IS NULL)`) on `{public}` role! Any anonymous/public PostgREST query with the public `anon` key can **read all guest quotes (`user_id IS NULL`) including `guest_email`, `guest_phone`, `guest_name`, and `notes`**! *(Documented only; not modified per audit rules.)*
3. **High — Broken Quote List → Quote Form Prefill:** `WishlistActions` (`src/modules/wishlist/components/wishlist-actions.tsx`) navigates to `/quotes/new?productIds=...`, but `NewQuotePage` (`src/app/(main)/quotes/new/page.tsx`) only reads `productId` + `productName` (singular), ignoring `productIds` and `product`.
4. **High — `QuoteSuccessPage` Hardcoded `itemsCount={2}`:** `src/app/(main)/quotes/success/page.tsx` line 72 passes `itemsCount={2}` instead of `itemsCount` parsed from `searchParams`!
5. **High — Schema Drift in Legacy Admin Code:** `admin-quotes/quote-conversion.ts` references `quote.user_type`, `quote.clerk_user_id`, `quote.company_details`, and `quote.ts` types differ from actual `quotes` table columns (`account_type`, `user_id`, no `company_details`).
6. **Medium — In-Memory Rate Limiting:** `ipRequestHistory` `Map` in `src/app/api/quotes/route.ts` resets on every serverless cold start / instance.
7. **Medium — Two Competing Quote Number Generators:** `generateQuoteNumber()` (`increment_quote_counter` RPC -> `CED-QT-...`) vs DB trigger function `generate_quote_number()` (`Q-000001`).
