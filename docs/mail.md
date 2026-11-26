# Cedar Elevators — Resend Mailing Service Documentation

## 1. Overview

Cedar Elevators uses **Resend** (`resend` SDK in `src/lib/services/email.ts`) combined with an idempotent PostgreSQL outbox (`public.quote_notifications`, dispatched via `src/lib/services/quote-notifications.ts`) for all transactional quotation and tracking emails.

---

## 2. Verified Domain & Sender Configuration

- **Resend Account Domain Verified:** `updates.cedarelevators.in`
- **Configured Sender (`RESEND_FROM_EMAIL`):** `Cedar Elevators <noreply@updates.cedarelevators.in>`
- **Default Code Fallback (`src/lib/services/email.ts`):** `Cedar Elevators <noreply@updates.cedarelevators.in>`
- **API Key Environment Variable:** `RESEND_API_KEY` (stored strictly in `.env` / hosting secret manager — never committed to source control or documentation)
- **Admin Notification Recipient Precedence (`getVerifiedCompanyConfig()`):**
  1. `store_settings.admin_notification_email`
  2. `process.env.ADMIN_NOTIFICATION_EMAIL`
  3. `store_settings.support_email` (currently `support@cedarelevator.com`)

> [!IMPORTANT]
> Emails must be sent from an address on the verified `updates.cedarelevators.in` subdomain (e.g. `noreply@updates.cedarelevators.in`). Sending from unverified root domain addresses such as `@cedarelevators.in` is rejected by Resend.

---

## 3. Supported Transactional Email Workflows

| Event Type (`quote_notifications.event_type`) | Trigger | Recipient | Implementation |
| :--- | :--- | :--- | :--- |
| `customer_submission_confirmation` | Customer submits `/quotes/new` | Customer email | `sendQuoteSubmissionConfirmationEmail()` |
| `admin_new_quote_alert` | New quotation created | Admin recipient | `sendAdminNewQuoteAlertEmail()` |
| `customer_quote_issued` | Admin clicks **Issue & Send Quotation** | Customer email | `sendQuoteIssuedEmail()` |
| `customer_quote_rejected` | Admin clicks **Reject Request** | Customer email | `sendQuoteRejectedEmail()` |
| Guest Tracking OTP | Customer requests verification on `/quotes/track` | Guest email | `sendGuestOtpEmail()` |

---

## 4. Reliability, Outbox & Error Handling

1. **Non-blocking Quote Persistence:** Database creation (`create_quote_atomic`) commits before notifications dispatch. An email provider failure never rolls back or duplicates a saved quotation.
2. **Delivery Truthfulness (`emailStatus`):**
   - `dispatchQuoteNotification()` logs `email_attempted` -> `email_sent` (with `provider_message_id` and `sent_at`) or `email_failed` (with `last_error`) into both `quote_notifications` and `quote_audit_log`.
   - `POST /api/quotes` returns `emailStatus: 'sent' | 'failed'` so `/quotes/success` informs the customer accurately without hiding delivery issues.
3. **Deduplication & Retries:**
   - Outbox `dedupe_key` (`eventType:quoteId[:rev:N]`) prevents duplicate emails on retries or idempotent resubmissions.
   - Administrators can retry any `failed` notification cleanly from `/admin/quotes/[id]` (`retryQuoteNotification` -> `retryQuoteNotificationById`), which mints a fresh customer access token when needed without creating duplicate revisions.

---

## 5. Verification Status (Observed 2026-11-26)

- **Customer Submission Confirmation (`delivered@resend.dev`):** Verified `201 Created`, `emailStatus: "sent"`, `quote_notifications.status = "sent"`, Resend `provider_message_id: 01a21825-abc3-7291-a486-84a95eb9ca19`.
- **Guest OTP Verification Email (`delivered@resend.dev`):** Verified `POST /api/quotes/track/request-code` returned `200 OK` via Resend.
- **Note on Domain Typo in Store Settings:** `store_settings.support_email` is currently `support@cedarelevator.com` (missing `s`) and `store_settings.admin_notification_email` is `null`; verify whether admin quotation alerts should go to `support@cedarelevator.com` or an updated `@cedarelevators.in` inbox in Admin Store Settings (`/admin/settings/store`).
