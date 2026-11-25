# CEDAR ELEVATORS - PHASE 1 REGRESSION CHECKLIST
**Document Version:** 1.0  
**Status:** Verification Protocol (Pre-Implementation & Post-Implementation)  
**Target Architecture:** Phase 1 Catalogue & Quotation Platform  

---

## 1. Customer-Facing Catalogue & Quotation Journey

| # | Test Case / Workflow | Test Steps | Expected Result | Pass / Fail |
|:---|:---|:---|:---|:---:|
| **C-01** | **Homepage Initial Load** | Open `http://localhost:3000/` in clean browser. | Hero section displays clearly; desktop hero image loads; value props and CTAs ("Explore Catalogue", "Request Quote") visible. | [ ] |
| **C-02** | **Catalogue Navigation** | Click "Explore Catalogue" or navigate to `/catalog`. | Product grid renders; categories filterable; product cards show title, category, specs summary, and "Request Quote" / "View Details". | [ ] |
| **C-03** | **Category & Taxonomy Filter** | Click a category (e.g. Motors) or application (Passenger). | URL updates to `/catalog/categories/[handle]`; grid filters to only matching elevator components; facet counts update accurately. | [ ] |
| **C-04** | **Instant Search & Autocomplete**| Type part name (e.g. "Geared", "Door", "Controller") into navbar search. | Dropdown displays top matched products with thumbnail and SKU; pressing Enter navigates to `/search?q=...`. | [ ] |
| **C-05** | **Product Detail Page (PDP)** | Click on any product card from catalogue or search. | PDP loads at `/products/[handle]`; high-res gallery renders; mechanical and electrical specs table renders; no "Add to Cart" or "Buy Now" buttons appear. | [ ] |
| **C-06** | **Single Product Quote CTA** | On PDP, click "Request a Quote" / "Add to Quote". | User is routed to `/quotes/new` with the selected product pre-populated in the quotation items list. | [ ] |
| **C-07** | **Multi-Item Quote Assembly** | Add 2+ different products from different categories into the quote form. | Quote form displays all selected items with name, SKU, thumbnail, and editable quantity inputs (min: 1). | [ ] |
| **C-08** | **Guest Quotation Validation** | Submit quote form with empty required fields (Name, Phone, Email). | Form prevents submission with inline validation errors highlighting missing fields. | [ ] |
| **C-09** | **Guest Quotation Submission** | Fill valid Name, Phone, Email, optional Company, Project Notes, and submit. | Request dispatches to `POST /api/quotes`; record inserted into `quotes` & `quote_items`; user redirected to `/quotes/success`. | [ ] |
| **C-10** | **Quotation Confirmation View** | Inspect `/quotes/success` confirmation page. | Unique quote reference ID displayed (e.g. `CE-Q-...`); customer email confirmation notice shown; WhatsApp & Phone direct CTAs visible. | [ ] |
| **C-11** | **Direct Contact & WhatsApp** | Navigate to `/contact`; click WhatsApp quick button. | Contact details (address, phone, email) visible; WhatsApp link opens `https://wa.me/...` with pre-filled enquiry greeting. | [ ] |
| **C-12** | **Brand Trust CMS Pages** | Navigate to `/why-choose`, `/warranty`, `/policies/terms`. | CMS pages render formatted policy and warranty content from Supabase CMS tables. | [ ] |
| **C-13** | **Responsive Mobile Nav** | Emulate mobile device (375px width). | Mobile top-bar shows brand logo and search; mobile bottom bar shows `Home`, `Catalog`, `Get Quote`, `Contact`; drawer menu opens smoothly. | [ ] |

---

## 2. Administrator Operations Journey

