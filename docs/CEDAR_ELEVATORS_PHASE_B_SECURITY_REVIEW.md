# Cedar Elevators - Phase B Security Review
## Centralized Supabase Admin Authorization

**Date:** November 21, 2026  
**Auditor:** Senior Next.js Architect & Application Security Specialist  
**Target Files:**
- `src/lib/auth/require-admin.ts`
- `src/lib/auth/admin-roles.ts`
- `src/lib/supabase/server.ts`
- All consumers of `requireAdmin()`, `getCurrentAdminUser()`, `hasRole()`, and `getCurrentAdminRole()`  
**Verdict:** **PASS** (Ready for Phase C upon approval)

---

## 1. Executive Summary

Phase B replaced the legacy dual-authentication and Clerk-based admin authorization with a unified, server-side Supabase Auth verification engine. 

A rigorous, read-only security inspection was conducted across all critical checks:
- **No Clerk dependencies** remain in `require-admin.ts` or `admin-roles.ts`.
- **No email-based fallbacks** exist.
- Authentication relies strictly on `supabase.auth.getUser()`.
- Authorization relies strictly on the cryptographically validated Supabase UUID querying `public.admin_profiles`.
- Role hierarchy (`super_admin` > `admin` > `manager` > `staff`) and `is_active` status are strictly enforced.
- All failure branches unconditionally deny access (`401` or `403`).

### Root Cause of the User's Screenshot (`localhost:3000/admin` redirecting to Clerk)
When navigating directly to `http://localhost:3000/admin`, the browser was redirected to Clerk (`brave-marmoset-75.accounts.dev`).
* **Why**: The proxy entry point (`src/proxy.ts`) still contains Clerk's `clerkMiddleware(auth => auth.protect())` for `/admin(.*)`. In accordance with the strict Phase B boundaries ("Stop after Phase B. Do not automatically proceed to Phases C–G"), `src/proxy.ts` was deliberately left untouched until Phase E.
* **How to open the admin panel right now**: Direct navigation to **`http://localhost:3000/admin/login`** bypasses Clerk (`isAdminAuthBypass` in `src/proxy.ts`) and renders the native Supabase Admin login screen.
* **Phase E resolution**: Once Phase E is implemented, `src/proxy.ts` will redirect unauthenticated requests directly to `/admin/login` instead of Clerk.

---

## 2. Detailed Security Audit Findings

### A. RLS and Fallback Behavior

```
[Incoming Request]
        │
        ▼
[supabase.auth.getUser()] ── (authError / !user) ──► 401 Unauthorized
        │
   (Valid user.id)
        │
        ▼
[Query public.admin_profiles WHERE user_id = user.id via SSR client]
        │
        ├─► Success: profile retrieved ─────────────────────────┐
        │                                                        │
        └─► RLS / Permission Error                               │
                  │                                              │
                  ▼                                              │
            [Query public.admin_profiles via service-role        │
             strictly WHERE user_id = user.id]                   │
                  │                                              │
                  ├─► Database error ──► 500 Internal Error      │
                  └─► Profile retrieved ─────────────────────────┤
                                                                 ▼
                                                  [Is profile null?] ──► 403 Forbidden
                                                                 │
                                                  [Is is_active false?] ──► 403 Forbidden
                                                                 │
                                                  [Insufficient Role?] ──► 403 Forbidden
                                                                 │
                                                                 ▼
                                                    200 Allow (AdminUserRecord)
```

1. **Query Execution**:
   - Primary: Queried via `createServerSupabase()` SSR client:
     ```ts
     // src/lib/auth/require-admin.ts (Lines 67-71)
     const { data: userProfile, error: profileError } = await supabase
       .from('admin_profiles')
       .select('id, user_id, role, is_active, display_name, avatar_url')
       .eq('user_id', user.id)
       .maybeSingle()
     ```
   - Respects database RLS policy: `CREATE POLICY "Users can read own admin profile" ON public.admin_profiles FOR SELECT TO authenticated USING ((auth.uid() = user_id))`.
2. **Handling of Query States**:
   - **No Record (`!profile`)**: Evaluates to `403 Forbidden` (`Forbidden: Admin privileges required`).
   - **Multiple Records**: Prevented at the database level by `CONSTRAINT unique_user_admin_profile UNIQUE (user_id)` and handled safely by `.maybeSingle()`.
   - **Database Error**: Returns `500 Internal authorization error`.
3. **RLS Anomaly Fallback**:
   - Located at `src/lib/auth/require-admin.ts` (Lines 73-95).
   - Only triggered if the SSR client returns an explicit `profileError`.
   - Uses `createAdminClient()` (service-role) strictly with `.eq('user_id', user.id)` using the server-verified `user.id`.
   - **Verification**: The fallback *cannot* authorize an arbitrary user. If `serviceProfile` is null, line 98 rejects with `403 Forbidden`. If `is_active` is false, line 107 rejects with `403 Forbidden`.
4. **Fail-Closed Principle**:
   - Every catch block and failure condition explicitly returns `{ authorized: false, ... }`. No code path defaults to authorization.

---

### B. Identity Verification

