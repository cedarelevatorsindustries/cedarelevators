# Cedar Elevators — Phase 1 Quotation Implementation Audit

**Audit Date:** 2026-11-25

---

## 1. Customer-Facing Phase 1 Implementation

| Surface | Path | Current Behaviour | Status / Issues |
|---|---|---|---|
| **Product Card CTA** | `src/components/ui/product-card.tsx` | `Quote` button navigates to `/quotes/new?productId=...&productName=...` | **Works** for single product |
| **PDP Primary CTA** | `src/modules/products/components/product/price-action-card.tsx`, `desktop-pdp-page.tsx`, `mobile-pdp-page.tsx` | `Request a Quote` passes `productId`, `productName`, `quantity`, `variantId` to `/quotes/new` | **Works** for single product + variant + qty |
| **Frequently Bought Together** | `src/modules/products/sections/12-frequently-bought-together-section.tsx` | `Add Bundle` saves selected items to the **Quote List** (`useWishlist().addItem`) | **Works** |
| **Quote List (Renamed Wishlist)** | `src/app/(main)/wishlist/page.tsx`, `wishlist-product-card.tsx`, `wishlist-actions.tsx` | Displays `Your Quote List`, `Quote List Summary`, and `Proceed to Quote Request ->` navigating to `/quotes/new?productIds=...` | **UI Works; Prefill Broken** (`productIds` ignored by `/quotes/new`) |
| **Navbar & Badge** | `navbar-actions.tsx`, `top-bar-header.tsx` | `Quote List` link with live count badge (`useWishlist()`) + `Request a Quote` CTA | **Works** |
| **Quote Request Page** | `src/app/(main)/quotes/new/page.tsx` + `src/modules/quote/components/quote-form.tsx` | Renders `QuoteForm` with `QuoteItemsInput`, contact fields, optional `company_name`, `notes`, honeypot | **Works** for 0 or 1 prefilled item, or manual multi-item selection; **ignores** `productIds` and `product` query params |
| **Quote Success Page** | `src/app/(main)/quotes/success/page.tsx` + `quote-confirmation-page.tsx` | Shows `quoteNumber` and confirmation details | **Bug:** Line 72 hardcodes `itemsCount={2}` instead of using parsed `itemsCount` |
| **Legacy Quote Routes** | `/quotes` (`page.tsx`), `/quotes/[id]` (`page.tsx`), `/profile/quotes` (`page.tsx`) | `/quotes` redirects to `/quotes/new`; `/quotes/[id]` redirects unauthenticated users to `/sign-in` (which redirects to `/`) | Legacy routes still present |

---

## 2. Backend Phase 1 Implementation (`POST /api/quotes`)

Inspected `src/app/api/quotes/route.ts`:

| Capability | Supported? | Implementation Details |
|---|---|---|
| **1 product** | **Yes** | `items` array with 1 `product_id`, optional `variant_id`, `quantity >= 1` |
| **Multiple products** | **Yes** | `items` array maps all valid `product_id`s and batch-inserts into `quote_items` |
| **General enquiry (0 products)** | **Yes** | `items: z.array(quoteItemSchema).default([])`; skips `quote_items` insert when empty |
| **Product variants** | **Partial** | Stores `variant_id` on `quote_items`, but does **not** snapshot `variant_title` or variant SKU/options |
| **Quantities** | **Yes** | Coerced integer `>= 1` per item |
| **Guest contact info** | **Yes** | Mandatory `name` (2–100), `email`, `phone` (10–20) |
| **Optional company details** | **Partial** | `company_name` accepted by Zod, concatenated into `notes` as `[Company: ...]` |
| **Rate limiting & anti-spam** | **Partial** | In-memory IP `Map` (5 req / 10 min; non-persistent across serverless instances) + `hp_website` honeypot |
| **Quote numbering** | **Yes** | `generateQuoteNumber('guest')` -> `CED-QT-GS-{YYMMDD}-{SEQ}` |
| **Transactions / Atomicity** | **No** | Inserts `quotes` first, then `quote_items`; if `quote_items` insert fails, logs error and still returns `201` with empty quote |
| **Emails on submission** | **No** | No customer confirmation email or admin notification email is sent on `POST /api/quotes` |

---

## 3. Admin Quotation Module (`/admin/quotes`)

Inspected `src/app/admin/(dashboard)/quotes/page.tsx`, `[id]/page.tsx`, and `src/lib/actions/admin-quotes/*`:
- **Retained & Working:** Quote listing with status/user-type/search filters (`getAdminQuotes`), quote detail (`getAdminQuoteById`), item-level unit pricing & discount % (`updateQuoteItemPricing`), quote totals (`updateQuotePricing`), internal & customer-visible notes, approve/reject with Resend emails (`approveQuote`, `rejectQuote`), audit logging (`quote_audit_log`), and expiry cron (`/api/cron/quotes/expiry`).
- **Issues / Legacy Remnants:**
  - `updateQuoteStatus` has a commented-out `canApproveQuotes()` permission check (`TEMPORARY FIX: Bypass permission check`).
  - `convertQuoteToOrder()` in `admin-quotes/quote-conversion.ts` references non-existent `quotes` columns (`user_type`, `clerk_user_id`, `company_details`) and belongs to Phase 2.
  - Quote PDF download is **not implemented**.
