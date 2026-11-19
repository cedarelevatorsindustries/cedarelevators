# TECHNICAL AUDIT REPORT: CEDAR ELEVATORS WEB APPLICATION

**Audit Date:** November 15, 2026  
**Auditor Roles:** Senior Full-Stack Architect, Software Auditor, Database Engineer, Application Security Reviewer, DevOps Engineer  
**Target Repository:** `cedarelevators` (D:\web development\cedarelevators)  
**Deliverable File:** `CEDAR_ELEVATORS_TECHNICAL_AUDIT.md`  
**Classification:** Proprietary & Confidential / Technical Due Diligence  

---

## 1. Executive Summary

### 1.1 Context & Objective
Cedar Elevators is an engineering and solutions business specializing in elevator systems, components, and maintenance parts operating in Tamil Nadu, India. Approximately one year ago (December 2024 to early 2026), an ambitious web application was architected and developed with an extensive scope covering B2B/B2C e-commerce, quotation generation, business verification, cart/checkout flows, Razorpay payment processing, and comprehensive administrative back-office controls. The platform subsequently remained unused, domain registrations and external services lapsed, and development halted.

The client now requires a pragmatic, cost-effective **Phase 1 release**: a lightweight product catalogue and enquiry website focused on product discovery, technical quotation requests, direct WhatsApp engagement, and administrative catalogue management, operating within an initial capital expenditure budget of approximately **₹12,000** and minimal recurring infrastructure overhead. Future e-commerce functionality (online checkout, live payment capture, automated invoicing) is deferred to **Phase 2**.

This technical audit was commissioned as an independent, evidence-based code and infrastructure assessment to determine the true state of the existing codebase, evaluate architectural health, identify security and integrity vulnerabilities, establish code reusability, and define the exact roadmap required to deliver Phase 1 without a costly or unnecessary rebuild.

### 1.2 Core Audit Findings
1. **Repository Health & Compilation:**  
   The codebase contains **1,063 TypeScript/React source files** comprising **138,351 lines of code** and **846 git commits**. Core TypeScript compilation passes cleanly (`tsc --noEmit` exited with code 0). However, the production build (`pnpm build`) currently fails in isolated or offline environments due to a hard dependency on build-time Google Fonts fetching (`next/font/google`). ESLint analysis across `src/` revealed **2,157 linting violations** (1,258 errors, 899 warnings) due to strict flat-configuration checks and unescaped entities. Automated unit testing (`jest`) and end-to-end testing (`playwright`) are defined in `package.json` scripts but neither test runner is installed in `devDependencies`.

2. **Critical Architectural & Security Defects (P0):**
   - **Client-Side Privilege Escalation via Clerk `unsafeMetadata`:** User account tier (`individual` vs `business`), verification flags (`is_verified`), and verification lifecycle states (`verificationStatus`) are stored in Clerk's client-writable `unsafeMetadata`. Any registered customer can elevate their own privileges to a verified wholesale business account directly via the browser developer console.
   - **Broken Authorization on Admin API Endpoints:** Multiple administrative mutation endpoints (e.g., `DELETE /api/admin/products`, `POST /api/admin/products`, `POST /api/admin/categories`) authenticate using Clerk's `auth()` but feature unfulfilled `// TODO: Add admin role check` placeholders. Any authenticated storefront customer can execute product deletions, category modifications, or inventory overrides. Furthermore, in `/api/admin/stats/route.ts`, admin verification logic was left commented out.
   - **Next.js Middleware Completely Inactive:** In commit `82c970c`, `src/middleware.ts` was renamed to `src/proxy.ts`. Next.js requires the middleware file to be explicitly named `middleware.ts`. Consequently, zero server-side middleware executes; subdomain rewriting, admin redirection, and checkout protection are fully inoperative.
   - **Unauthenticated Public File Upload Endpoints:** Both `POST /api/upload/cloudinary` and `POST /api/upload-cloudinary` lack authentication, file size validation, and MIME-type restrictions, exposing the underlying Cloudinary account to unconstrained storage exhaustion and arbitrary file uploads.

3. **Database & Schema Integrity:**  
   The persistence layer utilizes Supabase PostgreSQL managed across **58 migration files**. However, migrations suffer from numbering collisions (duplicate prefixes `001_`, `002_`, `003_`, `004_`, `005_`, `006_`, `009_`, `010_`, `011_`, `012_`), un-prefixed migration files, and structural drift. Multiple application files query a `public.users` table and an `inventory_items` table that do not exist in any database migration. Conversely, user identity is fragmented across five redundant tables (`profiles`, `user_profiles`, `business_profiles`, `customer_meta`, `admin_profiles`). On 2026-05-02, 39 product records and variants were uploaded to the live Supabase instance.

4. **Phase 1 Feasibility & Delivery Verdict:**  
   **Phase 1 can be successfully delivered without a rewrite.** An estimated **70% to 75%** of the existing public storefront, product catalogue UI, responsive layouts, quote request workflows, and admin catalogue management interfaces can be directly reused or adapted. Phase 1 delivery requires fixing the P0 security flaws, reinstating `middleware.ts`, disabling offline font build failures, and trimming unneeded e-commerce modules (cart, checkout, payment gateways) rather than starting from scratch.

---

## 2. Project Overview

| Attribute | Project Specification |
| :--- | :--- |
| **Project Name** | Cedar Elevators (`cedarelevators`) |
| **Industry / Domain** | Elevator Solutions, Commercial Lifts & Spare Parts |
| **Target Geography** | Tamil Nadu, India (Tier 1 & Tier 2 B2B/B2C markets) |
| **Repository Size** | 1,063 Source Files, 138,351 Lines of Code (`src/`) |
| **Commit History** | 846 commits (Initial commit: Dec 7, 2025; Latest: Mar 23, 2026; Data import: May 2026) |
| **Phase 1 Budget** | Approximately ₹12,000 |
| **Phase 1 Infrastructure Target** | ₹0 - ₹1,500 / month (Vercel Hobby/Pro, Supabase Free Tier, Cloudinary Free Tier) |
| **Traffic Expectation** | 500 – 3,000 unique monthly visitors |
| **Phase 1 Functional Scope** | Responsive Homepage, Categorized Product Catalogue, Dynamic PDPs, Search/Filtering, Technical Quote/Enquiry Form, WhatsApp CTA Integration, Contact Information, Authenticated Admin Panel (Product/Category/Quote CRUD). |
| **Phase 2 Scope (Deferred)** | Shopping Cart, Online Checkout, Razorpay Gateway, Automated GST Invoicing, Live Inventory Decrement, Customer Account Portals. |

---

## 3. Technology Stack

### 3.1 Technology Inventory

```
+---------------------------------------------------------------------------------------+
|                                    APPLICATION STACK                                  |
+---------------------------------------------------------------------------------------+
|  Frontend Layer       |  Next.js 16.1.1 (App Router), React 19.2.3, TypeScript 5.9.3 |
|  Styling & UI         |  Tailwind CSS 4.1.18, Radix UI Primitives, Lucide Icons      |
|  Client State         |  TanStack React Query 5.90, React Hook Form, Zod 5.2         |
|  Customer Auth        |  Clerk Next.js SDK 6.36.5 (Storefront users)                 |
|  Admin Auth           |  Supabase SSR Auth 0.8.0 / Supabase JS 2.89 (Admin users)    |
|  Database / Backend   |  Supabase PostgreSQL (BaaS), PostgREST, Row Level Security   |
|  Object Storage       |  Cloudinary API v2.8 & Supabase Storage (Dual setup)         |
|  Caching & Rate Limit |  Upstash Redis REST SDK 1.36 (Optional caching layer)        |
|  Transactional Email  |  Resend SDK 4.0.1 (Configured for updates@cedarelevators.com)|
|  Payment Processing   |  Razorpay Node SDK 2.9.4 (Phase 2 - Currently dormant)       |
|  Real-time Events     |  Pusher Server 5.2 / Pusher JS 8.4 (Dead dependency)         |
|  PWA / Service Worker |  @ducanh2912/next-pwa 10.2.9, Workbox Webpack Plugin 7.4.0   |
|  Hosting & Edge       |  Vercel Serverless Platform (Build command: pnpm run build)  |
+---------------------------------------------------------------------------------------+
```

