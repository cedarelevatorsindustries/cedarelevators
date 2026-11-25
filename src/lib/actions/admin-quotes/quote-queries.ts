'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { Quote, QuoteStatus, QuoteStats, QuotePriority, QuoteAuditLog } from '@/types/b2b/quote'

export interface AdminQuoteFilters {
  status: QuoteStatus | 'all'
  priority?: QuotePriority | 'all'
  user_type?: 'all' | 'guest' | 'individual' | 'business' | 'verified'
  request_type?: 'all' | 'general' | 'single' | 'bulk'
  date_range: 'today' | 'last_7_days' | 'last_30_days' | 'last_90_days' | 'all'
  search: string
  sort?: 'newest' | 'oldest' | 'highest_total'
  page?: number
  pageSize?: number
}

export async function getAdminQuotes(filters: AdminQuoteFilters): Promise<
  | { success: true; quotes: Quote[]; total: number; page: number; pageSize: number }
  | { success: false; error: string }
> {
  try {
    const authCheck = await requireAdmin('staff')
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error }
    }

    const supabase = createAdminClient()
    const page = Math.max(1, filters.page || 1)
    const pageSize = Math.min(100, Math.max(5, filters.pageSize || 20))
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const sortColumn = filters.sort === 'highest_total' ? 'estimated_total' : 'created_at'
    const ascending = filters.sort === 'oldest'

    let query = supabase
      .from('quotes')
      .select(
        `
        *,
        items:quote_items(*),
        attachments:quote_attachments(*)
      `,
        { count: 'exact' }
      )
      .order(sortColumn, { ascending, nullsFirst: false })

    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'quoted') {
        query = query.in('status', ['quoted', 'approved'])
      } else if (filters.status === 'submitted') {
        query = query.in('status', ['submitted', 'pending'])
      } else {
        query = query.eq('status', filters.status)
      }
    }

    if (filters.priority && filters.priority !== 'all') {
      query = query.eq('priority', filters.priority)
    }

    if (filters.user_type && filters.user_type !== 'all') {
      query = query.eq('account_type', filters.user_type)
    }

    if (filters.request_type && filters.request_type !== 'all') {
      query = query.eq('request_type', filters.request_type)
    }

    if (filters.date_range && filters.date_range !== 'all') {
      const now = new Date()
      let startDate: Date
      switch (filters.date_range) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'last_7_days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'last_30_days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case 'last_90_days':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = new Date(0)
      }
      query = query.gte('created_at', startDate.toISOString())
    }

    if (filters.search && filters.search.trim()) {
      const safeSearch = filters.search.trim().replace(/[,%()]/g, '')
      if (safeSearch) {
        query = query.or(
          `quote_number.ilike.%${safeSearch}%,guest_email.ilike.%${safeSearch}%,requester_email.ilike.%${safeSearch}%,guest_name.ilike.%${safeSearch}%,requester_name.ilike.%${safeSearch}%,company_name.ilike.%${safeSearch}%`
        )
      }
    }

    const { data: quotes, count, error } = await query.range(from, to)

    if (error) {
      console.error('Error fetching admin quotes:', error)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      quotes: (quotes || []) as Quote[],
      total: count || 0,
      page,
      pageSize,
    }
  } catch (error: any) {
    console.error('Error in getAdminQuotes:', error)
    return { success: false, error: error.message || 'Failed to fetch quotes' }
  }
}

export async function getAdminQuoteById(quoteId: string): Promise<
  | {
      success: true
      quote: Quote | null
      taxConfig?: { gst_enabled: boolean; default_gst_percentage: number; store_gstin?: string | null }
      storeConfig?: { store_name: string; gst_number?: string | null; support_email?: string | null; default_quote_validity_days?: number | null; quote_terms_and_conditions?: string | null }
    }
  | { success: false; error: string }
> {
  try {
    const authCheck = await requireAdmin('staff')
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error }
    }

    const supabase = createAdminClient()

    const [{ data: quote, error }, { data: revisions }, { data: notifications }, { data: taxSettings }, { data: storeSettings }] =
      await Promise.all([
        supabase
          .from('quotes')
          .select(
            `
            *,
            items:quote_items(*),
            attachments:quote_attachments(*)
          `
          )
          .eq('id', quoteId)
          .single(),
        supabase
          .from('quote_revisions')
          .select('*')
          .eq('quote_id', quoteId)
          .order('revision_number', { ascending: false }),
        supabase
          .from('quote_notifications')
          .select('*')
          .eq('quote_id', quoteId)
          .order('created_at', { ascending: false }),
        supabase.from('tax_settings').select('*').limit(1).maybeSingle(),
        supabase
          .from('store_settings')
          .select('store_name, gst_number, support_email, default_quote_validity_days, quote_terms_and_conditions')
          .limit(1)
          .maybeSingle(),
      ])

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: true, quote: null }
      }
      console.error('Error fetching quote:', error)
      return { success: false, error: error.message }
    }

    const enrichedQuote: Quote = {
      ...(quote as Quote),
      revisions: (revisions || []) as any[],
      notifications: (notifications || []) as any[],
    }

    return {
      success: true,
      quote: enrichedQuote,
      taxConfig: taxSettings
        ? {
            gst_enabled: Boolean(taxSettings.gst_enabled),
            default_gst_percentage: Number(taxSettings.default_gst_percentage || 0),
            store_gstin: taxSettings.store_gstin || null,
          }
        : undefined,
      storeConfig: storeSettings
        ? {
            store_name: storeSettings.store_name,
            gst_number: storeSettings.gst_number,
            support_email: storeSettings.support_email,
            default_quote_validity_days: storeSettings.default_quote_validity_days,
            quote_terms_and_conditions: storeSettings.quote_terms_and_conditions,
          }
        : undefined,
    }
  } catch (error: any) {
    console.error('Error in getAdminQuoteById:', error)
    return { success: false, error: error.message || 'Failed to fetch quote' }
  }
}

export async function getAdminQuoteStats(): Promise<
  | { success: true; stats: QuoteStats & { reviewing_count: number; business_count: number } }
  | { success: false; error: string }
> {
  try {
    const authCheck = await requireAdmin('staff')
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error }
    }

    const supabase = createAdminClient()
    const { data: quotes, error } = await supabase
      .from('quotes')
      .select('status, account_type, estimated_total')

    if (error) {
      return { success: false, error: error.message }
    }

    const stats = {
      total_quotes: quotes.length,
      active_quotes: quotes.filter((q) =>
        ['pending', 'submitted', 'reviewing', 'quoted', 'approved'].includes(q.status)
      ).length,
      total_value: quotes.reduce((sum, q) => sum + (Number(q.estimated_total) || 0), 0),
      pending_count: quotes.filter((q) => ['pending', 'submitted'].includes(q.status)).length,
      accepted_count: quotes.filter((q) => ['quoted', 'approved'].includes(q.status)).length,
      reviewing_count: quotes.filter((q) => q.status === 'reviewing').length,
      business_count: quotes.filter((q) => ['business', 'verified'].includes(q.account_type)).length,
    }

    return { success: true, stats }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch stats' }
  }
}

export async function getQuoteAuditLog(quoteId: string): Promise<
  | { success: true; logs: QuoteAuditLog[] }
  | { success: false; error: string }
> {
  try {
    const authCheck = await requireAdmin('staff')
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error }
    }

    const supabase = createAdminClient()
    const { data: logs, error } = await supabase
      .from('quote_audit_log')
      .select('*')
      .eq('quote_id', quoteId)
      .order('created_at', { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, logs: (logs || []) as QuoteAuditLog[] }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch audit log' }
  }
}
