# Cedar Elevators — Unified Quotation System Brainstorm & Decision Document

**Date:** 2026-11-25  
**Status:** Proposal for Architecture Review & Business Sign-Off (No Code Implemented)

---

## 1. Proposed Unified Phase 1 Architecture

Use **one unified quotation engine** backed by a single `quotes` + `quote_items` data model and one submission service, operating **guest-first in Phase 1** while preserving nullable `user_id` and `account_type` for optional Phase 2 B2C/B2B accounts:

- **One Shortlist (`Quote List`):** Storefront `Bookmark` actions and `Frequently Bought Together` feed `/wishlist` (`Quote List`), which passes `?productIds=...` (and optional quantities/variants) into `/quotes/new`.
- **One Unified Form (`/quotes/new`):** Supports **0 products** (general project enquiry), **1 product** (PDP / card prefill), or **N products** (Quote List / manual multi-row addition), with mandatory contact fields (`name`, `email`, `phone`) and optional company/project fields (`company_name`, `gst_number`, `project_location`, `notes`).
- **One Backend Service:** `POST /api/quotes` validates via one Zod schema, snapshots product + variant + price metadata into `quote_items` atomically, generates `CED-QT-...` quote numbers, logs `'created'` in `quote_audit_log`, and sends Resend confirmation/alert emails.

---

## 2. Architectural Decisions & Trade-Offs

### Decision 1: One Quotation Table vs Separate Customer-Type Tables
- **Existing:** Single `quotes` + `quote_items` tables with `account_type` (`guest | individual | business`) and nullable `user_id`.
- **Alternatives:** (A) Keep single `quotes` table; (B) Split into `guest_quotes`, `b2c_quotes`, `b2b_quotes`.
- **Recommendation:** **(A) Keep single `quotes` + `quote_items` table.** Avoids triplicating admin queries, numbering, and reporting; supports future B2C/B2B via `account_type` + optional `user_id`.
- **Security / DB:** Fix RLS so `{public}` cannot `SELECT` rows where `user_id IS NULL`.

### Decision 2: One Shared API vs Separate Entry Points Using a Shared Service
- **Existing:** `POST /api/quotes` (active Phase 1) AND orphaned `createQuote()` server action (`src/lib/actions/quotes.ts`).
- **Alternatives:** (A) Single `POST /api/quotes` calling a shared `quote-service`; (B) Keep both REST API and Server Action.
- **Recommendation:** **(A) Single shared service** invoked by `POST /api/quotes` (retire `createQuote()`). Eliminates duplicate validation, numbering, and contact-field drift.

### Decision 3: Guest-Only Phase 1 vs Optional Authenticated Customers
- **Existing:** Phase 1 blocks customer login routes in `src/proxy.ts`; `POST /api/quotes` always sets `user_id: null, account_type: 'guest'`.
- **Recommendation:** **Guest-only UI in Phase 1**, while keeping `user_id` nullable in DB so Phase 2 can attach `user_id` when Clerk auth is re-enabled.
- **Open Business Question:** Should Phase 1 allow optional attachments (drawings/BOQs) for guests via Cloudinary, or keep attachments Phase 2?

### Decision 4: One Quote List vs Separate Single/Bulk Forms
- **Existing:** Quote List (`/wishlist`) passes `?productIds=...` which `/quotes/new` ignores; `QuoteForm` already has `QuoteItemsInput` multi-row UI.
- **Recommendation:** **One unified `/quotes/new` form** that pre-populates from `productId` (single), `productIds` (Quote List bulk), or starts empty (general enquiry).

### Decision 5: One Customer-Details Form vs Conditional Fields
- **Existing:** 4 Zod schemas (`guestQuoteSchema`, `individualQuoteSchema`, `businessUnverifiedQuoteSchema`, `businessVerifiedQuoteSchema`) in `quote-schema.ts`.
- **Recommendation:** **One schema & form** with required `name`, `email`, `phone` and optional `company_name`, `gst_number`, `project_location`, `notes`.
- **Open Business Question:** Is `company_name` or `gst_number` required for bulk quotes, or always optional in Phase 1?

### Decision 6: Snapshotting Product Information vs Live References
- **Existing:** `quote_items` snapshots `product_name`, `product_sku`, `product_thumbnail`, but **not** `variant_title` or `specifications`.
- **Recommendation:** **Snapshot `variant_title`, `variant_sku`, and key `specifications` (jsonb)** at submission time, keeping `product_id` (`ON DELETE SET NULL`) for catalogue links.

### Decision 7: Quote Pricing & Tax Calculation
- **Existing:** Storefront displays base price or `"Price on request"`; admin enters `unit_price`, `discount_percentage`, `tax_total` (18% GST default in admin UI).
- **Recommendation:** Customers submit quantities without needing final price; admin sets/revises unit prices and tax.
- **Open Business Question:** Confirm standard GST rate (18% vs item-specific HSN/GST) and whether customer-facing quotes show base prices or "Price on request" uniformly.

### Decision 8: Quote Status Lifecycle
- **Existing Conflict:** DB constraint allows `draft, submitted, reviewing, approved, rejected`, while `quote-state-machine.ts` uses `draft, pending, reviewing, approved, rejected, converted, expired`.
- **Recommendation:** Align DB constraint and TS state machine on one Phase 1 lifecycle (e.g. `submitted -> reviewing -> quoted/approved | rejected | expired`, deferring `converted`).
- **Open Business Question:** Confirm exact customer-visible vs internal status names (e.g. `Quoted` vs `Approved`).

### Decision 9: Quote PDF & Email Workflow
- **Existing:** Resend sends emails only on `approveQuote` / `rejectQuote`; **no email on submission**; **no quote PDF generator** (`export.ts` throws unimplemented).
- **Recommendation:** Add submission confirmation email (to customer) + new-enquiry alert (to Cedar sales) in Phase 1; build Quote PDF export using existing `jspdf` + `jspdf-autotable` when approved by business.

### Decision 10: Future B2B/B2C Compatibility
- **Recommendation:** Keep `user_id` (nullable), `account_type`, and `company_details` (jsonb or structured columns) on `quotes` without gating Phase 1 behind login or business verification.

### Decision 11: Legacy Code Retirement Strategy
- **Recommendation:** Safely deprecate/remove `quote-basket.ts`, `use-quote-basket.ts`, `quote-permissions.ts` (`maxItems: 1` guest cap), `individualQuoteSchema`, `business*QuoteSchema`, and `convertQuoteToOrder` cart dependencies once unified flow is approved.

### Decision 12: Migration & Historical Data Preservation
- **Existing:** 5 `quotes` (3 `business`, 2 `guest`) and 5 `quote_items`.
- **Recommendation:** Keep all existing rows intact; backfill `requester_*` from `guest_*` if null; add additive nullable columns only (no destructive drops in Phase 1).