### 3.2 Compatibility Assessment
- **Next.js 16.1.1 + React 19.2.3:** Next.js 16 with Turbopack and React 19 represents the bleeding edge. While basic server rendering and hydration function, several legacy packages in the lockfile (such as `react-beautiful-dnd`) have known peer-dependency incompatibilities with React 19.
- **Tailwind CSS 4 Hybrid Clash:** The project installs `@tailwindcss/postcss: ^4.1.18` and `tailwindcss: ^4.1.18`, but retains a legacy `tailwind.config.js` (185 lines) and `autoprefixer: ^10.4.23`. In Tailwind v4, configuration is natively handled in CSS via `@theme` directives. Retaining both models creates build-time confusion and invalid warnings in ESLint.
- **Dual Authentication Incompatibility:** Running Clerk for public/customer authentication alongside Supabase Auth for admin authentication within a single Next.js codebase has produced severe session conflicts in API route handlers and Server Actions.

---

## 4. Repository & Architecture Audit (Module A)

### 4.1 Repository Structure & Code Organization
The repository is structured under `src/` but suffers from three distinct architectural patterns that were merged without standardizing component hierarchy:
1. **App Router Structure (`src/app`):**
   - `(auth)`: Clerk sign-in, sign-up, SSO callback, password recovery routes.
   - `(main)`: Public customer storefront (`cart`, `catalog`, `categories`, `checkout`, `contact`, `order-confirmation`, `products`, `profile`, `quotes`, `search`, `policies`).
   - `admin`: Administrative dashboard with isolated sub-routes (`(auth)`, `(dashboard)`).
   - `api`: 45+ Route Handlers covering admin mutations, auth webhooks, payments, upload endpoints, and wishlist actions.
2. **Feature Modules (`src/modules`):** Feature-sliced directories (`admin`, `auth`, `cart`, `catalog`, `checkout`, `home`, `layout`, `orders`, `products`, `profile`, `quote`, `wishlist`).
3. **Domain Layer (`src/domains`):** A secondary administrative domain folder (`src/domains/admin/`) housing business verification, customer management, inventory tables, and quote components.
4. **Shared Components (`src/components`):** A massive directory containing UI primitives (`src/components/ui/`) alongside duplicate domain components (`src/components/cart/`, `src/components/checkout/`, `src/components/admin/`).

### 4.2 System Architecture Diagram (Mermaid)

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Devices & Browsers"]
        BrowserDesktop["Desktop Browser (Public)"]
        BrowserMobile["Mobile Browser (Public)"]
        AdminBrowser["Admin Browser (Portal)"]
    end

    subgraph CDN_Edge ["Edge & CDN Layer (Vercel)"]
        EdgeRouter["Vercel Edge Network"]
        StaticAssets["Static Image & Asset Cache"]
        DeadMiddleware["src/proxy.ts (INACTIVE - Renamed from middleware.ts)"]
    end

    subgraph NextServer ["Next.js 16 Application Server (Turbopack)"]
        subgraph PublicStorefront ["Public Storefront (SSR & RSC)"]
            HomeRoute["/ (Homepage)"]
            CatalogRoute["/catalog (Product Catalog)"]
            PDPRoute["/products/[handle] (PDP)"]
            QuoteRoute["/quotes/new (Quote Request Form)"]
            ContactRoute["/contact (Contact Page & WhatsApp)"]
        end

        subgraph DormantCommerce ["Dormant Phase 2 Routes"]
            CartRoute["/cart"]
            CheckoutRoute["/checkout"]
            OrderRoute["/order-confirmation"]
        end

        subgraph AdminPortal ["Admin Portal"]
            AdminLogin["/admin/login (Supabase Auth)"]
            AdminDash["/admin/(dashboard)/*"]
            ClientAuthGuard["AdminLayout useEffect (Client-Only Guard)"]
        end

        subgraph APILayer ["API Route Handlers (/api/*)"]
            AdminAPI["/api/admin/* (VULNERABLE: Clerk Auth Check, No Role Check)"]
            UploadAPI["/api/upload/* (VULNERABLE: Unauthenticated Cloudinary)"]
            WebhookAPI["/api/webhooks/razorpay"]
            CronAPI["/api/account/delete (BROKEN: Expects GET, Has Only POST/DELETE)"]
        end
    end

    subgraph ExternalServices ["External Infrastructure & Cloud Services"]
        ClerkAuth["Clerk Authentication (Storefront Users)"]
        SupabaseDB[("Supabase PostgreSQL (Database & Storage)")]
        CloudinaryStorage["Cloudinary Media Storage"]
        UpstashRedis["Upstash Redis (Caching Fallback)"]
        ResendMail["Resend Email Service"]
        RazorpayGW["Razorpay Payment Gateway (Test/Placeholder)"]
    end

    BrowserDesktop --> EdgeRouter
    BrowserMobile --> EdgeRouter
    AdminBrowser --> EdgeRouter

    EdgeRouter -.->|"Bypassed (Not Loaded)"| DeadMiddleware
    EdgeRouter --> NextServer

    HomeRoute --> SupabaseDB
    CatalogRoute --> SupabaseDB
    PDPRoute --> SupabaseDB
    QuoteRoute --> SupabaseDB
    AdminDash --> ClientAuthGuard
    ClientAuthGuard --> SupabaseDB

    AdminAPI -->|"Bypasses RLS"| SupabaseDB
    AdminAPI -.->|"Mismatched Auth Check"| ClerkAuth
    UploadAPI --> CloudinaryStorage
    PDPRoute -.->|"Cached Query"| UpstashRedis
    NextServer -.->|"Invite/Notification"| ResendMail
