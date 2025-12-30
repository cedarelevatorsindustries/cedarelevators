'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Quote, QuoteStatus, QuoteStats, QuotePriority, QuoteAuditLog } from '@/types/b2b/quote'

export interface AdminQuoteFilters {
    status: QuoteStatus | 'all'
    priority: QuotePriority | 'all'
    user_type: 'all' | 'guest' | 'individual' | 'business' | 'verified'
    date_range: 'today' | 'last_7_days' | 'last_30_days' | 'all'
    search: string
}

/**
 * Get all quotes with filters (Admin)
 */
export async function getAdminQuotes(filters: AdminQuoteFilters): Promise<
    | { success: true; quotes: Quote[] }
    | { success: false; error: string }
> {
    try {
        const supabase = createServerSupabaseClient()
        if (!supabase) {
            return { success: false, error: 'Database connection failed' }
        }

        let query = supabase
            .from('quotes')
            .select(`
        *,
        items:quote_items(*),
        messages:quote_messages(*),
        attachments:quote_attachments(*)
      `)
            .order('created_at', { ascending: false })

        // Apply status filter
        if (filters.status && filters.status !== 'all') {
            query = query.eq('status', filters.status)
        }

        // Apply priority filter
        if (filters.priority && filters.priority !== 'all') {
            query = query.eq('priority', filters.priority)
        }

        // Apply user type filter
        if (filters.user_type && filters.user_type !== 'all') {
            query = query.eq('user_type', filters.user_type)
        }

        // Apply date range filter
        if (filters.date_range && filters.date_range !== 'all') {
            const now = new Date()
            let startDate: Date

            switch (filters.date_range) {
                case 'today':
                    startDate = new Date(now.setHours(0, 0, 0, 0))
                    break
                case 'last_7_days':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                    break
                case 'last_30_days':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                    break
                default:
                    startDate = new Date(0)
            }

            query = query.gte('created_at', startDate.toISOString())
        }

        // Apply search filter
        if (filters.search) {
            query = query.or(`quote_number.ilike.%${filters.search}%,guest_email.ilike.%${filters.search}%,guest_name.ilike.%${filters.search}%`)
        }

        const { data: quotes, error } = await query

        if (error) {
            console.error('Error fetching admin quotes:', error)
            return { success: false, error: error.message }
        }

        return { success: true, quotes: quotes as Quote[] }
    } catch (error: any) {
        console.error('Error in getAdminQuotes:', error)
        return { success: false, error: error.message || 'Failed to fetch quotes' }
    }
}

/**
 * Get single quote by ID (Admin)
 */
export async function getAdminQuoteById(quoteId: string): Promise<
    | { success: true; quote: Quote | null }
    | { success: false; error: string }
> {
    try {
        const supabase = createServerSupabaseClient()
        if (!supabase) {
            return { success: false, error: 'Database connection failed' }
        }

        const { data: quote, error } = await supabase
            .from('quotes')
            .select(`
        *,
        items:quote_items(*),
        messages:quote_messages(*),
        attachments:quote_attachments(*)
      `)
            .eq('id', quoteId)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return { success: true, quote: null }
            }
            console.error('Error fetching quote:', error)
            return { success: false, error: error.message }
        }

        return { success: true, quote: quote as Quote }
    } catch (error: any) {
        console.error('Error in getAdminQuoteById:', error)
        return { success: false, error: error.message || 'Failed to fetch quote' }
    }
}

/**
 * Get quote statistics (Admin)
 */
export async function getAdminQuoteStats(): Promise<
    | { success: true; stats: QuoteStats & { reviewing_count: number; business_count: number } }
    | { success: false; error: string }
> {
    try {
        const supabase = createServerSupabaseClient()
        if (!supabase) {
            return { success: false, error: 'Database connection failed' }
        }

        const { data: quotes, error } = await supabase
            .from('quotes')
            .select('status, user_type, estimated_total')

        if (error) {
            console.error('Error fetching quote stats:', error)
            return { success: false, error: error.message }
        }

        const stats = {
            total_quotes: quotes.length,
            active_quotes: quotes.filter(q => ['pending', 'reviewing', 'approved'].includes(q.status)).length,
            total_value: quotes.reduce((sum, q) => sum + (q.estimated_total || 0), 0),
            pending_count: quotes.filter(q => q.status === 'pending').length,
            accepted_count: quotes.filter(q => q.status === 'approved').length,
            reviewing_count: quotes.filter(q => q.status === 'reviewing').length,
            business_count: quotes.filter(q => ['business', 'verified'].includes(q.user_type)).length
        }

        return { success: true, stats }
    } catch (error: any) {
        console.error('Error in getAdminQuoteStats:', error)
        return { success: false, error: error.message || 'Failed to fetch stats' }
    }
}

/**
 * Get quote audit log
 */
export async function getQuoteAuditLog(quoteId: string): Promise<
    | { success: true; logs: QuoteAuditLog[] }
    | { success: false; error: string }
> {
    try {
        const supabase = createServerSupabaseClient()
        if (!supabase) {
            return { success: false, error: 'Database connection failed' }
        }

        const { data: logs, error } = await supabase
            .from('quote_audit_log')
            .select('*')
            .eq('quote_id', quoteId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching audit log:', error)
            return { success: false, error: error.message }
        }

        return { success: true, logs: logs as QuoteAuditLog[] }
    } catch (error: any) {
        console.error('Error in getQuoteAuditLog:', error)
        return { success: false, error: error.message || 'Failed to fetch audit log' }
    }
}
