# Cedar Elevators — Admin Quotation Workspace Refinement

## 1. Account-Type Removal & Business Model Unification

- Removed obsolete `User Type` / `Account Type` / `B2B` / `B2C` / `Individual` / `Business (Legacy)` / `Guest` classifications from admin quotation UI helpers, headers, and queries (`src/domains/admin/components/quote-helpers.ts`, `src/domains/admin/components/index.ts`, `src/domains/admin/components/quote-header.tsx`, `src/lib/actions/admin-quotes/quote-queries.ts`, and `src/app/admin/(dashboard)/quotes/[id]/page.tsx`).
- Retained customer company and tax context (`company_name`, `gst_number`, `project_name`, `project_location`) independently of account type, and standardized request classification derived from actual quotation contents:
  - `General Enquiry`
  - `Single Product`
  - `Multiple Products`
- Preserved existing database columns and historical quotation records (`account_type` remains untouched in PostgreSQL for historical compatibility).

---

## 2. Admin Shell Updates

- **`src/components/common/header.tsx`:** Updated global search button placeholder from `"Search orders, products..."` to `"Search quotations, customers, products..."`.
- **`src/components/common/global-search.tsx`:** Added `Quotation Requests` (`/admin/quotes`) to quick command navigation (`Cmd/Ctrl + J`) and updated the search input placeholder.
- **`src/components/common/sidebar.tsx`:** Added a live submission indicator badge on the `Quotes` nav item backed by `getAdminNewQuotesCount()` (`submitted` / `pending` count).

---

## 3. Admin Quotation List (`/admin/quotes`)

Refined `src/app/admin/(dashboard)/quotes/page.tsx` and `getAdminQuotes` in `src/lib/actions/admin-quotes/quote-queries.ts`:

- **Header:** Updated to `Quotation Requests` (`Review, prepare and manage customer quotation requests.`) with `Refresh`.
- **Summary Metric Cards:** Real database counts (`Total Quotations`, `New Submissions`, `Under Review`, `Quoted`, `Rejected / Expired`) scoped accurately to active search, date range, and request-type filters across pagination pages.
- **Search & Filters:** Debounced search supporting quotation number, customer name, company name, email, and phone numbers (`guest_phone`, `requester_phone`); status filter; request-type filter (`General Enquiry`, `Single Product`, `Multiple Products`); submission date range; sorting (`Newest First`, `Oldest First`, `Highest Total`).
- **Responsive Table & Mobile Cards:** Columns (`Quote Number` with copy button, `Customer`, `Contact`, `Request`, `Items` + value, `Status`, `Submitted` exact date + relative timestamp, `Action`), plus structured cards for tablet/mobile and clean loading/empty/error states.

---

## 4. Admin Quotation Detail Workspace (`/admin/quotes/[id]`)

Refined `src/app/admin/(dashboard)/quotes/[id]/page.tsx` and domain components under `src/domains/admin/components/`:

- **`QuoteHeader`:** Displays `#quote_number` + copy button, status badge, request type badge, active revision badge, customer name, submission date, last updated date, issuance/validity dates, state-driven document actions (`Preview Draft`, `Issued PDF (Rev N)`), primary workflow actions (`Start Review`, `Issue & Send Quotation` / `Reissue Revision N`), and a compact workflow progress indicator (`Received` → `Under Review` → `Pricing Prepared` → `Quoted`, plus `Rejected` / `Expired` outcome banners).
- **`BusinessInformation`:** Two-column Customer & Project Details showing `Customer Name`, `Email Address`, `Phone Number`, `Company / Organization`, `GST Number`, `Submission Date`, `Project Name`, `Project Location`, and `Customer Message / Requirements` with `"Not provided"` for missing optional values.
- **`QuoteItemsPricing`:** Desktop table and mobile card inputs with thumbnail, SKU, variant, historical specifications, editable unit prices/discounts/quantities, submitted quantity change indicator (`Submitted: N` derived from `quote_audit_log` `qty_changes`), configuration-driven tax warnings/settings (from `tax_settings` + `store_settings` rather than hardcoded rates), item/overall discount & GST financial summary, and audit logging of any administrative quantity adjustments in `saveQuoteCommercialPricing`.
- **`DecisionPanel`:** Visually separated `Customer Response` card (`"This message may be shared with the customer in emails and quotation PDFs."`) and private `Internal Notes` card (`"Visible only to authorized Cedar administrators. Never sent to customers or PDFs."`) with author/timestamp history loaded from `quote_admin_responses` and immediate timestamped note creation via `addAdminNote`.
- **`QuoteSidebar`:** Displays immutable issued revision PDFs, email notification delivery status (`Sent` / `Pending` / `Failed`, attempt timestamps, error details, `Retry Email Delivery`), and categorized activity timeline (`quote_audit_log`).
- **Draft vs Issued PDF & Issuance Modal:** `generateQuotationPdfBuffer` (`src/lib/services/quote-pdf.ts`) and `GET /api/admin/quotes/[id]/pdf` label draft previews with `"DRAFT PREVIEW"` and record `'pdf_generated'` audit entries; `issueQuotation` validates customer email, verified company settings, and Store GSTIN/rate when GST is enabled, generates and verifies the private PDF before setting `'quoted'`, and requires explicit admin confirmation inside a detailed issuance modal.

---

## 5. Verification Results Observed

- **`npx next typegen` & `npx tsc --noEmit`:** Exited `0` with `0` TypeScript errors after clearing truncated `.next/dev` type artifacts.
- **`npx eslint` on all touched/created admin shell, component, action, PDF, and route files:** Exited `0` with `0` errors (`62` warnings).
- **`pnpm build` (`next build --webpack`):** Compiled cleanly (`✓ Compiled successfully in 31.2s`) and exited `0` across all routes.
- **Production runtime & auth verification (`npx next start -p 3099`):**
  - `GET /admin/quotes` → `200`
  - `GET /admin/quotes/11111111-1111-1111-1111-111111111111` → `200`
  - `GET /quotes/new`, `/quotes/success`, `/quotes/track` → `200`
  - `GET /api/admin/quotes/11111111-1111-1111-1111-111111111111/pdf?preview=1` (unauthenticated) → `401 Unauthorized`
  - `GET /api/quotes/track/history` (unauthenticated) → `401 Unauthorized`
