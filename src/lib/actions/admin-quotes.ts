'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Quote, QuoteStatus, QuoteStats, QuotePriority, QuoteAuditLog, QuoteActionType } from '@/types/b2b/quote'
import { getCurrentAdminUser, canApproveQuotes, canPriceQuotes } from '@/lib/auth/admin-roles'

// =====================================================
// AUDIT LOG HELPER
// =====================================================

async function logQuoteAction(
    quoteId: string,
    actionType: QuoteActionType,
    details: {
        oldStatus?: QuoteStatus
        newStatus?: QuoteStatus
        oldPriority?: QuotePriority
        newPriority?: QuotePriority
        oldTotal?: number
        newTotal?: number
        notes?: string
        metadata?: Record<string, any>
    } = {}
): Promise<void> {
    try {
        const adminUser = await getCurrentAdminUser()
        const supabase = createServerSupabaseClient()

        if (!supabase) return

        await supabase.from('quote_audit_log').insert({
            quote_id: quoteId,
            action_type: actionType,
            old_status: details.oldStatus,
            new_status: details.newStatus,
            old_priority: details.oldPriority,
            new_priority: details.newPriority,
            pricing_changed: details.oldTotal !== details.newTotal,
            old_total: details.oldTotal,
            new_total: details.newTotal,
            admin_clerk_id: adminUser?.clerk_user_id,
            admin_name: adminUser?.full_name,
            admin_role: adminUser?.role,
            notes: details.notes,
            metadata: details.metadata,
        })
    } catch (error) {
        console.error('Error logging quote action:', error)
        // Don't throw - audit log failure shouldn't break the main action
    }
}

// =====================================================
// GET ALL QUOTES (ADMIN)
// =====================================================

interface AdminQuoteFilters {
    status: QuoteStatus | 'all'
    priority: QuotePriority | 'all'
    user_type: 'all' | 'guest' | 'individual' | 'business' | 'verified'
    date_range: 'today' | 'last_7_days' | 'last_30_days' | 'all'
    search: string
}

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

// =====================================================
// GET SINGLE QUOTE (ADMIN)
// =====================================================

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

// =====================================================
// GET ADMIN QUOTE STATS
// =====================================================

export async function getAdminQuoteStats(): Promise<
    | { success: true; stats: QuoteStats & { in_review_count: number; business_count: number } }
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
            active_quotes: quotes.filter(q => ['pending', 'in_review', 'negotiation'].includes(q.status)).length,
            total_value: quotes.reduce((sum, q) => sum + (q.estimated_total || 0), 0),
            pending_count: quotes.filter(q => q.status === 'pending').length,
            accepted_count: quotes.filter(q => q.status === 'accepted').length,
            in_review_count: quotes.filter(q => q.status === 'in_review').length,
            business_count: quotes.filter(q => ['business', 'verified'].includes(q.user_type)).length
        }

        return { success: true, stats }
    } catch (error: any) {
        console.error('Error in getAdminQuoteStats:', error)
        return { success: false, error: error.message || 'Failed to fetch stats' }
    }
}

// =====================================================
// UPDATE QUOTE STATUS (ADMIN)
// =====================================================

export async function updateQuoteStatus(
    quoteId: string,
    status: QuoteStatus,
    adminNotes?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createServerSupabaseClient()
        if (!supabase) {
            return { success: false, error: 'Database connection failed' }
        }

        const updateData: Record<string, any> = {
            status,
            updated_at: new Date().toISOString()
        }

        if (adminNotes) {
            updateData.admin_notes = adminNotes
            updateData.admin_response_at = new Date().toISOString()
        }

        const { error } = await supabase
            .from('quotes')
            .update(updateData)
            .eq('id', quoteId)

        if (error) {
            console.error('Error updating quote status:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/quotes')
        revalidatePath(`/admin/quotes/${quoteId}`)

        // TODO: Send Pusher notification to user
        // TODO: Send email notification via Resend

        return { success: true }
    } catch (error: any) {
        console.error('Error in updateQuoteStatus:', error)
        return { success: false, error: error.message || 'Failed to update status' }
    }
}

