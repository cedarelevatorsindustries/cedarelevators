# Cedar Elevators - Admin Authentication Migration Assessment
## Clerk Admin Auth → Supabase Auth (Phase A Inspection)

**Date:** November 21, 2026  
**Target Supabase Project:** `hbkdbrxzqaraarivudej`  
**Assessment Phase:** Phase A (Read-only Codebase and Database Inspection)  
**Status:** COMPLETE - Ready for Review & Approval  

---

## 1. Executive Summary

This assessment provides a definitive, ground-truth inspection of the authentication infrastructure for Cedar Elevators. The objective is to migrate administrator authentication to **Supabase Auth as the sole authentication provider for administrators**, while preserving **Clerk exclusively for customer authentication** and public browsing.

### Key Discoveries from Live Codebase & Production Database

1. **Native Supabase Admin Account Already Exists**:
   - Live database inspection of `auth.users` confirms an existing administrator account:
     - **Email**: `cedarelevatorsindustries@gmail.com`
     - **Supabase Auth UUID (`auth.users.id`)**: `4a5ce04a-b673-4423-bcb5-a4f5f97e6a54`
     - **Confirmed at**: `2025-12-25 08:09:31 UTC`
     - **Status**: Active, Email Confirmed.
2. **Authoritative Schema Integration**:
   - `public.admin_profiles` is the **authoritative, schema-bound administrator table**:
     - Contains an active record for `user_id = '4a5ce04a-b673-4423-bcb5-a4f5f97e6a54'` with role `super_admin` (`is_active = true`, display name `"Sathya"`).
     - Defined with a native foreign key constraint: `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE`.
     - Integrated with PostgreSQL RLS policies and the native helper function `get_my_admin_role()`.
   - `public.admin_users` was created as an auxiliary table during a Clerk exploration:
     - Contains 1 record with `clerk_user_id = 'user_3818lIKckYFWLCLthzCyV8FPinl'`.
     - Has no foreign key relation to `auth.users`.
     - Will remain in the database untouched to preserve historical data, but will be decommissioned from active authorization in favor of `admin_profiles`.
3. **Dual Authentication Inconsistency in Code**:
   - **Login UI (`/admin/login`)**: Calls `adminLoginAction`, which already uses `supabase.auth.signInWithPassword()` and verifies `admin_profiles`.
   - **Dashboard Layout (`/admin/(dashboard)/layout.tsx`)**: Client-side check uses `supabase.auth.getUser()`, but does not verify `admin_profiles` or server-side authorization.
   - **Proxy Middleware (`src/proxy.ts`)**: Traps `/admin(.*)` and `/api/admin(.*)` using Clerk's `clerkMiddleware(auth => auth.protect())`, meaning administrators could not access the dashboard unless they also had an active Clerk session.
   - **Authorization Helper (`src/lib/auth/require-admin.ts`)**: Looked up Clerk's `auth().userId` against `admin_users.clerk_user_id`.
   - **Admin API Routes**: Highly fragmented - 7 routes check Clerk via `requireAdmin()`, 7 check Clerk directly, 4 check Supabase Auth, 1 uses an email-matching fallback, and 11 endpoints are unguarded.

---

## 2. Authentication Dependency Inventory