| # | Test Case / Workflow | Test Steps | Expected Result | Pass / Fail |
|:---|:---|:---|:---|:---:|
| **A-01** | **Admin Entry Point (`/admin`)** | Open `http://localhost:3000/admin` while unauthenticated. | Next.js directly renders the Cedar Elevators Admin Login screen (`<AdminLoginView>`); no Clerk redirect occurs. | [ ] |
| **A-02** | **Admin Authentication** | Enter valid administrator email and password; submit. | Supabase Auth validates session; `admin_profiles` verified; user is transitioned into the Admin Dashboard. | [ ] |
| **A-03** | **Unauthorized User Rejection** | Attempt login with ordinary customer or inactive account. | Access is denied with clear administrative notice; no dashboard data is leaked. | [ ] |
| **A-04** | **Admin Dashboard Overview** | Review `/admin` dashboard after logging in. | Quick stats display active products, categories, total quotes, and pending quotes; recent quotation feed displays newest submissions. | [ ] |
| **A-05** | **Sidebar Simplification** | Inspect desktop and mobile admin sidebar navigation. | Only relevant items are visible: `Dashboard`, `Quotes`, `Products`, `Categories`, `Applications`, `Elevator Types`, `Collections`, `Banners`, `Settings`. `Orders`, `Customers`, and `Inventory` are absent. | [ ] |
| **A-06** | **Product Management (CRUD)** | Navigate to `/admin/products`; click "Add Product". | Product creation form loads; allows title, slug, specs, dimensions, base price, and Cloudinary image upload; saved product immediately appears in catalogue. | [ ] |
| **A-07** | **Category Management** | Navigate to `/admin/categories`; create or edit category. | Category updates reflect across taxonomy filters and MegaMenu. | [ ] |
| **A-08** | **Quotation Review** | Navigate to `/admin/quotes`; open the quote submitted in test `C-09`. | Quote detail view displays customer contact info, company name, line items, quantities, and customer notes. | [ ] |
| **A-09** | **Quote Pricing & Proposal** | In quote detail, enter proposed unit prices and response message; change status to `approved`. | Status updates in `quotes` table; audit log entry recorded in `quote_audit_log`; response saved to `quote_admin_responses`. | [ ] |
| **A-10** | **Admin Settings Pruning** | Navigate to `/admin/settings`. | Settings sidebar displays `General`, `Admin Users`, and `CMS Content` (`Why Choose`, `Warranty`, `Policies`). `Shipping`, `Payments`, and `Taxes` are hidden. | [ ] |
| **A-11** | **Admin Secure Sign Out** | Click "Sign Out" from admin sidebar. | Session cookies cleared via `performAdminLogout()`; user immediately returned to unauthenticated login view. | [ ] |

---

## 3. Deferred E-Commerce Route Protection (Negative Tests)

| # | Test Route | Action | Expected Behavior | Pass / Fail |
|:---|:---|:---|:---|:---:|
| **N-01** | `/cart` | Direct navigation in browser. | 307 redirect directly to `/products`. | [ ] |
| **N-02** | `/checkout` | Direct navigation in browser. | 307 redirect directly to `/products`. | [ ] |
| **N-03** | `/profile` | Direct navigation in browser. | 307 redirect directly to `/products`. | [ ] |
| **N-04** | `/wishlist` | Direct navigation in browser. | 307 redirect directly to `/products`. | [ ] |
| **N-05** | `/track` | Direct navigation in browser. | 307 redirect directly to `/products`. | [ ] |
| **N-06** | `/order-confirmation` | Direct navigation in browser. | 307 redirect directly to `/products`. | [ ] |
| **N-07** | `/admin/orders` | Direct navigation (if URL typed manually). | Displays empty state or redirects safely without 500 error. | [ ] |
| **N-08** | `/admin/customers`| Direct navigation (if URL typed manually). | Displays empty state or redirects safely without 500 error. | [ ] |
| **N-09** | `/admin/inventory`| Direct navigation (if URL typed manually). | Displays empty state or redirects safely without 500 error. | [ ] |

---

## 4. Technical Quality & Build Verifications

| Check | Tool / Command | Acceptance Criteria |
|---|---|---|
| **TypeScript Validation** | `pnpm exec tsc --noEmit` | **0 errors (Exit code 0)** |
| **ESLint Validation** | `pnpm run lint` | **0 breaking errors** |
| **Edge Proxy Simulation** | `node --env-file=.env scratch/test-proxy-simulation.mjs` | **100% tests passing** |
| **Production Build** | `pnpm run build` | **All routes compiled successfully** |
| **Database Integrity** | Supabase MCP / SQL inspection | **All 73 tables and RLS policies preserved** |