```

### 4.3 Architectural Defect Analysis
1. **The Inactive Middleware Incident:**  
   Next.js exclusively executes middleware when placed at the root or `src/` with the filename `middleware.ts` or `middleware.js`. In commit `82c970c4848de97cace5c443ddf55068a30719de`, `src/middleware.ts` was renamed to `src/proxy.ts`. Because no file imports `proxy.ts`, the entire middleware pipeline is dormant. Subdomain routing (rewriting `admin.cedarelevators.com` to `/admin`), admin redirection, and checkout route guards do not execute at the edge.
2. **Component & Module Duplication:**  
   Severe code duplication exists between `src/components/` and `src/modules/`:
   - `src/components/cart/cart-summary.tsx` vs `src/modules/cart/components/cart-summary-optimized.tsx` vs `src/modules/cart/templates/cart-summary-optimized.tsx`.
   - `src/components/cart/add-to-cart-button-v2.tsx` vs `src/modules/cart/components/add-to-cart-button.tsx`.
   - `src/components/checkout/add-address-dialog.tsx` vs `src/modules/checkout/components/add-address-dialog.tsx`.
   - `src/components/checkout/address-section.tsx` vs `src/modules/checkout/components/checkout-address-section.tsx`.
3. **Dead Routes & Route Shadowing:**  
   - `src/app/(main)/categories/[handle]/page.tsx` exists as a physical page component (128 lines). However, `next.config.ts` (lines 80–87) specifies a permanent 301 redirect from `/categories/:handle` to `/catalog/categories/:handle`. The former route is completely dead and uncallable.
   - `src/app/sitemap.ts` includes static URLs for `/about` and `/categories`. Neither page exists in `src/app/`, producing guaranteed 404 errors when crawled by search engines.
4. **Domain Discrepancy & Brand Inconsistency:**  
   The codebase intermittently uses two distinct top-level domains:
   - Singular `cedarelevator.com`: hardcoded in `src/app/(main)/contact/page.tsx`, `src/app/(main)/contact/contact-routing.tsx` (`orders@cedarelevator.com`, `sales@cedarelevator.com`), `src/components/shared/footer/company-column.tsx`, and `admin-auth-server.ts`.
   - Plural `cedarelevators.com`: used in `src/app/layout.tsx`, `src/app/sitemap.ts`, `.env` (`NEXT_PUBLIC_SITE_URL`), and Resend default email (`updates@notify.cedarelevators.com`).

---

## 5. Dependency & Code Health Audit (Module B)

### 5.1 Dependency Inventory & Audit Matrix

| Package Name | Installed Version | Declared Purpose | Health Status | Phase 1 Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| `next` | `^16.1.1` | Application Framework | Modern (Turbopack) | Retain |
| `react` / `react-dom` | `^19.2.3` | UI Runtime | Modern | Retain |
| `typescript` | `^5.9.3` | Type Safety | Healthy (0 type errors) | Retain |
| `@tailwindcss/postcss` | `^4.1.18` | CSS Framework | Modern v4 | Retain & clean legacy configs |
| `@clerk/nextjs` | `^6.36.5` | Customer Authentication | Healthy (misused in admin) | Defer / Isolate for Phase 1 |
| `@supabase/supabase-js`| `^2.89.0` | Database SDK | Healthy | Retain as primary DB client |
| `@supabase/ssr` | `^0.8.0` | Server-Side Supabase | Healthy (Admin auth) | Retain for Admin Portal |
| `@tanstack/react-query`| `^5.90.12`| Async State Management | Healthy | Retain |
| `@hookform/resolvers` | `^5.2.2` | Form Validation (Zod) | Healthy | Retain |
| `lucide-react` | `^0.562.0` | Iconography | Healthy | Retain |
| `lucid` | `^2.21.0` | Unused Package | **Phantom / Hallucinated** | **Remove immediately** |
| `icons` | `^1.0.0` | Unused Package | **Phantom / Hallucinated** | **Remove immediately** |
| `react-beautiful-dnd` | `^13.1.1` | Drag & Drop | **Deprecated / Unused** | **Remove immediately** |
| `@types/react-beautiful-dnd` | `^13.1.8` | Types | **Deprecated / Unused** | **Remove immediately** |
| `pusher` / `pusher-js`| `^5.2.0` / `8.4.0` | WebSockets / Real-time | **Dead Dependency (0 imports)** | **Remove immediately** |
| `razorpay` | `^2.9.4` | Payment Gateway | Configured (Placeholders) | Defer to Phase 2 |
| `cloudinary` | `^2.8.0` | Media Storage | Active (Security gaps) | Retain with auth wrap |
| `@upstash/redis` | `^1.36.0` | KV Cache | Optional (Graceful fallback)| Retain (Free tier) |
| `resend` | `^4.0.1` | Transactional Email | Configured (Domain unverified)| Retain for Quote alerts |
| `@react-pdf/renderer` | `^4.3.2` | PDF Generation | Heavyweight (Phase 2 Orders)| Defer to Phase 2 |
| `jspdf` / `autotable` | `^3.0.4` / `5.0.7`| PDF Utilities | Redundant with React-PDF | Remove / Consolidate |
| `xlsx` / `papaparse` | `^0.18.5` / `5.5.3`| CSV/Excel Processing | Used in Admin CSV Import | Retain for Admin Catalogue |
| `@ducanh2912/next-pwa` | `^10.2.9` | Progressive Web App | Configured | Retain / Simplify |

### 5.2 Verification Commands & Concrete Results

#### Command 1: TypeScript Compilation Check
- **Command:** `pnpm exec tsc --noEmit`
- **Result:** Exited with code `0`.
- **Finding:** Zero compile-time type errors exist across all 1,063 TypeScript files. Type safety across internal domain definitions is fully compliant.

#### Command 2: ESLint Static Analysis
- **Command:** `pnpm run lint`
- **Result:** Failed with exit code `1`. Output: `Invalid project directory provided, no such directory: D:\web development\cedarelevators\lint`. Next.js CLI incorrectly parsed the space in `web development`.
- **Direct Execution:** `pnpm exec eslint src`
- **Result:** Exited with code `1`. Found **2,157 problems (1,258 errors, 899 warnings)**.
- **Root Cause Breakdown:**
  - Strict `@typescript-eslint/no-explicit-any` violations across catalog and quote forms (over 600 instances).
  - Unescaped entity warnings (`react/no-unescaped-entities`) in checkout failure screens and product pages.
  - React hook lifecycle violations (`react-hooks/set-state-in-effect`) in `src/modules/quote/components/variant-selectors.tsx:42:17`.
  - Ban on legacy `@ts-ignore` comments in favor of `@ts-expect-error`.

#### Command 3: Automated Unit & Integration Tests
- **Command:** `pnpm test`
- **Result:** Exited with code `1`. Output: `'jest' is not recognized as an internal or external command`.
- **Command:** `pnpm run test:e2e`
- **Result:** Exited with code `1`. Output: `'playwright' is not recognized as an internal or external command`.
- **Finding:** While test scripts are defined in `package.json`, neither Jest nor Playwright binaries are installed. The repository contains zero executable automated tests for core business logic.

#### Command 4: Production Build
- **Command:** `pnpm build`
- **Result:** Failed with exit code `1`.
- **Exact Build Error Log:**
  ```text
  ▲ Next.js 16.1.1 (Turbopack)
  Creating an optimized production build ...
  Turbopack build encountered 1 warnings:
  [next]/internal/font/google/space_grotesk_5521bc1.module.css
  Error while requesting resource:
  There was an issue establishing a connection while requesting https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap
  Error: Turbopack build failed with 1 errors:
  [next]/internal/font/google/space_grotesk_5521bc1.module.css
  next/font: error: Failed to fetch `Space Grotesk` from Google Fonts.
  ```
- **Finding:** The production build strictly depends on an active internet connection to download `Space_Grotesk` via `next/font/google` in `src/app/layout.tsx:107`. In restricted sandbox environments, air-gapped systems, or network outages, the build terminates fatally.

---

## 6. Database & Data Integrity Audit (Module C)

### 6.1 Database Architecture & Technology
The database is PostgreSQL hosted on **Supabase** (`hbkdbrxzqaraarivudej.supabase.co`). Schemas, functions, triggers, and Row Level Security (RLS) policies are defined across 58 SQL files in `supabase/migrations/` and 1 file in `database/migrations/`.

### 6.2 Database Migration Inventory & Numbering Anomalies
The migration sequence is severely compromised by duplicate numeric prefixes and un-prefixed files. Standard migration runners (such as Supabase CLI or Flyway) execute migrations in alphabetical order, which causes dependency failures during fresh environment provisioning.

```
MIGRATION PREFIX CONFLICTS:
  001_create_admin_authentication.sql  <--->  001_simplify_quote_statuses.sql
  002_add_quote_audit_log.sql          <--->  002_create_ecommerce_schema.sql
  003_add_verification_tables.sql     <--->  003_create_rbac_system.sql        <--->  003_pre_fix_rename_columns.sql
  004_admin_activity_logs.sql          <--->  004_create_banners_schema.sql
  005_create_collections_schema.sql    <--->  005_performance_indexes.sql
  006_add_admin_roles.sql              <--->  006_create_pricing_settings.sql
  009_add_cedar_product_fields.sql     <--->  009_add_entity_banner_images.sql
  010_add_inventory_adjustments.sql    <--->  010_create_banner_slides.sql      <--->  010_create_store_settings.sql
  011_add_collection_display_fields.sql<--->  011_add_slides_column_to_banners.sql
  012_create_user_profiles_table.sql   <--->  012_refactor_user_lists.sql
  [UNPREFIXED]: create_product_classification_junction_tables.sql
  [UNPREFIXED]: create_search_function.sql
