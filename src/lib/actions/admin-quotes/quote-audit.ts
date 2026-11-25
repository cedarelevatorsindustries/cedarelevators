'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { QuoteStatus, QuotePriority, QuoteActionType } from '@/types/b2b/quote'
import { getCurrentAdminUser } from '@/lib/auth/admin-roles'

export interface QuoteAuditEntry {
  id: string
  action_type: string
  actor_type?: string | null
  old_status: string | null
  new_status: string | null
  admin_name: string | null
  admin_role?: string | null
  notes: string | null
  metadata?: Record<string, any> | null
  created_at: string
}

export async function getQuoteAuditTimeline(
  quoteId: string
): Promise<{ success: boolean; entries?: QuoteAuditEntry[]; error?: string }> {
  try {
    const authCheck = await requireAdmin('staff')
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error }
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('quote_audit_log')
      .select('id, action_type, actor_type, old_status, new_status, admin_name, admin_role, notes, metadata, created_at')
      .eq('quote_id', quoteId)
      .order('created_at', { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, entries: (data || []) as QuoteAuditEntry[] }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch audit log' }
  }
}

/**
 * Checks if an issued quote ('quoted' or legacy 'approved') has passed valid_until and expires it idempotently.
 */
export async function checkAndExpireQuote(
  quoteId: string
): Promise<{ expired: boolean; error?: string }> {
  try {
    const supabase = createAdminClient()
    const { data: quote, error: fetchError } = await supabase
      .from('quotes')
      .select('id, status, valid_until')
      .eq('id', quoteId)
      .single()

    if (fetchError || !quote) {
      return { expired: false, error: 'Quote not found' }
    }

    if (!['quoted', 'approved'].includes(quote.status) || !quote.valid_until) {
      return { expired: false }
    }

    const now = new Date()
    const validUntil = new Date(quote.valid_until)

    if (now > validUntil) {
      const { error: updateError } = await supabase
        .from('quotes')
        .update({
          status: 'expired',
          expired_at: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq('id', quoteId)
        .in('status', ['quoted', 'approved'])

      if (updateError) {
        return { expired: false, error: updateError.message }
      }

      await supabase.from('quote_audit_log').insert({
        quote_id: quoteId,
        action_type: 'expired',
        actor_type: 'system',
        old_status: quote.status,
        new_status: 'expired',
        notes: 'Quotation expired automatically past valid_until date',
      })

      return { expired: true }
    }

    return { expired: false }
  } catch (error: any) {
    return { expired: false, error: error.message || 'Failed to check expiry' }
  }
}

/**
 * Bulk expire all past-due issued quotations (cron job safe & idempotent).
 */
export async function expireOverdueQuotes(): Promise<{ count: number; error?: string }> {
  try {
    const supabase = createAdminClient()
    const now = new Date().toISOString()

    const { data: overdueQuotes, error: fetchError } = await supabase
      .from('quotes')
      .select('id, status')
      .in('status', ['quoted', 'approved'])
      .not('valid_until', 'is', null)
      .lt('valid_until', now)

    if (fetchError) {
      return { count: 0, error: fetchError.message }
    }

    if (!overdueQuotes || overdueQuotes.length === 0) {
      return { count: 0 }
    }

    let expiredCount = 0
    for (const q of overdueQuotes) {
      const { data: updated } = await supabase
        .from('quotes')
        .update({
          status: 'expired',
          expired_at: now,
          updated_at: now,
        })
        .eq('id', q.id)
        .in('status', ['quoted', 'approved'])
        .select('id')

      if (updated && updated.length > 0) {
        expiredCount += 1
        await supabase.from('quote_audit_log').insert({
          quote_id: q.id,
          action_type: 'expired',
          actor_type: 'cron',
          old_status: q.status,
          new_status: 'expired',
          notes: 'Quotation expired automatically past valid_until date',
        })
      }
    }

    return { count: expiredCount }
  } catch (error: any) {
    console.error('Error in expireOverdueQuotes:', error)
    return { count: 0, error: error.message || 'Failed to expire quotes' }
  }
}

export async function logQuoteAction(
  quoteId: string,
  actionType: QuoteActionType,
  details: {
    actorType?: 'customer' | 'admin' | 'system' | 'cron'
    oldStatus?: QuoteStatus | string
    newStatus?: QuoteStatus | string
    oldPriority?: QuotePriority | string
    newPriority?: QuotePriority | string
    oldTotal?: number
    newTotal?: number
    notes?: string
    metadata?: Record<string, any>
  } = {}
): Promise<void> {
  try {
    const adminUser = details.actorType === 'system' || details.actorType === 'customer' ? null : await getCurrentAdminUser()
    const supabase = createAdminClient()

    await supabase.from('quote_audit_log').insert({
      quote_id: quoteId,
      action_type: actionType,
      actor_type: details.actorType || (adminUser ? 'admin' : 'system'),
      old_status: details.oldStatus || null,
      new_status: details.newStatus || null,
      old_priority: details.oldPriority || null,
      new_priority: details.newPriority || null,
      pricing_changed:
        details.oldTotal !== undefined &&
        details.newTotal !== undefined &&
        details.oldTotal !== details.newTotal,
      old_total: details.oldTotal ?? null,
      new_total: details.newTotal ?? null,
      admin_id: adminUser?.user_id || adminUser?.id || null,
      admin_name: adminUser?.full_name || adminUser?.display_name || adminUser?.email || null,
      admin_role: adminUser?.role || null,
      notes: details.notes || null,
      metadata: details.metadata || null,
    })
  } catch (error) {
    console.error('Error logging quote action:', error)
  }
}
