# Cedar Elevators — Quote Legacy Dependency Map

**Audit Date:** 2026-11-25

---

## 1. Routes Inventory

### Customer-Facing Routes
| Route | File | Current Role / Behaviour | Classification |
|---|---|---|---|
| `/quotes` | `src/app/(main)/quotes/page.tsx` | Redirects to `/quotes/new` | **SIMPLIFY / KEEP REDIRECT** |
| `/quotes/new` | `src/app/(main)/quotes/new/page.tsx` | Primary Phase 1 quote submission page | **KEEP** |
| `/quotes/success` | `src/app/(main)/quotes/success/page.tsx` | Submission confirmation page (has hardcoded `itemsCount={2}` bug) | **KEEP & FIX** |
| `/quotes/[id]` | `src/app/(main)/quotes/[id]/page.tsx` | Legacy auth-gated quote detail (`redirect('/sign-in')`) | **DEFER (Phase 2)** |
| `/profile/quotes` | `src/app/(main)/profile/quotes/page.tsx` | Redirects to `/quotes`; `/profile` blocked by `proxy.ts` | **REMOVE / DEFER** |
| `/wishlist` | `src/app/(main)/wishlist/page.tsx` | **Quote List** shortlist page | **KEEP** |

### Admin & API Routes
| Route | File | Current Role | Classification |
|---|---|---|---|
| `/admin/quotes` | `src/app/admin/(dashboard)/quotes/page.tsx` | Admin quotation list | **KEEP** |
| `/admin/quotes/[id]` | `src/app/admin/(dashboard)/quotes/[id]/page.tsx` | Admin quotation review, pricing, approve/reject | **KEEP (Defer Convert)** |
| `POST /api/quotes` | `src/app/api/quotes/route.ts` | Active guest quote submission API | **KEEP & ENHANCE** |
| `GET /api/cron/quotes/expiry` | `src/app/api/cron/quotes/expiry/route.ts` | Daily expiry cron calling `expireOverdueQuotes()` | **SIMPLIFY / ALIGN DB** |

---

## 2. Services, Server Actions, Hooks & Utilities

| Module | File | Dependencies | Classification |
|---|---|---|---|
| Legacy Quote Actions | `src/lib/actions/quotes.ts` | Clerk `auth()`, `createClerkSupabaseClient()`, `users`, `variants`, `cart.ts` | **DEFER / RETIRE** |
| Legacy Quote Basket | `src/lib/actions/quote-basket.ts`, `src/lib/hooks/use-quote-basket.ts` | Clerk `auth()`, `quote_baskets` table (0 rows) | **REMOVE / DEFER** |
| Quote Products Search | `src/lib/actions/quote-products.ts` | Supabase `products` | **KEEP** |
| Admin Quote Actions | `src/lib/actions/admin-quotes/*.ts` | `createAdminClient()`, `email.ts`, `admin-roles.ts` | **KEEP** (`quote-conversion.ts` **DEFER**) |
| Quote Number Generator | `src/lib/utils/quote-number-generator.ts` | `increment_quote_counter` RPC, `quote_counters` | **KEEP** (Retire DB trigger `generate_quote_number()`) |
| Quote Permissions | `src/modules/quote/utils/quote-permissions.ts`, `src/lib/quote-permissions.ts` | Tier-based caps (`guest maxItems: 1`) | **REMOVE / SIMPLIFY** |
| Quote State Machine | `src/lib/quote-state-machine.ts` | Status enum (`pending`/`converted`/`expired` mismatch with DB) | **SIMPLIFY / ALIGN** |
| Quote Schemas | `src/modules/quote/forms/quote-schema.ts` | 4 Zod schemas (`guest`, `individual`, `business*`) | **MERGE** into 1 unified schema |
| Wishlist / Quote List Hook | `src/lib/hooks/use-wishlist.ts` | `/api/wishlist*`, `wishlists`, `wishlist_items` | **KEEP** |
| Email Service | `src/lib/services/email.ts` | Resend (`sendQuoteApprovedEmail`, `sendQuoteRejectedEmail`, `sendQuoteExpiredEmail`) | **KEEP & ADD SUBMIT EMAIL** |
| PDF Generation | `src/lib/utils/export.ts` (stub), `src/app/api/orders/[id]/invoice/route.ts` | `jspdf`, `jspdf-autotable` (orders only; quotes not implemented) | **DEFER / BUILD LATER** |

---

## 3. UI Components (`src/modules/quote/` & `src/domains/admin/`)

- **Active Phase 1 Components (KEEP):** `quote-form.tsx`, `quote-items-input.tsx`, `variant-selectors.tsx`, `quote-confirmation-page.tsx`, `price-action-card.tsx`, `12-frequently-bought-together-section.tsx`, `wishlist-product-card.tsx`, `wishlist-actions.tsx`, `admin/components/quote-header.tsx`, `quote-items-pricing.tsx`, `quote-sidebar.tsx`, `business-information.tsx`, `customer-notes-attachments.tsx`, `decision-panel.tsx`.
- **Legacy Auth / Business Hub / Cart Components (DEFER or REMOVE):** `quote-list.tsx`, `quote-detail.tsx`, `quote-to-order.tsx`, `quote-templates.tsx`, `quick-reorder.tsx`, `quotes-sidebar.tsx`, `user-tier-badge.tsx`, `verification-alert.tsx`, `verification-banner.tsx`, `upgrade-nudge.tsx`, `pricing-visibility.tsx`, `cart-to-quote.ts`, `quote-from-cart-button.tsx`, `business-hub/*` quote widgets, `customer-quotes-tab.tsx`.
