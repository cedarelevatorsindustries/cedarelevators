# Cedar Elevators — Quotation Security Review

**Date:** 2026-11-25  
**Scope:** RLS isolation, guest access tokens, OTP verification, session security, admin RBAC, private PDF storage, and input/pricing integrity.

---

## 1. RLS & Database Access Controls

| Table | Before Remediation | After Remediation | Verified |
|---|---|---|---|
| `quotes` | `{public}` SELECT/INSERT allowed `user_id IS NULL` (all guest PII leaked); admin policy trusted `jwt.user_metadata` | `{authenticated}` only (`is_admin()` or non-null `user_id = sub`); service role for server routes | **Verified** (PostgREST anon returns `0` rows) |
| `quote_items` | `{public}` SELECT & `{anon}` INSERT allowed for `quotes.user_id IS NULL` | `{anon}` INSERT blocked (`WITH CHECK (false)`); `{authenticated}` restricted to `is_admin()` or non-null owner | **Verified** (PostgREST anon returns `0` rows) |
| `quote_attachments` | `{public}` SELECT/INSERT allowed `user_id IS NULL` | `{authenticated}` restricted to `is_admin()` or non-null owner | **Verified** (PostgREST anon returns `0` rows) |
| `quote_audit_log` | RLS DISABLED (`relrowsecurity = false`) | RLS ENABLED; `service_role` + `authenticated` `is_admin()` only | **Verified** (PostgREST anon returns `0` rows) |
| `quote_counters` | RLS DISABLED | RLS ENABLED; `service_role` only | **Verified** (PostgREST anon returns `0` rows) |
| `quote_revisions`, `quote_notifications`, `quote_email_verifications`, `quote_guest_sessions` | Did not exist | RLS ENABLED at creation; `service_role` (+ `is_admin()` SELECT on revisions/notifications) | **Verified** (PostgREST anon returns `0` rows) |

---

## 2. Token, OTP, & Session Security Model

- **Individual Quote Access (`/quotes/view/[token]`):**
  - 32-byte CSPRNG raw token (`crypto.randomBytes(32).toString('base64url')`), emailed ONLY to the customer; database stores ONLY `SHA-256(token)` in `quotes.access_token_hash` with expiry (`access_token_expires_at`, 90 days) and revocation (`access_token_revoked_at`).
  - Access routes validate the token hash, check expiry/revocation, set a short-lived `HttpOnly; SameSite=Lax; Secure (prod)` session cookie scoped to that single `quote_id` where needed, and **never reveal pricing/totals/discounts before status is `quoted` (or legacy `approved`)**.
  - Explicitly scoped to a single quotation — possessing one quote link grants zero access to other quotes for the same email.
  - Note: A forwarded individual bearer link grants read access to that single quote until expired/revoked; consolidated history always requires fresh email OTP verification.

- **Guest History Authentication (`/quotes/track`):**
  - Uses 6-digit CSPRNG OTP (`crypto.randomInt(100000, 1000000)`), stored hashed via `SHA-256(normalizedEmail + ':' + code + ':' + pepper)` in `quote_email_verifications`.
  - 10-minute expiry, max 5 failed attempts before lockout, 60-second resend cooldown, IP + email rate limiting via Upstash Redis (with in-memory fallback).
  - Generic non-enumerating response for both known and unknown emails.
  - On verification, creates a 32-byte random session token hashed in `quote_guest_sessions`, stored in an `HttpOnly; SameSite=Lax; Secure (prod); Path=/` cookie (`cedar_guest_quote_session`, 24-hour expiry, revocable on logout).

- **Private PDF Storage:**
  - Issued PDFs are uploaded to private Supabase Storage bucket `quote-documents` (`public = false`).
  - Downloads are streamed through server-authorized routes (`/api/quotes/view/[token]/pdf` for verified quote token OR guest history session matching the quote's email; `/api/admin/quotes/[id]/pdf` for `requireAdmin('staff')`) after verifying ownership and status.

- **Admin Authorization:**
  - All admin quote server actions and routes verify Supabase Auth + active `admin_profiles` record via `requireAdmin(minRole)`:
    - Viewing quotes/notifications/PDFs: `'staff'`+
    - Reviewing, pricing, issuing/reissuing revisions, rejecting: `'manager'`+
    - Deleting quotes: `'admin'`+
  - Admin internal notes (`admin_internal_notes`) and `quote_audit_log` are explicitly stripped from all customer responses and PDFs.
