# Cedar Elevators — Quotation System Comparison

**Audit Date:** 2026-11-25

---

## 1. Single-Product vs Bulk Quotation Matrix (Original Tiers)

| Capability | Guest Single | Guest Bulk | B2C Single | B2C Bulk | B2B Single | B2B Bulk |
|---|---|---|---|---|---|---|
| **Product selection** | Prefilled via `/quotes/new?productId=...&productName=...` or dropdown in `QuoteItemsInput` | `quote-permissions.ts` blocked (`maxItems: 1`); `QuoteList` (`/wishlist`) existed separately | Dropdown/search in `QuoteItemsInput` or PDP `Quote` CTA | Up to `10` items via `QuoteItemsInput` or `quote_baskets` / `wishlist` | Dropdown/search in `QuoteItemsInput` or PDP `Quote` CTA | Up to `50` items via `QuoteItemsInput`, `quote_baskets`, CSV/templates (flagged in permissions) |
| **Quantity** | `quantity >= 1` integer (`quoteItemSchema`) | N/A in original permissions (`maxItems: 1`) | `quantity >= 1` integer | Per-item `quantity >= 1` | `quantity >= 1` integer | Per-item `quantity >= 1` + `bulk_pricing_requested` flag |
| **Variants** | Optional `variantId` from URL / `VariantSelectors` | N/A | Optional `variant_id` | Per-item `variant_id` | Optional `variant_id` | Per-item `variant_id` |
| **Customer details** | `name`, `email`, `phone` required (`guestQuoteSchema`) | Same as Guest Single | Pre-filled `name`, `email`, optional `phone` (`individualQuoteSchema`) | Same as B2C Single | Pre-filled `name`, `email`, optional `phone` (`business*QuoteSchema`) | Same as B2B Single |
| **Company details** | Optional `company_name` (in Phase 1 `guestQuoteSchema`, stored in `notes`) | Same | Not in `individualQuoteSchema` | Not in `individualQuoteSchema` | Expected via business profile (`businesses`), not stored in `quotes` columns | Same |
| **Project details** | `notes` (original limit 300 chars; Phase 1 limit 2000 chars) | Same | `notes` (max 500 chars) + 1 attachment | Same | `notes` (max 1000 chars) + 2–5 attachments | Same |
| **Pricing behaviour** | `canViewPricing: false` (`Price on request` / public base price) | N/A | `canViewPricing: false` | `canViewPricing: false` | `canViewPricing: true` (admin response pricing) | `canViewPricing: true` + `hasBulkPricing: true` |
| **Submission API** | Originally `createQuote('guest')`; Phase 1 `POST /api/quotes` | Phase 1 `POST /api/quotes` (`items[]`) | `createQuote()` server action (`account_type: 'individual'`) | `createQuote()` server action | `createQuote()` server action (`account_type: 'business'`) | `createQuote()` server action |
| **Database records** | `quotes` (`user_id: null`, `account_type: 'guest'`) + `quote_items` | Same (`1` quote, `N` `quote_items`) | `quotes` (`user_id`, `account_type: 'individual'`) + `quote_items` + `quote_attachments` | Same | `quotes` (`user_id`, `account_type: 'business'`) + `quote_items` + `quote_attachments` | Same |
| **Admin handling** | Listed in `/admin/quotes`; priced/approved/rejected | Same | Listed in `/admin/quotes` | Same | Listed in `/admin/quotes`; verified priority `'urgent'` | Same |
| **Email notifications** | Approved/Rejected via Resend (`guest_email`); none on submit | Same | Approved/Rejected via Resend (`guest_email`); none on submit | Same | Approved/Rejected via Resend (`guest_email`); none on submit | Same |

---

## 2. Original Architecture vs Phase 1 Comparison & Classification

| Area | Original Guest | Original B2C | Original B2B | Current Phase 1 | Classification & Rationale |
|---|---|---|---|---|---|
| **Login requirement** | None | Required (Clerk) | Required (Clerk + Business Verification) | None (`POST /api/quotes` is public) | **KEEP (Guest-first)** — Core Phase 1 mandate; keep `user_id` nullable for future Phase 2 auth. |
| **Single quote** | Supported (`maxItems: 1`) | Supported | Supported | Supported via `/quotes/new?productId=...` | **KEEP** — Primary product-level conversion flow. |
| **Bulk quote** | Blocked (`maxItems: 1`) | Up to 10 items | Up to 50 items | Supported in `POST /api/quotes` (`items[]`), **broken** in `/quotes/new?productIds=...` prefill | **MERGE & FIX** — Use one shared multi-item engine for single, bulk, and general enquiries. |
| **Customer details** | `guest_name/email/phone` | Clerk profile + `guest_*` | Clerk + Business profile | `name`, `email`, `phone` -> `guest_*` and `requester_*` | **SIMPLIFY** — Single contact model (`requester_*`), no profile dependency. |
| **Company details** | None | None | Separate business verification | Optional `company_name` stuffed into `notes` | **KEEP (Structured)** — Add dedicated optional company/GST/project columns instead of prefixing `notes`. |
| **Product variants** | `variant_id` nullable | `variant_id` nullable | `variant_id` nullable | `variant_id` nullable (no `variant_name` snapshot) | **KEEP & ENHANCE** — Snapshot `variant_title` and specs on `quote_items`. |
| **Pricing** | Hidden (`canViewPricing: false`) | Hidden | Visible after admin approval | Public base price or "Price on request"; admin enters quote prices | **SIMPLIFY** — Remove tier-based price hiding; allow admin pricing on all Phase 1 quotes. |
| **Database model** | `quotes` + `quote_items` + `quote_counters` | Same + `quote_baskets` | Same + `quote_baskets` + `businesses` | `quotes` + `quote_items` + `quote_counters` | **KEEP** — Single unified `quotes` + `quote_items` schema; **DEFER** `quote_baskets`. |
| **API** | `createQuote()` | `createQuote()` | `createQuote()` | `POST /api/quotes` (REST, `createAdminClient()`) | **MERGE** — Retire `createQuote()` / `quote-basket.ts` from Phase 1 UI; standardize on one service. |
| **Admin workflow** | View, price, approve/reject | Same | Same + convert to order | Same (`/admin/quotes`), `convert` hidden/deferred | **SIMPLIFY** — Keep review, pricing, response, approve/reject; **DEFER** order conversion. |
| **Email** | Approved/Rejected only | Same | Same | Approved/Rejected only (no submission confirmation email) | **KEEP & ENHANCE** — Add submission confirmation + admin alert emails in Phase 1. |
| **PDF** | Not implemented | Not implemented | Not implemented | Not implemented | **DEFER / ADD-ON** — Quote PDF generator does not exist yet (`export.ts` throws unimplemented). |
| **Status lifecycle** | `reviewing -> approved/rejected` | `draft/pending/reviewing -> approved/rejected/converted` | Same + `expired` | DB constraint: `draft, submitted, reviewing, approved, rejected` | **SIMPLIFY** — Align TS state machine (`quote-state-machine.ts`) with DB check constraint. |
| **Customer portal (`/quotes/[id]`, `/profile/quotes`)** | Not accessible | Login-gated list & detail | Login-gated list & detail | `/quotes` -> `/quotes/new`; `/quotes/[id]` -> `/sign-in` (dead in Phase 1) | **DEFER** — Customer account quote history belongs to Phase 2. |
