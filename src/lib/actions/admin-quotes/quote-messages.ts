'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Add admin message to quote
 * Updated to use quotes table fields instead of deprecated quote_admin_responses table
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

        // Update quotes table with message in appropriate field
        const updateData: Record<string, any> = {
            admin_response_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }

        if (isInternal) {
            updateData.admin_internal_notes = message
        } else {
            updateData.admin_response_message = message
        }

        const { error } = await supabase
            .from('quotes')
            .update(updateData)
            .eq('id', quoteId)

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