// =====================================================
// UPDATE QUOTE PRIORITY (ADMIN)
// =====================================================

export async function updateQuotePriority(
    quoteId: string,
    priority: QuotePriority
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createServerSupabaseClient()
        if (!supabase) {
            return { success: false, error: 'Database connection failed' }
        }

        const { error } = await supabase
            .from('quotes')
            .update({ priority, updated_at: new Date().toISOString() })
            .eq('id', quoteId)

        if (error) {
            console.error('Error updating quote priority:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/quotes')
        return { success: true }
    } catch (error: any) {
        console.error('Error in updateQuotePriority:', error)
        return { success: false, error: error.message || 'Failed to update priority' }
    }
}

// =====================================================
// UPDATE QUOTE PRICING (ADMIN)
// =====================================================

export async function updateQuotePricing(
    quoteId: string,
    pricing: {
        subtotal: number
        discount_total: number
        tax_total: number
        estimated_total: number
    }
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createServerSupabaseClient()
        if (!supabase) {
            return { success: false, error: 'Database connection failed' }
        }

        const { error } = await supabase
            .from('quotes')
            .update({
                ...pricing,
                status: 'revised',
                updated_at: new Date().toISOString()
            })
            .eq('id', quoteId)

        if (error) {
            console.error('Error updating quote pricing:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/quotes')
        revalidatePath(`/admin/quotes/${quoteId}`)

        return { success: true }
    } catch (error: any) {
        console.error('Error in updateQuotePricing:', error)
        return { success: false, error: error.message || 'Failed to update pricing' }
    }
}

// =====================================================
// UPDATE QUOTE ITEM PRICING (ADMIN)
// =====================================================

export async function updateQuoteItemPricing(
    itemId: string,
    pricing: {
        unit_price: number
        discount_percentage: number
        total_price: number
    }
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createServerSupabaseClient()
        if (!supabase) {
            return { success: false, error: 'Database connection failed' }
        }

        const { error } = await supabase
            .from('quote_items')
            .update(pricing)
            .eq('id', itemId)

        if (error) {
            console.error('Error updating quote item pricing:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/quotes')
        return { success: true }
    } catch (error: any) {
        console.error('Error in updateQuoteItemPricing:', error)
        return { success: false, error: error.message || 'Failed to update item pricing' }
    }
}

// =====================================================
// ADD ADMIN MESSAGE TO QUOTE
// =====================================================

export async function addAdminQuoteMessage(
    quoteId: string,
    message: string,
    isInternal: boolean = false
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createServerSupabaseClient()
        if (!supabase) {
            return { success: false, error: 'Database connection failed' }
        }

        const { error } = await supabase
            .from('quote_messages')
            .insert({
                quote_id: quoteId,
                sender_type: 'admin',
                sender_name: 'Cedar Team',
                message,
                is_internal: isInternal
            })

        if (error) {
            console.error('Error adding admin message:', error)
            return { success: false, error: error.message }
        }

        revalidatePath(`/admin/quotes/${quoteId}`)

        // TODO: Send Pusher notification to user (if not internal)

        return { success: true }
    } catch (error: any) {
        console.error('Error in addAdminQuoteMessage:', error)
        return { success: false, error: error.message || 'Failed to send message' }
    }
}

// =====================================================
// DELETE QUOTE (ADMIN)
// =====================================================

export async function deleteQuote(quoteId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createServerSupabaseClient()
        if (!supabase) {
            return { success: false, error: 'Database connection failed' }
        }

        const { error } = await supabase
            .from('quotes')
            .delete()
            .eq('id', quoteId)

        if (error) {
            console.error('Error deleting quote:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/quotes')
        return { success: true }
    } catch (error: any) {
        console.error('Error in deleteQuote:', error)
        return { success: false, error: error.message || 'Failed to delete quote' }
    }
}
