# Cedar Elevators - Phase 1 Authentication Simplification Report

**Date:** November 2026  
**Status:** Completed  
**Objective:** Simplify Cedar Elevators for Phase 1 (Product Catalogue & Quotation Enquiry Website), eliminating customer-facing login/registration while strictly safeguarding administrative operations with Clerk + Supabase RBAC.

---

## 1. Executive Summary

In Phase 1, Cedar Elevators operates as a **product catalogue and quotation enquiry platform**, not a transactional e-commerce store. 

All customer-facing friction (mandatory accounts, checkout, carts, profile logins) has been removed from the public journey. Visitors can freely explore the full catalogue and submit quotation enquiries without creating an account or logging in.

Administrative capabilities (product management, categories, inventory, enquiry review, media uploads, and analytics) are strictly protected by Clerk authentication paired with the `public.admin_users` table in Supabase.

---

## 2. Completed Scope & Key Deliverables

### A. Dedicated Admin Authorization Engine (`src/lib/auth/require-admin.ts`)
- Implemented `requireAdmin()`:
  - Validates active Clerk session (`auth()`). Returns **401 Unauthorized** if not authenticated.
  - Queries `public.admin_users` in Supabase using the server-side admin client (`createAdminClient()`).
  - Verifies `is_active: true` and active role assignment (`super_admin` / `admin`).
  - Includes an automatic primary email fallback and `clerk_user_id` linkage for resilience against account rotation.
  - Returns **403 Forbidden** if authenticated but not registered as an active admin.
- Updated `src/lib/auth/admin-roles.ts` to wrap `requireAdmin()`, harmonizing Server Actions and API handlers.

### B. Next.js 16 Proxy Optimization (`src/proxy.ts`)
- Utilizes Next.js 16 `proxy.ts` convention with `clerkMiddleware`.
- **Dormant Route Redirection**: Automatically redirects Phase 2 customer-account and e-commerce paths (`/checkout(.*)`, `/cart(.*)`, `/profile(.*)`) to `/products`.
- **Admin Protection**: Enforces `await auth.protect()` across all `/admin(.*)` and `/api/admin(.*)` routes, with explicit exceptions for `/admin/login`, `/admin/setup`, etc.
- **Public Surface Preservation**: Leaves all catalogue, product detail, home, contact, and `/quotes/new` routes open to the public without auth checks.

### C. Hardened Administrative API & Upload Endpoints
Protected the following endpoints with `requireAdmin()`:
1. `src/app/api/admin/products/route.ts` (GET, POST, PATCH, DELETE)
2. `src/app/api/admin/categories/route.ts` (GET, POST, PATCH, DELETE)
3. `src/app/api/admin/inventory/route.ts` (GET, PATCH)
4. `src/app/api/admin/stats/route.ts` (GET)
5. `src/app/api/admin/elevator-types/route.ts` (GET, POST)
6. `src/app/api/admin/customers/route.ts` (GET, getCustomerDetails)
7. `src/app/api/admin/business-verifications/route.ts` (GET, PATCH)
8. `src/app/api/admin/analytics/route.ts` (GET)
9. `src/app/api/upload/cloudinary/route.ts` (POST - admin check, MIME verification, 10MB limit)
10. `src/app/api/upload-cloudinary/route.ts` (POST - admin check)

### D. Public Quotation Enquiry Endpoint (`src/app/api/quotes/route.ts`)
- Created a public quotation submission handler for unauthenticated visitors.
- **Rate Limiting**: Sliding window rate limiter (maximum 5 requests per 10 minutes per IP).
- **Honeypot Anti-Spam**: Invisible `hp_website` field catches automated bot submissions and fakes success without database writes.
- **Zod Validation**: Strict schema for customer contact details (`name`, `email`, `phone`, `company_name`, `notes`) and product items (`product_id`, `variant_id`, `quantity`).
- **Database Persistence**: Creates record in `public.quotes` with `account_type: 'guest'`, `user_id: null`, `status: 'reviewing'`, and creates corresponding `public.quote_items`.
- **Reference Number**: Generates and returns a human-readable quote number (e.g. `CED-QT-GS-...`).

### E. Simplified Storefront Navigation
- **Desktop Navbar (`src/modules/layout/components/desktop/navbar/components/navbar-actions.tsx`)**:
  - Removed `LoginHoverCard`, `CartHoverCard`, `DeliverToMenu`, and Wishlist.
  - Added direct "Contact" link and high-visibility "Request a Quote" CTA button leading to `/quotes/new`.
  - Added discreet "Admin" portal badge visible only to authenticated administrative staff.
- **Mobile Bottom Navigation (`src/modules/layout/components/mobile/bottom-nav/`)**:
  - Replaced cart and profile buttons with 4 clean Phase 1 navigation items: `Home` (`/`), `Catalog` (`/products`), `Quote` (`/quotes/new`), `Contact` (`/contact`).
- **Mobile Sidebar (`src/modules/layout/components/mobile/sidebar/components/sidebar-header.tsx`)**:
  - Removed customer login and signup buttons.
  - Added Cedar Elevators branding with direct "Get Quote" and "Contact" buttons.
- **Product Card (`src/components/ui/product-card.tsx`)**:
  - Replaced e-commerce badges ("Instant checkout", "Verified") with Phase 1 B2B/B2C copy: "Direct Manufacturer Pricing".

---

## 3. Data Integrity & Non-Destructive Principles

- **Zero Data Loss**: All existing customer profiles (`customer_meta`, `business_profiles`), orders (`orders`, `order_items`), and historical quotes in Supabase remain untouched.
- **No Dependency Churn**: Clerk dependencies and infrastructure were preserved, repurposed exclusively for administrative access.
- **Service-Role Isolation**: Supabase service-role keys remain strictly on the server (`createAdminClient()`); never leaked to the client/browser.

---

## 4. Verification Matrix

| Requirement | Target Behavior | Verified Status |
| :--- | :--- | :---: |
| **Public Browsing** | Products, categories, details accessible without login | **PASSED** |
| **Guest Quotation** | Public visitor submits quote via `/api/quotes` without login | **PASSED** |
| **Bot & Spam Trap** | Honeypot traps automated bots and silently drops payloads | **PASSED** |
| **Rate Limiting** | Max 5 requests per 10 min window per IP | **PASSED** |
| **Unauthenticated Admin Access** | Returns 401 Unauthorized / redirects to `/admin/login` | **PASSED** |
| **Non-Admin Access** | Authenticated Clerk user without admin role gets 403 Forbidden | **PASSED** |
| **Authorized Admin Access** | Active admin in `public.admin_users` gets 200 Authorized | **PASSED** |
| **Admin Route Protection** | All `/admin/*` and `/api/admin/*` require admin auth | **PASSED** |
| **Media Upload Security** | Only authenticated admins can upload files to Cloudinary | **PASSED** |
| **Dormant Commerce Redirection**| Requests to `/checkout`, `/cart`, `/profile` redirect to `/products` | **PASSED** |
| **Data Preservation** | Zero customer, order, or schema tables dropped/modified | **PASSED** |
| **TypeScript Compilation** | `tsc --noEmit` succeeds with zero errors | **PASSED** |
