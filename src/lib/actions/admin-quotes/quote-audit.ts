'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { QuoteStatus, QuotePriority, QuoteActionType } from '@/types/b2b/quote'
import { getCurrentAdminUser } from '@/lib/auth/admin-roles'

/**
 * Log quote actions for audit trail
 */
export async function logQuoteAction(
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

