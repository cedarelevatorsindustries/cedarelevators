import { createAdminClient } from '@/lib/supabase/server'
import {
  sendQuoteSubmissionConfirmationEmail,
  sendAdminNewQuoteAlertEmail,
  sendQuoteIssuedEmail,
  sendQuoteRejectedEmail,
} from './email'
import { getAppBaseUrl, issueAccessTokenForQuote } from '@/lib/auth/guest-quote-auth'
import { formatINR } from '@/lib/utils/quote-pricing'

export type NotificationEventType =
  | 'customer_submission_confirmation'
  | 'admin_new_quote_alert'
  | 'customer_quote_issued'
  | 'customer_quote_rejected'

interface DispatchParams {
  quoteId: string
  revisionNumber?: number | null
  eventType: NotificationEventType
  recipientEmail: string
  subject: string
  dedupeKey: string
  payload: Record<string, any>
  sendFn: () => Promise<{ success: boolean; messageId?: string; error?: string }>
}

export async function getVerifiedCompanyConfig() {
  const supabase = createAdminClient()
  const [{ data: storeSettings }, { data: taxSettings }] = await Promise.all([
    supabase.from('store_settings').select('*').limit(1).maybeSingle(),
    supabase.from('tax_settings').select('*').limit(1).maybeSingle(),
  ])

  const adminRecipient =
    storeSettings?.admin_notification_email?.trim() ||
    process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ||
    storeSettings?.support_email?.trim() ||
    null

  return {
    storeSettings,
    taxSettings,
    adminRecipient,
  }
}

/**
 * Outbox dispatcher with deduplication, attempt tracking, error persistence, and audit logging.
 * Never throws to block primary DB transaction completion.
 */