| Verification Vector | Implementation | Status |
|---|---|---|
| **Cryptographic Token Verification** | `await supabase.auth.getUser()` at line 54 of `require-admin.ts`. `getSession()` is NOT used. | **SECURE** |
| **Identity Reference** | Exclusively `user.id` (UUID generated by Supabase Auth). | **SECURE** |
| **Email-based Fallback** | Removed completely. No query or matching by `user.email` exists. | **SECURE** |
| **Clerk User IDs** | Removed from authorization checks. Clerk IDs cannot grant admin access. | **SECURE** |
| **Client Roles & Metadata** | Untrusted. Roles are read directly from `public.admin_profiles.role` in PostgreSQL. | **SECURE** |

---

### C. Role Enforcement & Hierarchy

1. **Role Hierarchy**:
   ```ts
   // src/lib/auth/require-admin.ts (Lines 9-14, 19-21)
   export const ROLE_HIERARCHY: Record<AdminRole, number> = {
     staff: 1,
     manager: 2,
     admin: 3,
     super_admin: 4,
   }

   export function hasRolePermission(userRole: AdminRole, requiredRole: AdminRole): boolean {
     return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 0)
   }
   ```
2. **Malformed or Unknown Roles**:
   - `ROLE_HIERARCHY[userRole] ?? 0` returns `0` for any unrecognized or missing role string.
   - Because all valid required roles are `>= 1`, any malformed role automatically fails comparison and returns `403 Forbidden`.
3. **Inactive Administrator Enforcement**:
   - Lines 107-113:
     ```ts
     if (!profile.is_active) {
       return {
         authorized: false,
         error: 'Forbidden: Administrator account is inactive',
         status: 403
       }
     }
     ```
   - Checked *before* role evaluation. Even a `super_admin` is unconditionally rejected if `is_active` is `false`.
4. **Permission Helpers Consolidation**:
   - In `src/lib/auth/admin-roles.ts`, `getCurrentAdminUser()` calls `requireAdmin('staff')`.
   - All helper functions (`getCurrentAdminRole()`, `hasRole()`, `canViewQuotes()`, `canPriceQuotes()`, `canApproveQuotes()`, etc.) directly inherit this authoritative check.

---

### D. Backward Compatibility & Consumer Audit

All consumers across the application were inspected:

1. **`AdminUserRecord` Typing**:
   ```ts
   // src/lib/auth/require-admin.ts (Lines 23-34)
   export interface AdminUserRecord {
     id: string              // Profile UUID (admin_profiles.id)
     user_id: string         // Supabase Auth UUID (auth.users.id)
     email: string           // Verified email from auth.users
     full_name: string | null// display_name
     display_name: string | null
     name?: string | null    // Compatibility alias
     clerk_user_id?: string  // Compatibility alias mapping to user_id
     role: AdminRole
     is_active: boolean
     avatar_url?: string | null
   }
   ```
2. **Audit & Log Compatibility**:
   - `src/lib/actions/inventory-adjustments.ts` (Line 135) accesses `adminUser.clerk_user_id` to log `adjusted_by`. It now safely logs the administrator's Supabase UUID.
   - `src/lib/actions/customers/notes.ts` (Lines 65-66) accesses `adminUser?.clerk_user_id` and `adminUser?.name`. It now safely stores the Supabase UUID and display name.
   - `clerk_user_id` is purely a passive output field on the returned record for backwards-compatible audit logging columns; it is **never** used as an authorization filter.
3. **API Route Handling**:
   - Consumers in `src/app/api/admin/` check `if (!adminCheck.authorized) return NextResponse.json(...)`.
   - None of the consumers interpret an authorization error as success.

---

### E. Test Coverage & Limitations

1. **Unit & Logic Testing**:
   - 16/16 role combinations tested and confirmed (`staff`, `manager`, `admin`, `super_admin`).
   - Unauthenticated scenario (`status: 401`): Verified.
   - Ordinary customer without admin profile (`status: 403`): Verified.
   - Inactive admin (`status: 403`): Verified.
   - Insufficient role permissions (`status: 403`): Verified for both Staff → Admin and Manager → Super Admin.
   - Authorized super admin (`status: 200`): Verified.
2. **Database Integration**:
   - Queried live production database table `admin_profiles` for user `4a5ce04a-b673-4423-bcb5-a4f5f97e6a54`.
   - Verified active status and full role permissions (`Staff=true`, `Manager=true`, `Admin=true`, `SuperAdmin=true`).
3. **Current Environment Limitation**:
   - Browser navigation to `/admin` still triggers Clerk middleware because `src/proxy.ts` is scheduled for modification in Phase E.
   - Navigating to `/admin/login` bypasses Clerk and renders the native Supabase Admin login screen.

---

## 3. Findings Summary

| ID | Category | Severity | Description | Status |
|---|---|---|---|---|
| **SEC-01** | Navigation | Medium | Direct navigation to `/admin` triggers Clerk middleware until Phase E updates `src/proxy.ts`. | Documented & scheduled for Phase E. Immediate workaround: use `/admin/login`. |
| **SEC-02** | Authorization | None | All core security checks (401/403, role hierarchy, active status, RLS fallback) in `require-admin.ts` verified secure. | **PASS** |
| **SEC-03** | Identity | None | Zero email matching or Clerk ID matching in admin authorization logic. Authenticated Supabase UUID is the sole identity key. | **PASS** |

---

## 4. Final Verdict

**OVERALL VERDICT: PASS**

The Phase B implementation is robust, adheres to all non-negotiable rules, does not touch database records, preserves customer Clerk authentication, and enforces strict server-side authorization.

Phase C (Admin Login & Session Management Migration) is ready to proceed upon approval.
