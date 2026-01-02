'use server'

import { createClerkSupabaseClient } from '@/lib/supabase/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { QuoteStatus, QuotePriority, QuoteActionType } from '@/types/b2b/quote'

interface CreateAuditLogParams {
    quote_id: string
    action_type: QuoteActionType
    old_status?: QuoteStatus
    new_status?: QuoteStatus
    old_priority?: QuotePriority
    new_priority?: QuotePriority
    pricing_changed?: boolean
    old_total?: number
    new_total?: number
    notes?: string
    metadata?: Record<string, any>
}

/**
 * Creates an audit log entry for a quote action
 * This provides an immutable history of all quote changes
 */
export async function createQuoteAuditLog(
    params: CreateAuditLogParams
): Promise<{ success: boolean; error?: string }> {
    try {
        const { userId } = await auth()
        const user = await currentUser()
        const supabase = await createClerkSupabaseClient()

        // Get admin role if available (for admin actions)
        // For now, we'll use a simple check - this should be enhanced
        const adminRole = user?.publicMetadata?.role as string | undefined

        const auditEntry = {
            quote_id: params.quote_id,
            action_type: params.action_type,
            old_status: params.old_status,
            new_status: params.new_status,
            old_priority: params.old_priority,
            new_priority: params.new_priority,
            pricing_changed: params.pricing_changed || false,
            old_total: params.old_total,
            new_total: params.new_total,
            admin_clerk_id: userId,
            admin_name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : undefined,
            admin_role: adminRole,
            notes: params.notes,
            metadata: params.metadata
        }

        const { error } = await supabase
            .from('quote_audit_log')
            .insert(auditEntry)

        if (error) {
            console.error('Error creating audit log:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error: any) {
        console.error('Error in createQuoteAuditLog:', error)
        return { success: false, error: error.message || 'Failed to create audit log' }
    }
}

/**
 * Gets audit log entries for a quote
 */
export async function getQuoteAuditLog(
    quoteId: string
): Promise<{ success: boolean; logs?: any[]; error?: string }> {
    try {
        const { userId } = await auth()
        if (!userId) {
            return { success: false, error: 'Unauthorized' }
        }

        const supabase = await createClerkSupabaseClient()

        // Verify user owns the quote or is admin
        const { data: quote } = await supabase
            .from('quotes')
            .select('id, clerk_user_id')
            .eq('id', quoteId)
            .single()

        if (!quote) {
            return { success: false, error: 'Quote not found' }
        }

        // Check if user owns the quote
        // TODO: Add admin check
        if (quote.clerk_user_id !== userId) {
            return { success: false, error: 'Unauthorized' }
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

        return { success: true, logs }
    } catch (error: any) {
        console.error('Error in getQuoteAuditLog:', error)
        return { success: false, error: error.message || 'Failed to fetch audit log' }
    }
}

/**
 * Helper function to log status changes
 */
export async function logStatusChange(
    quoteId: string,
    oldStatus: QuoteStatus,
    newStatus: QuoteStatus,
    notes?: string
): Promise<void> {
    await createQuoteAuditLog({
        quote_id: quoteId,
        action_type: 'status_changed',
        old_status: oldStatus,
        new_status: newStatus,
        notes
    })
}

/**
 * Helper function to log pricing updates
 */
export async function logPricingUpdate(
    quoteId: string,
    oldTotal: number,
    newTotal: number,
    notes?: string
): Promise<void> {
    await createQuoteAuditLog({
        quote_id: quoteId,
        action_type: 'pricing_updated',
        pricing_changed: true,
        old_total: oldTotal,
        new_total: newTotal,
        notes
    })
}

/**
 * Helper function to log quote conversion
 */
export async function logQuoteConversion(
    quoteId: string,
    orderId: string
): Promise<void> {
    await createQuoteAuditLog({
        quote_id: quoteId,
        action_type: 'converted',
        old_status: 'approved',
        new_status: 'converted',
        notes: 'Quote converted to order',
        metadata: { order_id: orderId }
    })
}

/**
 * Helper function to log quote approval
 */
export async function logQuoteApproval(
    quoteId: string,
    notes?: string
): Promise<void> {
    await createQuoteAuditLog({
        quote_id: quoteId,
        action_type: 'approved',
        old_status: 'reviewing',
        new_status: 'approved',
        notes
    })
}

/**
 * Helper function to log quote rejection
 */
export async function logQuoteRejection(
    quoteId: string,
    reason: string
): Promise<void> {
    await createQuoteAuditLog({
        quote_id: quoteId,
        action_type: 'rejected',
        old_status: 'reviewing',
        new_status: 'rejected',
        notes: reason
    })
}