export async function dispatchQuoteNotification(params: DispatchParams): Promise<{
  success: boolean
  notificationId?: string
  skipped?: boolean
  error?: string
}> {
  const supabase = createAdminClient()

  try {
    // 1. Dedupe check (prevent duplicate sends on double-clicks / retries)
    const { data: existing } = await supabase
      .from('quote_notifications')
      .select('id, status, attempts')
      .eq('dedupe_key', params.dedupeKey)
      .maybeSingle()

    if (existing?.status === 'sent') {
      return { success: true, notificationId: existing.id, skipped: true }
    }

    let notificationId = existing?.id
    const nextAttempts = (existing?.attempts || 0) + 1

    if (!notificationId) {
      const { data: created, error: insertError } = await supabase
        .from('quote_notifications')
        .insert({
          quote_id: params.quoteId,
          revision_number: params.revisionNumber ?? null,
          event_type: params.eventType,
          recipient_email: params.recipientEmail,
          subject: params.subject,
          status: 'pending',
          attempts: nextAttempts,
          payload: params.payload,
          dedupe_key: params.dedupeKey,
        })
        .select('id')
        .single()

      if (insertError) {
        console.error('[QuoteNotifications] Outbox insert failed:', insertError)
        return { success: false, error: insertError.message }
      }
      notificationId = created.id
    } else {
      await supabase
        .from('quote_notifications')
        .update({
          attempts: nextAttempts,
          updated_at: new Date().toISOString(),
        })
        .eq('id', notificationId)
    }

    // 2. Audit attempt
    await supabase.from('quote_audit_log').insert({
      quote_id: params.quoteId,
      action_type: 'email_attempted',
      actor_type: 'system',
      notes: `Attempting ${params.eventType} email to ${params.recipientEmail}`,
      metadata: {
        notification_id: notificationId,
        event_type: params.eventType,
        attempt: nextAttempts,
      },
    })

    // 3. Execute email delivery
    const sendResult = await params.sendFn()

    if (sendResult.success) {
      await supabase
        .from('quote_notifications')
        .update({
          status: 'sent',
          provider_message_id: sendResult.messageId || null,
          last_error: null,
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', notificationId)

      await supabase.from('quote_audit_log').insert({
        quote_id: params.quoteId,
        action_type: 'email_sent',
        actor_type: 'system',
        notes: `Sent ${params.eventType} email to ${params.recipientEmail}`,
        metadata: {
          notification_id: notificationId,
          event_type: params.eventType,
          message_id: sendResult.messageId || null,
        },
      })

      return { success: true, notificationId }
    } else {
      const errorMsg = sendResult.error || 'Email delivery failed'
      await supabase
        .from('quote_notifications')
        .update({
          status: 'failed',
          last_error: errorMsg,
          updated_at: new Date().toISOString(),
        })
        .eq('id', notificationId)

      await supabase.from('quote_audit_log').insert({
        quote_id: params.quoteId,
        action_type: 'email_failed',
        actor_type: 'system',
        notes: `Failed ${params.eventType} email: ${errorMsg}`,
        metadata: {
          notification_id: notificationId,
          event_type: params.eventType,
          error: errorMsg,
        },
      })

      return { success: false, notificationId, error: errorMsg }
    }
  } catch (err: any) {
    console.error('[QuoteNotifications] Unexpected error:', err)
    return { success: false, error: err.message || 'Notification dispatch failed' }
  }
}

/**
 * Safely retries a failed notification from admin workspace.
 * Generates fresh view/PDF URLs on retry without ever creating duplicate quotes or revisions.
 */
export async function retryQuoteNotificationById(notificationId: string): Promise<{
  success: boolean
  error?: string
}> {
  const supabase = createAdminClient()

  const { data: notif, error } = await supabase
    .from('quote_notifications')
    .select('*')
    .eq('id', notificationId)
    .single()

  if (error || !notif) {
    return { success: false, error: 'Notification record not found' }
  }

  if (notif.status === 'sent') {
    return { success: true }
  }

  const { data: quote } = await supabase
    .from('quotes')
    .select('*, items:quote_items(*)')
    .eq('id', notif.quote_id)
    .single()

  if (!quote) {
    return { success: false, error: 'Associated quote not found' }
  }

  const { storeSettings, adminRecipient } = await getVerifiedCompanyConfig()
  const baseUrl = getAppBaseUrl()

  let sendFn: () => Promise<{ success: boolean; messageId?: string; error?: string }>

  if (notif.event_type === 'customer_submission_confirmation') {
    const rawToken = await issueAccessTokenForQuote(quote.id)
    sendFn = () =>
      sendQuoteSubmissionConfirmationEmail(notif.recipient_email, {
        quoteNumber: quote.quote_number,
        customerName: quote.requester_name || quote.guest_name || 'Customer',
        companyName: quote.company_name,
        submittedDate: new Date(quote.created_at).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        requestType: (quote.request_type as any) || 'general',
        items: (quote.items || []).map((i: any) => ({
          product_name: i.product_name,
          variant_title: i.variant_title,
          quantity: i.quantity,
        })),
        viewUrl: `${baseUrl}/quotes/view/${rawToken}`,
        trackUrl: `${baseUrl}/quotes/track`,
        supportEmail: storeSettings?.support_email,
        supportPhone: storeSettings?.support_phone,
      })
  } else if (notif.event_type === 'admin_new_quote_alert') {
    const recipient = notif.recipient_email || adminRecipient
    if (!recipient) {
      return { success: false, error: 'No admin notification email configured' }
    }
    const adminBaseUrl =
      process.env.NEXT_PUBLIC_ADMIN_URL?.replace(/\/+$/, '') || `${baseUrl}/admin`
    sendFn = () =>
      sendAdminNewQuoteAlertEmail(recipient, {
        quoteId: quote.id,
        quoteNumber: quote.quote_number,
        customerName: quote.requester_name || quote.guest_name || 'Customer',
        companyName: quote.company_name,
        email: quote.requester_email || quote.guest_email || '',
        phone: quote.requester_phone || quote.guest_phone || '',
        requestType: (quote.request_type as any) || 'general',
        itemsCount: (quote.items || []).length,
        submittedDate: new Date(quote.created_at).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        adminQuoteUrl: `${adminBaseUrl}/quotes/${quote.id}`,
      })
  } else if (notif.event_type === 'customer_quote_issued') {
    const rawToken = await issueAccessTokenForQuote(quote.id)
    const revNum = notif.revision_number || quote.current_revision || 1
    sendFn = () =>
      sendQuoteIssuedEmail(notif.recipient_email, {
        quoteNumber: quote.quote_number,
        revisionNumber: revNum,
        customerName: quote.requester_name || quote.guest_name || 'Customer',
        issuedDate: new Date(quote.issued_at || quote.updated_at).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        validUntil: quote.valid_until
          ? new Date(quote.valid_until).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : '30 days from issue',
        grandTotalFormatted: formatINR(quote.estimated_total),
        adminMessage: quote.admin_response_message,
        viewUrl: `${baseUrl}/quotes/view/${rawToken}`,
        pdfUrl: `${baseUrl}/api/quotes/view/${rawToken}/pdf`,
        supportEmail: storeSettings?.support_email,
        supportPhone: storeSettings?.support_phone,
      })
  } else {
    sendFn = async () => {
      const res = await sendQuoteRejectedEmail(notif.recipient_email, {
        quoteNumber: quote.quote_number,
        customerName: quote.requester_name || quote.guest_name || 'Customer',
        reason: quote.rejected_reason || 'Unable to fulfil this quotation request at this time.',
      })
      return { success: res.success, error: res.error }
    }
  }

  const res = await dispatchQuoteNotification({
    quoteId: quote.id,
    revisionNumber: notif.revision_number,
    eventType: notif.event_type,
    recipientEmail: notif.recipient_email,
    subject: notif.subject,
    dedupeKey: notif.dedupe_key || `${notif.event_type}:${quote.id}:${notif.id}`,
    payload: notif.payload || {},
    sendFn,
  })

  return { success: res.success, error: res.error }
}
