'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Add admin message to quote
 */
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
            .from('quote_admin_responses')
            .insert({
                quote_id: quoteId,
                response_note: message,
                responded_by: 'Cedar Team',
                responded_at: new Date().toISOString()
            })

        if (error) {
            console.error('Error adding admin message:', error)
            return { success: false, error: error.message }
        }

        revalidatePath(`/admin/quotes/${quoteId}`)

        return { success: true }
    } catch (error: any) {
        console.error('Error in addAdminQuoteMessage:', error)
        return { success: false, error: error.message || 'Failed to send message' }
    }
}