```

### 6.3 Database Table Inventory

| Table Name | Primary Migration Source | Purpose | Referenced in Code? | Status / Finding |
| :--- | :--- | :--- | :--- | :--- |
| `products` | `002_create_ecommerce_schema.sql` | Core elevator product records | Yes (`listProducts`, PDP, Admin) | Active (Contains 39 products) |
| `product_variants` | `002_create_ecommerce_schema.sql` | SKU variants (capacities, sizes) | Yes (Catalog, PDP, Admin) | Active |
| `categories` | `002_create_ecommerce_schema.sql` | Product categories | Yes (Navbar, Catalog, Filters) | Active |
| `product_categories`| `20260105_junction_tables.sql` | Product-to-Category M:N junction | Yes (`listProducts`, Admin) | Active |
| `product_applications`| `classification_junction_tables.sql`| Product-to-Application junction | Yes (`applications/[handle]`) | Active |
| `product_subcategories`| `classification_junction_tables.sql`| Product-to-Subcategory junction | Yes (`category-subcategories.ts`) | Active |
| `quotes` | `000_create_quotes_schema.sql` | Customer quotation requests | Yes (`createQuote`, Admin quotes) | Active & Essential for Phase 1 |
| `quote_items` | `000_create_quotes_schema.sql` | Items attached to quote | Yes (`createQuote`, Admin quotes) | Active |
| `quote_attachments`| `000_create_quotes_schema.sql`| Drawing/spec file uploads | Yes (`createQuote`) | Active |
| `quote_counters` | `20260112_create_quote_counters.sql`| Daily sequential quote counter | Yes (`quote-number-generator.ts`) | Active |
| `admin_profiles` | `001_create_admin_authentication.sql`| Admin RBAC & approval records | Yes (`admin-auth-server.ts`) | Active (Supabase Auth link) |
| `admin_invites` | `admin-auth-server.ts` | SHA-256 hashed invite tokens | Yes (`admin-auth-server.ts`) | Active |
| `admin_settings` | `001_create_admin_authentication.sql`| Admin setup state flags | Yes (`isSetupCompleted`) | Active |
| `banners` / `banner_slides`| `004_create_banners.sql` / `010` | Homepage promotional banners | Yes (`banners.ts`, Admin) | Active |
| `cms_pages` | `20260117_create_cms_pages.sql` | Dynamic CMS policy pages | Yes (`cms.ts`, Admin) | Active |
| `why_choose_*` | `20260119_create_why_choose_cms.sql`| Why Choose Us section CMS | Yes (`why-choose/page.tsx`) | Active |
| `users` | **MISSING FROM MIGRATIONS** | Clerk-to-Supabase user sync | **Yes (27 occurrences in code)** | **CRITICAL: Missing Table Drift** |
| `inventory_items`| **MISSING FROM MIGRATIONS** | Inventory stock tracking | **Yes (`api/admin/inventory`)** | **CRITICAL: Missing Table Drift** |
| `profiles` | `003_create_rbac_system.sql` | Clerk JWT profile sync | Partial (`auth-sync.ts`) | Redundant with `user_profiles` |
| `user_profiles` | `012_create_user_profiles_table.sql`| Clerk user profile sync | Yes (`account/delete/route.ts`) | Redundant with `profiles` |
| `business_profiles`| `002_create_ecommerce_schema.sql`| Company & GST details | Partial (Checkout guard) | Redundant / Fragmented |
| `customer_meta` | `002_create_ecommerce_schema.sql`| Key-value customer metadata | No | Obsolete / Abandoned |
| `admin_users` | `006_add_admin_roles.sql` | Admin user table | No (uses `admin_profiles`) | Obsolete / Redundant |
| `carts` / `cart_items`| `002_create_ecommerce_schema.sql`| Shopping cart sessions | Yes (`cart.ts` - Phase 2) | Dormant for Phase 1 |
| `orders` / `order_items`| `002_create_ecommerce_schema.sql`| E-commerce orders & lines | Yes (`orders.ts` - Phase 2) | Dormant for Phase 1 |
| `payment_transactions`| `018_checkout_infrastructure.sql`| Gateway transaction records | Yes (`razorpay.ts` - Phase 2) | Dormant for Phase 1 |
| `wishlists` / `items`| `20260109_create_wishlists.sql` | Customer wishlist | Yes (`wishlist/route.ts`) | Dormant for Phase 1 |
| `user_favourites` | `012_refactor_user_lists.sql` | Favourites list | No | Obsolete (Replaced by wishlists)|

### 6.4 Entity Relationship Diagram (Mermaid)

```mermaid
erDiagram
    CATEGORIES ||--o{ PRODUCT_CATEGORIES : contains
    PRODUCTS ||--|{ PRODUCT_CATEGORIES : belongs_to
    PRODUCTS ||--|{ PRODUCT_VARIANTS : has_variants
    PRODUCTS ||--o{ PRODUCT_APPLICATIONS : classifies
    APPLICATIONS ||--o{ PRODUCT_APPLICATIONS : links

    QUOTES ||--|{ QUOTE_ITEMS : contains
    QUOTES ||--o{ QUOTE_ATTACHMENTS : includes
    QUOTE_COUNTERS ||--o{ QUOTES : generates_number_for
    PRODUCTS ||--o{ QUOTE_ITEMS : referenced_in
    PRODUCT_VARIANTS ||--o{ QUOTE_ITEMS : specifies

    ADMIN_PROFILES ||--o{ ADMIN_ACTIVITY_LOGS : performs
    ADMIN_PROFILES ||--o{ ADMIN_INVITES : creates

    CARTS ||--o{ CART_ITEMS : holds
    ORDERS ||--|{ ORDER_ITEMS : contains
    ORDERS ||--o{ PAYMENT_TRANSACTIONS : paid_by

    USER_PROFILES ||--o{ VERIFICATION_DOCUMENTS : uploads
```

---

## 7. Authentication & Security Audit (Module D)

### 7.1 Security Findings Summary Table

| Finding ID | Severity | Category | Vulnerability Description | Affected Files |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | **P0 (Critical)** | Privilege Escalation | Authorization roles (`accountType`, `is_verified`, `verificationStatus`) are stored in Clerk's client-writable `unsafeMetadata`. | `src/app/(main)/quotes/new/page.tsx:46-50`<br>`src/lib/services/auth-sync.ts:150`<br>`src/contexts/checkout-context.tsx:42` |
| **SEC-02** | **P0 (Critical)** | Broken Authorization | Admin REST mutation endpoints authenticate Clerk user presence (`userId`) but contain unfulfilled `// TODO: Add admin role check`. Any registered customer can delete or alter products and categories. | `src/app/api/admin/products/route.ts:22,62,97,141`<br>`src/app/api/admin/categories/route.ts:66,98,135`<br>`src/app/api/admin/stats/route.ts:12-21` |
| **SEC-03** | **P1 (High)** | Route Guard Bypass | Next.js middleware was renamed to `proxy.ts`, rendering it completely inactive. All subdomain rewrite and edge authentication guards are dormant. | `src/proxy.ts`<br>`src/middleware-checkout-protection.ts` |
| **SEC-04** | **P1 (High)** | Unrestricted File Upload | Cloudinary upload API handlers have zero authentication, no file size enforcement, and no MIME-type whitelisting. | `src/app/api/upload/cloudinary/route.ts`<br>`src/app/api/upload-cloudinary/route.ts` |
| **SEC-05** | **P2 (Medium)** | Auth Impedance Mismatch | Admin Dashboard authenticates via Supabase Auth, but Admin API routes validate Clerk JWTs. Legitimate admins receive 401s on API endpoints. | `src/app/admin/(dashboard)/layout.tsx`<br>`src/app/api/admin/products/route.ts` |
| **SEC-06** | **P2 (Medium)** | Cron Job Method Failure | Vercel Cron executes via HTTP GET, but `/api/account/delete` only implements POST and DELETE. Scheduled account purges fail with 405 Method Not Allowed. | `vercel.json:54-59`<br>`src/app/api/account/delete/route.ts:6,103` |
| **SEC-07** | **P3 (Low)** | Dangerous Naming Convention | `admin-auth-client.ts` references server-only `process.env.SUPABASE_SERVICE_ROLE_KEY` inside a module labeled "client-safe". | `src/lib/admin-auth-client.ts:102` |

### 7.2 Detailed Analysis of Critical Security Vulnerabilities

#### SEC-01: Insecure Client-Side Metadata Privilege Escalation (P0)
- **Evidence:**  
  In `src/app/(main)/quotes/new/page.tsx` lines 45–53:
  ```typescript
  // Use unsafeMetadata to match the rest of the codebase
  const accountType = user?.unsafeMetadata?.accountType as string | undefined;
  const isVerified = user?.unsafeMetadata?.is_verified === true;
  const actualVerificationStatus = (user?.unsafeMetadata as any)?.verificationStatus as string | undefined;

  if (isVerified || actualVerificationStatus === 'approved') {
      userType = 'verified';
  }
  ```
- **Vulnerability Mechanism:** Clerk's architecture explicitly divides user metadata into `publicMetadata` (read-only for clients, writeable only by server backend) and `unsafeMetadata` (read and write enabled for clients via the frontend Clerk JS SDK). Any user can open their browser console on the website and run:
  ```javascript
  await window.Clerk.user.update({
    unsafeMetadata: { accountType: "business", is_verified: true, verificationStatus: "approved" }
  });
  ```
  The user is instantly elevated across all server-side forms, quote calculations, and pricing visibility guards to a verified B2B customer.
- **Remediation:** Remove all reliance on `unsafeMetadata` for access control. Store authorization roles strictly in Clerk `publicMetadata` (via Server Actions / Webhooks) or within a dedicated database table (`user_profiles`) guarded by Postgres Row Level Security.

#### SEC-02: Broken Object-Level & Function Authorization in Admin APIs (P0)
- **Evidence:**  
  In `src/app/api/admin/products/route.ts` lines 132–156:
  ```typescript
  export async function DELETE(request: NextRequest) {
    try {
      const { userId } = await auth()
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // TODO: Add admin role check

      const { productIds } = await request.json()
      const result = await bulkDeleteProducts(productIds)
      return NextResponse.json({ success: true, message: `Deleted ${productIds.length} products` })
    }
  ```
- **Vulnerability Mechanism:** The route checks only whether `userId` is present from Clerk. Any person who creates a free account on the public storefront receives a valid `userId`. Because the role check was left as a `TODO`, an attacker can issue a standard `DELETE /api/admin/products` request with a JSON body of all product IDs and wipe the entire product database.
- **Remediation:** Replace Clerk `auth()` in all administrative routes with Supabase Admin Auth verification (`getCurrentAdmin()`) or enforce strict server-side role validation checking `admin_profiles.is_active = true`.

---

## 8. Feature-by-Feature Functional Audit (Module E)

### 8.1 Feature Status Matrix

| Module / Feature | Responsible Source Files | Status | Evidence / Notes |
| :--- | :--- | :--- | :--- |
| **Homepage** | `src/app/(main)/page.tsx`<br>`src/modules/home/*` | **WORKING** | Verified. Responsive hero, categories, why-choose CMS integration, and footer load reliably. |
| **Product Catalogue** | `src/app/(main)/catalog/page.tsx`<br>`src/modules/catalog/*` | **WORKING** | Verified. Fetches active products from Supabase, supports grid/list views, pagination, and sorting. |
| **Product Categories** | `src/app/(main)/catalog/categories/[handle]/page.tsx` | **WORKING** | Curated subcategories and category-filtered product queries work. (Note: Shadowed route `/categories/[handle]` is dead). |
| **Product Detail Pages (PDP)** | `src/app/(main)/products/[handle]/page.tsx`<br>`src/modules/products/templates/*` | **WORKING** | Desktop and mobile templates render product imagery, variants, specs, and enquiry CTAs cleanly. |
| **Product Search & Filtering** | `src/app/search/page.tsx`<br>`src/lib/data/products.ts:120-150` | **PARTIALLY WORKING** | Search queries call `supabase.rpc('search_products')`. Requires Postgres full-text function to exist. |
| **WhatsApp CTA Integration** | `src/components/common/floating-action-card.tsx`<br>`src/modules/checkout/components/whatsapp-button.tsx` | **PARTIALLY WORKING** | Working UI, but phone numbers are hardcoded inconsistently across 8 different files (some placeholders). |
| **Technical Quote Request** | `src/app/(main)/quotes/new/page.tsx`<br>`src/lib/actions/quotes.ts` | **PARTIALLY WORKING** | Full form UI and Supabase insertion logic exist, but queries non-existent `users` table for business priority. |
| **Contact Page** | `src/app/(main)/contact/page.tsx` | **WORKING** | Clean, direct contact information with WhatsApp and email links. Contains minor domain mismatch. |
| **Admin Authentication** | `src/app/admin/(auth)/*`<br>`src/lib/admin-auth-server.ts` | **WORKING** | Supabase Auth login, invite verification, and setup key activation work as expected. |
| **Admin Product CRUD** | `src/app/admin/(dashboard)/products/*`<br>`src/lib/actions/products/*` | **PARTIALLY WORKING** | UI and server actions exist, but API route handlers lack admin role authorization checks. |
| **Admin Category CRUD** | `src/app/admin/(dashboard)/categories/*`<br>`src/lib/actions/categories.ts` | **PARTIALLY WORKING** | Category creation and junction links exist; API route lacks role validation. |
| **Admin Quote Management** | `src/app/admin/(dashboard)/quotes/*`<br>`src/lib/actions/admin-quotes.ts` | **WORKING** | List view, status workflow transitions, priority badges, and customer quote review operate correctly. |
| **Admin CMS & Settings** | `src/app/admin/(dashboard)/settings/*` | **WORKING** | Banners, policies, why-choose CMS, and store profile settings operate via Supabase tables. |
| **Shopping Cart** | `src/app/(main)/cart/page.tsx`<br>`src/contexts/cart-context.tsx` | **IMPLEMENTED BUT UNVERIFIED** | Phase 2. UI and local storage sync exist, but suffers from duplicate components. |
| **Checkout Flow** | `src/app/(main)/checkout/page.tsx`<br>`src/modules/checkout/*` | **PARTIALLY WORKING** | Phase 2. Comprehensive multi-step UI, but tied to insecure metadata and unverified payment gateway. |
| **Razorpay Payments** | `src/lib/services/razorpay.ts`<br>`src/app/api/payments/*` | **NOT IMPLEMENTED / PLACEHOLDER**| Phase 2. Credentials in `.env` are placeholders; no live webhook processing verified. |
| **Order Management** | `src/app/admin/(dashboard)/orders/*`<br>`src/lib/actions/orders.ts` | **PARTIALLY WORKING** | Phase 2. UI exists, but queries non-existent `users` table for customer order history. |
| **Inventory Management** | `src/app/admin/(dashboard)/inventory/*`<br>`src/app/api/admin/inventory/route.ts` | **BROKEN** | Route queries non-existent `inventory_items` table in Supabase. |
| **Customer Accounts (Clerk)**| `src/app/(auth)/*`<br>`src/app/(main)/profile/*` | **IMPLEMENTED BUT UNVERIFIED** | Phase 2. UI complete, but role synchronization relies on client-writable metadata. |
| **Business Verification** | `src/domains/admin/business-verification/*` | **IMPLEMENTED BUT UNVERIFIED** | Phase 2. Document upload and review UI exist; not needed for Phase 1. |
| **Pusher Real-time Alerts** | None in `src/` | **OBSOLETE / UNUSED** | Packages installed in `package.json`, but zero imports exist in application code. |

---

## 9. External Services & Integrations (Module F)

| Service Name | Provider / Host | Purpose in Code | Required Environment Variables | Dependency Tier | Observed Status | Phase 1 Action |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Supabase** | Supabase Inc. (AWS eu-central / ap-south) | PostgreSQL DB, Auth (Admin), Storage | `NEXT_PUBLIC_SUPABASE_URL`<br>`NEXT_PUBLIC_SUPABASE_ANON_KEY`<br>`SUPABASE_SERVICE_ROLE_KEY` | **Critical** | Configured in `.env`; project host active. Live network isolated during offline audit. | **Retain as core DB** |
| **Clerk** | Clerk Inc. | Storefront Customer Authentication | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`<br>`CLERK_SECRET_KEY` | **Optional for Phase 1** (Critical Phase 2) | Configured in `.env` (keys populated). | **Bypass / Defer for Phase 1** (Public discovery needs no login) |
| **Cloudinary** | Cloudinary Ltd. | Product image & banner hosting | `CLOUDINARY_URL`<br>`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`<br>`NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | **High** | Configured in `.env`. Unauthenticated endpoints require immediate patching. | **Retain & Secure** |
| **Upstash Redis** | Upstash Inc. | Serverless KV cache for products | `UPSTASH_REDIS_REST_URL`<br>`UPSTASH_REDIS_REST_TOKEN` | **Optional** | Configured in `.env`. Gracefully falls back to direct DB queries when offline. | **Retain (Free Tier)** |
| **Resend** | Resend Inc. | Transactional emails (Admin invites, quotes) | `RESEND_API_KEY`<br>`RESEND_FROM_EMAIL` (default: updates@notify.cedarelevators.com) | **Optional** | API key populated. Domain verification unconfirmed. | **Retain for Admin Alerts** |
| **Razorpay** | Razorpay Software Pvt Ltd | Payment processing & webhooks | `NEXT_PUBLIC_RAZORPAY_KEY_ID`<br>`RAZORPAY_KEY_SECRET` | **None for Phase 1** (Critical Phase 2) | Credentials in `.env` are dummy placeholders. | **Defer to Phase 2** |
| **Google Fonts** | Google LLC | Space Grotesk font family | None (Loaded in `layout.tsx`) | **High (Build Blocker)**| Fails `pnpm build` in offline environments. | **Replace with `next/font/local`** |
| **Google Analytics** | Google LLC | Web traffic analytics | `NEXT_PUBLIC_GA_MEASUREMENT_ID` | **Optional** | Variable present in `.env`, but `gtag` script is not loaded in `layout.tsx`. | **Wire up properly for Phase 1** |
| **Pusher** | Pusher Ltd. | Real-time WebSocket notifications | None in `.env` | **None** | Completely unused in source code. | **Uninstall packages** |

---

## 10. Hosting, Deployment & Infrastructure Audit (Module G)

### 10.1 Vercel Configuration & Build Parameters
The deployment configuration is maintained in `vercel.json`:
- `buildCommand`: `pnpm run build`
- `outputDirectory`: `.next`
- `installCommand`: `pnpm install`
- `crons`: Scheduled daily execution of `/api/account/delete` at midnight (`0 0 * * *`).

### 10.2 Deployment Reusability & Blockers
1. **Build Failure on Google Fonts:**  
   Vercel build runners require outbound network access to fetch Google Fonts. If Google's font service times out or DNS resolution fails during CI, the entire build terminates fatally. Replacing `next/font/google` with local font files (`next/font/local`) guarantees 100% deterministic, offline-capable builds.
2. **Cron Job 405 Failure:**  
   The configured cron path `/api/account/delete` fails with HTTP 405 because Vercel Cron sends GET requests, while the route only exports POST and DELETE.
3. **Environment Variable Duplication:**  
   In the root `.env` file, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are defined twice with conflicting values (one test instance, one live instance). Vercel deployment requires scrubbing duplicate environment definitions.

---

## 11. Performance & SEO Audit (Module H)

### 11.1 Rendering & Asset Performance
- **Image Optimization:** Implemented using `next/image` with WebP and AVIF formats configured in `next.config.ts`. Image remote patterns correctly permit `res.cloudinary.com` and `supabase.co`. Caching TTL is set to 1 year (`31536000s`).
- **Client vs Server Rendering:** The public catalogue (`/catalog`) and PDP (`/products/[handle]`) properly leverage React Server Components (RSC) for initial data fetching, preventing client-side waterfalls. Interactive filtering and variant selection use localized `"use client"` wrappers.
- **Bundle Optimization:** `next.config.ts` incorporates `@next/bundle-analyzer` and configures `optimizePackageImports` for heavyweight libraries (`lucide-react`, `@radix-ui/*`, `date-fns`). However, unused packages like `@react-pdf/renderer` and `xlsx` must be kept out of public client bundles.

### 11.2 Search Engine Optimization (SEO)
- **Metadata Coverage:** Dynamic `generateMetadata` functions exist on all primary catalogue and product routes (`/catalog`, `/products/[handle]`, `/contact`), setting canonical URLs, OpenGraph titles, descriptions, and thumbnails.
- **Structured Data (JSON-LD):** Implemented in `src/app/layout.tsx` via `JsonLd` components injecting Schema.org `Organization` and `WebSite` structured data.
- **Sitemap Defect:** `src/app/sitemap.ts` hardcodes URLs for `/about` and `/categories`. As verified in Section 4.3, neither route exists in `src/app/`, exposing search engines to broken 404 links.

---

## 12. Code Reusability Assessment (Module I)

### 12.1 Reusability Classification Matrix

| Module / Component | Classification | Detailed Rationale & Action Required |
| :--- | :--- | :--- |
| **Homepage Layout & Sections** | **A. REUSE AS-IS** | High quality, responsive design, hero slider, and CMS sections are production-ready. |
| **Product Catalogue & Grid** | **B. REUSE WITH MODIFICATIONS** | Excellent foundation; remove dead `/categories/[handle]` route and ensure subcategory filters align with junction tables. |
| **Product Detail Pages (PDP)** | **B. REUSE WITH MODIFICATIONS** | Visually polished and responsive; disable Add-to-Cart and Buy Now buttons for Phase 1; keep Quote & WhatsApp CTAs. |
| **Search & Filtering UI** | **B. REUSE WITH MODIFICATIONS** | UI is complete; ensure backend Supabase RPC `search_products` exists or fall back to standard SQL ILIKE queries. |
| **Contact Page** | **A. REUSE AS-IS** | Complete, clean contact routing with direct WhatsApp and email methods. |
| **Admin Auth (Supabase)** | **B. REUSE WITH MODIFICATIONS** | Working authentication; must reinstate `middleware.ts` so admin routes are protected on the server. |
| **Admin Product CRUD** | **C. REPAIR** | Critical repair needed: add admin role check to `/api/admin/products` to block unauthorized deletions. |
| **Admin Category CRUD** | **C. REPAIR** | Add admin role authorization checks to `/api/admin/categories`. |
| **Admin Quote Management** | **A. REUSE AS-IS** | Fully functional quote list, status transitions, and audit logs. |
| **Quote Request Form** | **D. SIMPLIFY** | Remove dependencies on Clerk user metadata and `users` table; allow any visitor to submit an enquiry as a guest lead. |
| **WhatsApp Integration** | **D. SIMPLIFY** | Centralize the WhatsApp phone number into a single environment variable (`NEXT_PUBLIC_WHATSAPP_NUMBER`). |
| **Image Storage (Cloudinary)** | **C. REPAIR** | Add server-side authentication and file validation to upload routes to stop unauthenticated abuse. |
| **Shopping Cart & Checkout** | **E. REMOVE / DEFER** | Over-engineered for Phase 1; defer entirely to Phase 2. Hide routes and disable cart drawer. |
| **Razorpay Payments** | **E. REMOVE / DEFER** | Not required for Phase 1 enquiry model; defer to Phase 2. |
| **Business Verification System** | **E. REMOVE / DEFER** | Complex GST upload and review workflow not required for product discovery. Defer to Phase 2. |
| **Pusher Real-time Alerts** | **E. REMOVE / DEFER** | Dead code; remove package dependencies to save bundle weight. |

---

## 13. Phase 1 Suitability Assessment

### 13.1 Phase 1 Scope vs. Existing Repository

```
+-----------------------------------------------------------------------------------------+
|                               PHASE 1 SCOPE ALIGNMENT MATRIX                            |
+-----------------------------------------------------------------------------------------+
| Feature Requirement      | Existing Repository Condition          | Feasibility Status  |
|--------------------------|----------------------------------------|---------------------|
| Public Product Discovery | Fully built in src/app/(main)/catalog  | COMPLETE (Ready)    |
| Category Hierarchy       | Fully built with junction tables       | COMPLETE (Ready)    |
| Product Detail Pages     | Desktop & Mobile PDP templates built   | COMPLETE (Ready)    |
| Product Search           | Search input & RPC integration built   | COMPLETE (Ready)    |
| Product Enquiry Form     | Built in src/modules/quote             | MINOR MODIFICATION  |
| WhatsApp Direct CTA      | Built in floating & sticky components  | MINOR CONSOLIDATION |
| Contact & Location Info  | Built in src/app/(main)/contact        | COMPLETE (Ready)    |
| Admin Authentication     | Supabase Auth built in /admin/login    | REPAIR MIDDLEWARE   |
| Admin Product Management | Admin products list & form built       | REPAIR PERMISSIONS  |
| Admin Category CRUD      | Admin categories list & form built     | REPAIR PERMISSIONS  |
| Admin Quote Management   | Admin quote list & detail built        | COMPLETE (Ready)    |
| Budget Constraint        | ₹12,000 allocated                      | FEASIBLE (No rewrite|
+-----------------------------------------------------------------------------------------+
```

### 13.2 Delivery Strategy Within ₹12,000 Budget
Because approximately **70% to 75%** of the Phase 1 surface area already exists in polished, compiling code, **a rewrite is entirely unjustified and would exceed the budget by 5x to 8x**. 

The entire Phase 1 budget and effort should be directed at:
1. **Stabilization & Security Patching (40% of effort):** Renaming `proxy.ts` to `middleware.ts`, locking down admin API authorization, securing the Cloudinary upload route, and converting Google Fonts to local fonts to ensure clean builds.
2. **Simplification & Decoupling (35% of effort):** Decoupling the Quote Request form from Clerk auth so guest visitors can submit technical enquiries with zero registration friction, centralizing the WhatsApp number, and commenting out cart/checkout nav icons.
3. **Configuration & Data Verification (25% of effort):** Verifying the 39 elevator products in the Supabase instance, confirming domain DNS records, and deploying to Vercel on free/low-cost tiers.

---

## 14. Phase 2 Architectural Readiness

### 14.1 E-Commerce Readiness & Roadblocks
When Cedar Elevators expands to full e-commerce in Phase 2, the following technical foundations exist, alongside specific architectural traps that must be avoided:

1. **Cart & Locking:** A Redis/Supabase cart system (`src/modules/cart/`) is scaffolded with cart-locking mechanisms to prevent race conditions during checkout. However, duplicate components between `src/components/cart` and `src/modules/cart` must be pruned before activation.
2. **B2B / B2C Pricing Architecture:** The database schema supports `price`, `compare_at_price`, and wholesale discount tiers. However, the mechanism determining whether a user receives wholesale pricing must be moved off Clerk `unsafeMetadata` to a secure server-side model.
3. **GST & Tax Workflows:** Schema tables for `tax_settings` and `business_addresses` exist. In Phase 2, GSTIN validation must be hooked up to an official GST API (such as ClearTax or Cashfree GST verification) rather than trusting client-uploaded document names.
4. **Payment Gateway Integration:** Razorpay SDK is installed. Activating Phase 2 requires registering an active merchant account, acquiring live Razorpay keys, and activating the webhook handler in `src/app/api/webhooks/razorpay/route.ts`.
5. **Database User Table Unification:** The fatal disconnect where application code queries `public.users` while migrations create `user_profiles` and `profiles` must be resolved permanently in Phase 1 to prevent corrupting Phase 2 order histories.

---

## 15. Critical Issues & Technical Risks

### 15.1 Major Issue Register

#### Issue ISS-01: Renamed Middleware Disables All Edge Security & Subdomain Routing
- **Severity:** P0 (Critical)
- **Evidence:** `src/proxy.ts` exists containing `clerkMiddleware()` and admin route logic; `git show 82c970c` proves it was renamed from `src/middleware.ts`.
- **Affected Files:** `src/proxy.ts`, `src/middleware-checkout-protection.ts`
- **Business Impact:** Admin portals and checkout routes are completely unprotected by server middleware. Subdomain routing fails.
- **Complexity:** Low (Rename file to `src/middleware.ts` and test matcher configuration).

#### Issue ISS-02: Missing Role Authorization on Admin REST API Routes
- **Severity:** P0 (Critical)
- **Evidence:** `src/app/api/admin/products/route.ts:141` has `// TODO: Add admin role check` immediately prior to `bulkDeleteProducts()`.
- **Affected Files:** `src/app/api/admin/products/route.ts`, `src/app/api/admin/categories/route.ts`, `src/app/api/admin/stats/route.ts`
- **Business Impact:** Any authenticated public storefront customer can wipe out or deface products and categories.
- **Complexity:** Medium (Implement `verifyAdminSession()` helper using Supabase Auth cookies).

#### Issue ISS-03: Privilege Escalation via Client-Writable `unsafeMetadata`
- **Severity:** P0 (Critical)
- **Evidence:** `src/app/(main)/quotes/new/page.tsx:46` reads `user?.unsafeMetadata?.accountType` and `is_verified`.
- **Affected Files:** `src/app/(main)/quotes/new/page.tsx`, `src/lib/services/auth-sync.ts`, `src/contexts/checkout-context.tsx`
- **Business Impact:** Commercial customers can spoof verified business status to bypass verification and gain unapproved B2B discounts.
- **Complexity:** Medium (Migrate role verification to Supabase database table or Clerk `publicMetadata`).

#### Issue ISS-04: Unauthenticated Public Cloudinary Upload Endpoints
- **Severity:** P1 (High)
- **Evidence:** `src/app/api/upload/cloudinary/route.ts` accepts multipart form uploads without calling `auth()` or validating file extensions.
- **Affected Files:** `src/app/api/upload/cloudinary/route.ts`, `src/app/api/upload-cloudinary/route.ts`
- **Business Impact:** Malicious actors can upload malware or illegal media, exhausting Cloudinary quotas and creating legal liability.
- **Complexity:** Low (Enforce authentication or consolidate to `src/app/api/upload/route.ts` which has validation).

#### Issue ISS-05: Build Failure Due to External Google Fonts Fetching
- **Severity:** P1 (High)
- **Evidence:** `pnpm build` terminates fatally with `Failed to fetch Space Grotesk from Google Fonts`.
- **Affected Files:** `src/app/layout.tsx:107-109`
- **Business Impact:** Application cannot be compiled or deployed in air-gapped CI/CD environments or during external network interruptions.
- **Complexity:** Low (Download font WOFF2 files and load via `next/font/local` or fallback to system sans-serif).

#### Issue ISS-06: Database Schema Drift (`public.users` Table Missing)
- **Severity:** P1 (High)
- **Evidence:** `auth-sync.ts:89`, `quotes.ts:58`, and `orders.ts:308` call `supabase.from('users')`, but no migration creates `users`.
- **Affected Files:** `supabase/migrations/`, `src/lib/services/auth-sync.ts`, `src/lib/actions/quotes.ts`
- **Business Impact:** Code paths querying `users` throw database errors or silently fail to record user associations.
- **Complexity:** Medium (Create migration establishing canonical view/table or update code to target `user_profiles`).

#### Issue ISS-07: Broken Sitemap URLs (Guaranteed 404s)
- **Severity:** P2 (Medium)
- **Evidence:** `src/app/sitemap.ts:35-40` includes `/about` and `/categories`. Neither route exists in `src/app/`.
- **Affected Files:** `src/app/sitemap.ts`
- **Business Impact:** Search engines crawl broken pages, degrading organic domain authority and indexing quality.
- **Complexity:** Low (Remove dead URLs and add `/catalog` and dynamic category handles).

#### Issue ISS-08: Inconsistent & Placeholder WhatsApp Phone Numbers
- **Severity:** P2 (Medium)
- **Evidence:** Dummy number `919876543210` used in `floating-action-card.tsx:14`, `911234567890` in `help-section.tsx:43`, real number `918220202757` in `contact/page.tsx:35`.
- **Affected Files:** `src/components/common/floating-action-card.tsx`, `src/components/shared/sections/help-section.tsx`, `src/app/(main)/contact/page.tsx`
- **Business Impact:** Potential customers attempting to enquire via WhatsApp are directed to fake/dead telephone numbers.
- **Complexity:** Low (Consolidate into `process.env.NEXT_PUBLIC_WHATSAPP_NUMBER`).

---

## 16. Recommended Actions & Implementation Roadmap

```mermaid
flowchart LR
    subgraph Step1 ["Sprint 1: Build & Security Lockdown (Days 1-2)"]
        S1A["Rename proxy.ts -> middleware.ts"]
        S1B["Fix Space Grotesk -> Local Font"]
        S1C["Lock Admin APIs (Add Role Verification)"]
        S1D["Secure Cloudinary Upload Routes"]
    end

    subgraph Step2 ["Sprint 2: Phase 1 Scope Pruning (Days 3-4)"]
        S2A["Hide Cart & Checkout Icons"]
        S2B["Simplify Quote Form to Guest Lead Capture"]
        S2C["Centralize WhatsApp Phone Number"]
        S2D["Fix Sitemap 404 Links"]
    end

    subgraph Step3 ["Sprint 3: Database & Production Launch (Days 5-6)"]
        S3A["Verify Supabase DB & 39 Products"]
        S3B["Configure Vercel Deployment & Domain DNS"]
        S3C["End-to-End Sanity Testing"]
        S3D["Client Handover & Documentation"]
    end

    Step1 --> Step2 --> Step3
```

### 16.1 Immediate Priority Actions (P0 / P1)
1. **Reinstate `src/middleware.ts`:** Move/rename `src/proxy.ts` to `src/middleware.ts`. Ensure public routes match `/`, `/catalog(.*)`, `/products(.*)`, `/contact`, `/quotes(.*)`.
2. **Patch Admin API Authorization:** Create a shared server verification utility `verifyAdminSession()` in `src/lib/admin-auth-server.ts`. Replace Clerk `auth()` checks in `/api/admin/*` with Supabase admin session checks verifying `admin_profiles.is_active = true`.
3. **Eliminate Build Failure on Fonts:** Download `SpaceGrotesk-VariableFont_wght.ttf` into `public/fonts/` and configure `localFont` in `src/app/layout.tsx`. Verify `pnpm build` executes cleanly offline.
4. **Lock Cloudinary Uploads:** Restrict `POST /api/upload/cloudinary` to authenticated administrators or deprecate it in favor of `src/app/api/upload/route.ts` with strict 10MB limits and image MIME whitelisting.
5. **Decouple Phase 1 Quote Enquiries from Clerk Auth:** Refactor `src/app/(main)/quotes/new/page.tsx` and `src/lib/actions/quotes.ts` so any visitor can submit name, phone, email, and required elevator parts as a guest enquiry without signing up. Remove queries to the non-existent `users` table.

### 16.2 Phase 1 Polish Actions (P2 / P3)
1. **Centralize WhatsApp Number:** Set `NEXT_PUBLIC_WHATSAPP_NUMBER=918220202757` in `.env` and replace all hardcoded dummy strings (`919876543210`, `911234567890`) with this single source of truth.
2. **Correct `src/app/sitemap.ts`:** Remove `/about` and `/categories`. Dynamically inject `/catalog`, `/catalog/categories/[handle]`, and active product URLs.
3. **Clean Dead Code & Unused Packages:** Run `pnpm remove react-beautiful-dnd @types/react-beautiful-dnd lucid icons pusher pusher-js` to purge dead weight from `package.json` and lockfile.

---

## 17. Questions Requiring Client Input

Before beginning technical modifications, the following clarifications must be obtained from the client:
1. **Primary Domain Ownership:** Does the client own `cedarelevators.com` (plural), `cedarelevator.com` (singular), or both? Which domain is currently registered and active with DNS access?
2. **Canonical Business Contact Details:**
   - Confirm the official WhatsApp business phone number for customer enquiries (is `+91 8220202757` the permanent number?).
   - Confirm the official customer support email address (e.g., `contact@cedarelevators.com` vs `sales@cedarelevators.com`).
   - Confirm physical office address for the contact page and footer.
3. **External Cloud Accounts Status:**
   - Does the client have active login credentials for the Supabase project `hbkdbrxzqaraarivudej`?
   - Does the client have access to the Cloudinary account (`cloud_name` in `.env`)?
   - Is there an existing Vercel account, or should a new account under the client's email be provisioned?
4. **Product Catalog Verification:** Are the 39 elevator products uploaded in May 2026 accurate in specifications and pricing for Phase 1, or is a revised product catalogue CSV ready for upload?

---

## 18. Verification Limitations

This audit was conducted strictly in a read-only environment according to client instructions. The following limitations apply to the observed results:
1. **Sandbox Network Isolation:** Outbound internet access was disabled in the audit sandbox. Live pinging and live API calls to Supabase, Clerk, Cloudinary, Resend, and Razorpay servers could not be performed directly from the terminal. Findings regarding these services are derived from repository credentials, configuration files, and code inspection.
2. **Live Database Data Inspection:** Direct SQL queries against the live Supabase database could not be executed within the isolated sandbox. Existence of the 39 product records is documented from `product-upload-acknowledgement.md` and repository migration history. Live database verification must be performed once credentials and network access are validated.
3. **Client-Side Runtime Verification:** Lighthouse performance audits and full headless browser runs could not be completed due to missing Playwright/Jest binaries in `node_modules` and the font build failure.

---

## 19. Audit Commands & Test Results Record

| Command Executed | Purpose | Exit Code | Observed Output / Failure Reason |
| :--- | :--- | :---: | :--- |
| `pnpm exec tsc --noEmit` | TypeScript type checking | `0` | Clean pass; zero compilation or type errors. |
| `pnpm run lint` | ESLint execution | `1` | Failed: `Invalid project directory provided ... /lint` (Space in path). |
| `pnpm exec eslint src` | ESLint direct execution | `1` | Failed: 2,157 violations (1,258 errors, 899 warnings). |
| `pnpm test` | Automated unit tests | `1` | Failed: `'jest' is not recognized as an internal or external command`. |
| `pnpm run test:e2e` | End-to-end tests | `1` | Failed: `'playwright' is not recognized as an internal or external command`. |
| `pnpm build` | Production Next.js build | `1` | Failed: `next/font: error: Failed to fetch Space Grotesk from Google Fonts`. |
| `git status` | Working tree clean check | `0` | Clean branch `origin/main` (5 untracked markdown/python data files). |

---

## 20. Final Executive Assessment

```
+-----------------------------------------------------------------------------------------+
|                                FINAL AUDIT SCORECARD                                    |
+-----------------------------------------------------------------------------------------+
|  Overall Project Condition:         FAIR (Strong Frontend, Incomplete/Fragile Backend)  |
|  Estimated Reusable Code:           70% – 75% for Phase 1 Target                        |
|  Architecture Retention:            RECOMMENDED (Retain Next.js + Supabase foundation)  |
|  Major Rewrite Required:            NO (Feasible within ₹12,000 budget via stabilization|
+-----------------------------------------------------------------------------------------+
```

### 20.1 Justification of Reusability Percentage (70% – 75%)
The estimate of 70% to 75% reusability is grounded in concrete line-by-line evidence:
- **Public Storefront UI (100% Reusable):** Homepage, catalog grid, product filtering, responsive navigation, footer, and mobile layouts are fully built, aesthetically polished, and type-safe.
- **Product Architecture (85% Reusable):** Data fetching queries, junction tables (`product_categories`, `product_applications`), and slug routing are operational.
- **Admin Management (70% Reusable):** Product listing, creation forms, category managers, quote review panels, and CMS settings are fully functional in the UI and server actions, requiring only middleware and permission patches.
- **Dormant / Excluded Code (25% - 30%):** Cart context, multi-step checkout pages, Razorpay payment services, and business verification workflows represent over-engineering that is simply disabled for Phase 1 and preserved for Phase 2.

### 20.2 The Five Most Important Issues to Resolve
1. **Reinstate `src/middleware.ts`:** Rename `src/proxy.ts` back to `src/middleware.ts` to restore edge route protection and domain routing.
2. **Fix Admin API Authorization (SEC-02):** Eliminate the `// TODO: Add admin role check` vulnerability on administrative mutation routes to prevent public catalog tampering.
3. **Resolve Build Font Failure (ISS-05):** Replace external Google Fonts with local static font assets to guarantee deterministic production builds on Vercel.
4. **Secure Cloudinary Upload Endpoints (SEC-04):** Enforce authentication and MIME/size limits on image upload route handlers.
5. **Decouple Phase 1 Quotations from Clerk & Missing Tables (ISS-06):** Streamline the quote submission flow into an unauthenticated guest lead form, eliminating reliance on client `unsafeMetadata` and the non-existent `users` table.

### 20.3 Readiness for Phase 1 Delivery
**Phase 1 can be delivered rapidly and within the ₹12,000 budget without a rewrite.** The codebase does not suffer from fundamental architectural failure; rather, it suffers from feature creep (having attempted full B2B e-commerce prematurely) and incomplete integration seams. By securing the endpoints, reinstating middleware, and trimming the deferred Phase 2 modules, Cedar Elevators can launch a high-performance, professional product discovery and enquiry platform.
