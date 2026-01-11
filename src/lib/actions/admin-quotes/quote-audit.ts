'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface QuoteAuditEntry {
    id: string
    action_type: string
    old_status: string | null
    new_status: string | null
    admin_name: string | null
    notes: string | null
    created_at: string
}

/**
 * Get audit timeline for a quote
 */
export async function getQuoteAuditTimeline(
    quoteId: string
): Promise<{ success: boolean; entries?: QuoteAuditEntry[]; error?: string }> {
    try {
        const supabase = createServerSupabaseClient()
        if (!supabase) {
            return { success: false, error: 'Database connection failed' }
        }

        const { data, error } = await supabase
            .from('quote_audit_log')
            .select('id, action_type, old_status, new_status, admin_name, notes, created_at')
            .eq('quote_id', quoteId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching audit log:', error)
            return { success: false, error: error.message }
        }

        return { success: true, entries: data || [] }
    } catch (error: any) {
        console.error('Error in getQuoteAuditTimeline:', error)
        return { success: false, error: error.message || 'Failed to fetch audit log' }
    }
}

/**
 * Check if quote is expired and update status if needed
 */
export async function checkAndExpireQuote(
    quoteId: string
): Promise<{ expired: boolean; error?: string }> {
    try {
        const supabase = createServerSupabaseClient()
        if (!supabase) {
            return { expired: false, error: 'Database connection failed' }
        }

        const { data: quote, error: fetchError } = await supabase
            .from('quotes')
            .select('id, status, valid_until')
            .eq('id', quoteId)
            .single()

        if (fetchError || !quote) {
            return { expired: false, error: 'Quote not found' }
        }

        // Only check approved quotes with a valid_until date
        if (quote.status !== 'approved' || !quote.valid_until) {
            return { expired: false }
        }

        const now = new Date()
        const validUntil = new Date(quote.valid_until)

        if (now > validUntil) {
            // Quote is expired - update status
            const { error: updateError } = await supabase
                .from('quotes')
                .update({
                    status: 'expired',
                    updated_at: now.toISOString()
                })
                .eq('id', quoteId)

            if (updateError) {
                console.error('Error expiring quote:', updateError)
                return { expired: true, error: updateError.message }
            }

            // Log the expiry
            await supabase.from('quote_audit_log').insert({
                quote_id: quoteId,
                action_type: 'expired',
                old_status: 'approved',
                new_status: 'expired',
                notes: 'Quote expired automatically past valid_until date'
            })

            return { expired: true }
        }

        return { expired: false }
    } catch (error: any) {
        console.error('Error in checkAndExpireQuote:', error)
        return { expired: false, error: error.message || 'Failed to check expiry' }
    }
}

/**
 * Bulk expire all past-due quotes (for cron job)
 */
export async function expireOverdueQuotes(): Promise<{ count: number; error?: string }> {
    try {
        const supabase = createServerSupabaseClient()
        if (!supabase) {
            return { count: 0, error: 'Database connection failed' }
        }

        const now = new Date().toISOString()

        // Find all approved quotes past valid_until
        const { data: overdueQuotes, error: fetchError } = await supabase
            .from('quotes')
            .select('id')
            .eq('status', 'approved')
            .lt('valid_until', now)

        if (fetchError) {
            return { count: 0, error: fetchError.message }
        }

        if (!overdueQuotes || overdueQuotes.length === 0) {
            return { count: 0 }
        }

        const quoteIds = overdueQuotes.map(q => q.id)

        // Update all to expired
        const { error: updateError } = await supabase
            .from('quotes')
            .update({
                status: 'expired',
                updated_at: now
            })
            .in('id', quoteIds)

        if (updateError) {
            return { count: 0, error: updateError.message }
        }

        // Log each expiry
        const auditEntries = quoteIds.map(id => ({
            quote_id: id,
            action_type: 'expired',
            old_status: 'approved',
            new_status: 'expired',
            notes: 'Quote expired automatically past valid_until date'
        }))

        await supabase.from('quote_audit_log').insert(auditEntries)

        return { count: quoteIds.length }
    } catch (error: any) {
        console.error('Error in expireOverdueQuotes:', error)
        return { count: 0, error: error.message || 'Failed to expire quotes' }
    }
}
