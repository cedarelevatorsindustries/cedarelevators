'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Delete quote (Admin)
 */
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