Across the application codebase, authentication usages are classified into four discrete operational categories:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CEDAR ELEVATORS AUTH SCOPE                      │
├───────────────────────────────────┬────────────────────────────────────┤
│         ADMIN AUTHENTICATION      │       CUSTOMER AUTHENTICATION      │
│      Target: Supabase Auth Only   │        Retain: Clerk Auth          │
├───────────────────────────────────┼────────────────────────────────────┤
│ • /admin/login                    │ • Customer Sign In (/sign-in)      │
│ • /admin/(dashboard)/* (62 pages) │ • Customer Sign Up (/sign-up)      │
│ • /api/admin/* (30 route handlers)│ • Customer Account & Profile pages │
│ • Admin Server Actions            │ • Cart & Checkout flows            │
│ • Admin CMS / Product Management  │ • Customer order history & reviews │
│ • Verification Document Approvals │ • Clerk Webhooks & auth-sync       │
└───────────────────────────────────┴────────────────────────────────────┘
```

### A. Admin Authentication Dependencies (To Be Migrated)

| Location | Current Mechanism | Target Mechanism |
|---|---|---|
| `src/proxy.ts` | Clerk `auth.protect()` on `/admin(.*)` and `/api/admin(.*)` | Supabase SSR cookie session verification on `/admin/*` routes; bypass login/recover/invite. Customer Clerk sessions blocked. |
| `src/lib/auth/require-admin.ts` | Clerk `auth()` + `currentUser()` checking `admin_users.clerk_user_id` & email | Supabase SSR `createServerSupabase().auth.getUser()` + `admin_profiles` lookup by `user.id`. Strict role hierarchy. |
| `src/lib/auth/admin-roles.ts` | Dual check: `requireAdmin()` (Clerk) with email fallback to Supabase | Exclusively Supabase Auth UUID + `admin_profiles.role`. Email-only fallback removed. |
| `src/app/admin/(dashboard)/layout.tsx` | Client-only `supabase.auth.getUser()` | Server Component or authenticated SSR guard with `admin_profiles.is_active` validation. |
| `src/app/api/admin/*` (30 routes) | Inconsistent (Clerk `requireAdmin`, direct Clerk, Supabase, or unguarded) | Unified `requireAdmin(minRole)` check at every route entry point. |
| `src/lib/actions/admin-quotes/*` | Mixed `clerk_user_id` tracking & `getCurrentAdminUser` | Supabase Auth UUID tracking & centralized role enforcement. |

### B. Customer Authentication Dependencies (To Be Preserved Untouched)

The following components and routes are strictly customer-facing and will **remain on Clerk**:
- **Storefront Client Hooks**: `src/lib/auth/client.ts` (`useUser`, `useClerk`, `useSignIn`, `useSignUp`).
- **Server Customer Profile Context**: `src/lib/auth/server.ts` (`getAuthUser()`, `EnhancedAuthUser`).
- **Clerk-Supabase User Sync**: `src/lib/services/auth-sync.ts` (`syncUserWithSupabase`).
- **Customer Pages**: `/sign-in`, `/sign-up`, `/business-signup`, `/individual-signup`, `/profile/*`, `/cart`, `/checkout`.
- **Customer Actions & APIs**: `src/lib/actions/cart.ts`, `src/lib/actions/checkout/*`, `src/app/api/addresses/*`, `src/app/api/orders/*`.

### C. Shared / Public Endpoints

- **Guest Quotation Submission (`POST /api/quotes`)**: Verified public endpoint with Zod validation, rate limiting, and honeypot spam protection. Uses `createAdminClient()` on the server to insert guest quotation records. Does not require login.
- **Catalogue & PDP**: Fully public browsing.

---

## 3. Database Schema & Authority Verification

### A. Comparison: `admin_profiles` vs `admin_users`

| Criterion | `admin_profiles` (Authoritative) | `admin_users` (Legacy / Auxiliary) |
|---|---|---|
| **Primary Key** | `id uuid DEFAULT gen_random_uuid()` | `id uuid DEFAULT gen_random_uuid()` |
| **Identity Reference** | `user_id uuid NOT NULL` | `clerk_user_id text NOT NULL` |
| **Foreign Key to Auth** | **YES**: `REFERENCES auth.users(id) ON DELETE CASCADE` | **NO**: Unlinked text field |
| **Role Type** | `public.admin_role` enum (`'super_admin'`, `'admin'`, `'manager'`, `'staff'`) | `text` with check constraint |
| **Active Status** | `is_active boolean NOT NULL DEFAULT false` | `is_active boolean DEFAULT true` |
| **Approval Tracking** | `approved_by uuid REFERENCES auth.users(id)`, `approved_at timestamptz` | None |
| **Profile Metadata** | `display_name text`, `avatar_url text` | `full_name text`, `email text`, `last_login_at` |
| **Database Constraints** | `UNIQUE (user_id)` | `UNIQUE (clerk_user_id)` |
| **Database Indexes** | 6 indexes covering `user_id`, `role`, `is_active`, `approved_by` | 4 indexes covering `clerk_user_id`, `role`, `is_active` |
| **Foreign Keys Referencing It** | `banners.created_by REFERENCES admin_profiles(id)` | None |
| **PostgreSQL RLS Functions** | Used by `public.get_my_admin_role()` in 11+ RLS policies | None |
| **Current Live Records** | **1 record**: `user_id = 4a5ce04a-b673-4423-bcb5-a4f5f97e6a54` (super_admin, active) | **1 record**: `clerk_user_id = user_3818lIKckYFWLCLthzCyV8FPinl` |

### B. Structural Decision

* **Authoritative Administrator Entity**: `public.admin_profiles` is selected as the sole, authoritative admin entity for Supabase Auth migration.
* **Database Preservation**: Neither table will be dropped or modified. `admin_users` will remain in place to comply with Rule 8 ("Preserve existing customer and order data; do not delete tables or records").

---

## 4. Existing Administrator Account Status

Live database queries performed during Phase A confirm:

1. **Supabase Auth Account**:
   - `id`: `4a5ce04a-b673-4423-bcb5-a4f5f97e6a54`
   - `email`: `cedarelevatorsindustries@gmail.com`
   - `email_confirmed`: `true`
   - `last_sign_in_at`: `2026-03-23 13:23:10 UTC`
2. **Linked Admin Profile**:
   - `admin_profiles.id`: `5831ee83-6597-4116-9d85-389363e60e00`
   - `role`: `super_admin`
   - `is_active`: `true`
   - `display_name`: `Sathya`
3. **Onboarding Requirements for Existing Administrator**:
   - **Account Creation**: NOT REQUIRED (account already exists in `auth.users`).
   - **Role Assignment**: NOT REQUIRED (already `super_admin` in `admin_profiles`).
   - **Authentication**: The administrator can log in directly at `/admin/login` using `cedarelevatorsindustries@gmail.com`.
   - **Password Access**: If the administrator remembers the Supabase Auth password set during initial onboarding, login is immediate. If password reset is needed, the existing recovery mechanism (`/admin/recover` with recovery key) or the standard Supabase Auth password reset flow will be used.

---

## 5. Audit of Admin API Routes (30 Endpoints)

Inspection of all 30 route files in `src/app/api/admin/` reveals current authorization coverage:

| Category | Count | Route Paths | Current Status | Remediation Required |
|---|---|---|---|---|
| **Using `requireAdmin()`** | 7 | `analytics`, `business-verifications`, `categories`, `customers`, `elevator-types`, `inventory`, `products`, `stats` | Checked Clerk `clerk_user_id` | Update to new Supabase Auth `requireAdmin()` |
| **Direct Clerk Auth** | 7 | `business-verifications/[id]`, `elevator-types/[id]`, `elevator-types/[id]/products`, `export/products`, `import/products`, `inventory/low-stock`, `inventory/stats` | Directly imported `@clerk/nextjs` | Replace with new Supabase Auth `requireAdmin()` |
| **Supabase SSR Auth** | 4 | `filter-attributes`, `filter-attributes/[id]`, `orders`, `orders/stats` | Checked `getUser()` without role verification | Upgrade to new `requireAdmin('admin')` |
| **Dual/Email Fallback** | 1 | `current-role` | Looked up admin by email | Upgrade to Supabase Auth UUID + `admin_profiles` |
| **Unguarded Endpoints** | 11 | `activity-log`, `analytics/customers`, `analytics/products`, `analytics/sales`, `products/import/execute`, `products/import/preview`, `products/import/template`, `reports/generate`, `templates/[type]`, `update-collections-location` | **No authorization check** | Add `requireAdmin(minRole)` before any execution |

---

## 6. Service-Role Client Classification (54 Files)

The 54 files referencing `createAdminClient()` have been categorized into verified operational boundaries:

1. **Public Reads (No Admin Auth Needed)**:
   - `src/lib/services/categories.ts`, `src/lib/services/pickup-locations.ts`, `src/lib/data/applications-server.ts`.
2. **Public Guest Enquiries (Protected by Zod & Rate Limit)**:
   - `src/app/api/quotes/route.ts` (guest quotes persist via server service-role).
3. **Customer Operations (Protected by Clerk)**:
   - `src/app/api/account/delete/route.ts`, `src/app/api/addresses/default/route.ts`, `src/lib/actions/cart.ts`, `src/lib/actions/checkout/create-order.ts`, `src/lib/services/auth-sync.ts`.
4. **Admin Operations (Must Enforce Supabase Auth `requireAdmin()`)**:
   - 10 Admin API routes using service-role.
   - Admin CMS actions (`admin-cms.ts`, `policies-cms.ts`, `warranty-cms.ts`, `why-choose-cms.ts`).
   - Admin quote actions (`quote-management.ts`, `quote-pricing.ts`, `quote-status.ts`, `quote-audit.ts`).
   - Admin customer management (`notes.ts`, `verification.ts`).
   - Admin inventory & product mutations (`products/mutations.ts`, `inventory/actions.ts`).

---

## 7. Files Requiring Modification

### Core Authentication Infrastructure
1. `src/lib/auth/require-admin.ts` - Rewrite to use `createServerSupabase()`, `auth.getUser()`, and `admin_profiles` lookup by UUID.
2. `src/lib/auth/admin-roles.ts` - Update `getCurrentAdminUser()`, `getCurrentAdminRole()`, and `hasRole()` to use the Supabase Auth UUID and `admin_profiles`.
3. `src/proxy.ts` - Remove Clerk `auth.protect()` from `/admin(.*)`. Implement Supabase SSR cookie verification for `/admin/*` routes while maintaining Clerk middleware for customer routes.

### Admin Dashboard Layout & Pages
4. `src/app/admin/(dashboard)/layout.tsx` - Enhance client/server auth check to verify `admin_profiles.is_active` and redirect unauthenticated/unauthorized users to `/admin/login`.
5. `src/app/admin/(auth)/login/page.tsx` - Verify redirect destination and ensure clean session persistence.
6. `src/app/admin/(auth)/logout/page.tsx` - Confirm session termination via `supabase.auth.signOut()` and redirection to `/admin/login`.

### Admin API Routes (30 files)
7. All 30 routes under `src/app/api/admin/` - Secure with `await requireAdmin(requiredRole)`.

### Admin Server Actions
8. `src/lib/actions/admin-quotes/quote-status.ts` - Remove `admin_users` table query; use `admin_profiles` and Supabase UUID.
9. `src/lib/actions/admin-quotes/quote-management.ts` - Update admin identifier references from Clerk to Supabase UUID.
10. `src/lib/actions/admin-quotes/quote-conversion.ts` - Ensure admin conversion records use Supabase admin identity.

---

## 8. Potential Breaking Changes & Mitigations

| Potential Risk | Severity | Mitigation Strategy |
|---|---|---|
| Admin locked out after proxy change | High | Supabase Auth account and `admin_profiles` record already verified in production database. Test login immediately in isolated browser/session. |
| Customer store authentication broken | High | Clerk middleware is retained for all customer storefront and account routes in `src/proxy.ts`. No customer-facing auth hooks or components will be touched. |
| Customer Clerk session accessing admin | Medium | `src/proxy.ts` and `requireAdmin()` explicitly check Supabase Auth session and `admin_profiles`. Clerk session cookies provide zero admin privileges. |
| Unguarded admin routes exposed | Medium | All 30 admin API routes will be gated with `requireAdmin()`. |
| Production database schema conflicts | None | No DDL migrations or schema alterations required. `admin_profiles` already matches requirements perfectly. |

---

## 9. Recommended Implementation Sequence

Following user approval, implementation will proceed through the remaining phases:

1. **Phase B - Centralized Authorization (`src/lib/auth/require-admin.ts` & `admin-roles.ts`)**:
   - Implement Supabase SSR `auth.getUser()` + `admin_profiles` lookup by UUID.
   - Enforce role hierarchy: `staff` (1) < `manager` (2) < `admin` (3) < `super_admin` (4).
   - Return strongly-typed `AdminProfileRecord`.
2. **Phase C - Admin Login & Session Flow**:
   - Verify `/admin/login`, `/admin/logout`, and `/admin/recover`.
   - Ensure secure cookie session persistence via `@supabase/ssr`.
3. **Phase D - Secure Admin Dashboard & All 30 API Routes**:
   - Apply `requireAdmin(minRole)` to all 30 admin API routes and admin server actions.
4. **Phase E - Proxy Configuration (`src/proxy.ts`)**:
   - Configure proxy to verify Supabase Auth cookie session on `/admin/*` (except auth bypass routes).
   - Retain Clerk middleware exclusively for customer and dormant commerce routes.
5. **Phase F - Eliminate Clerk Admin References**:
   - Remove any residual Clerk checks from admin pages and actions.
   - Verify zero Clerk fallback remains in admin paths.
6. **Phase G - Verification & Validation Suite**:
   - Test authentication, unauthorized access rejection (401/403), role hierarchy, customer regression (Clerk customer login & guest quotes), and Next.js production build (`tsc`, `lint`, `build`).

---

## 10. Approval Checkpoint

In accordance with Phase A guidelines (Section 10), **no production code or database changes have been made**.

Please review this assessment and provide approval to proceed with Phase B (Centralized Supabase Auth Authorization Implementation).
