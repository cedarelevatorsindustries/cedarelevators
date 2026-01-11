'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { CustomerNote } from '@/types/b2b/customer'
import { getCurrentAdminUser } from '@/lib/auth/admin-roles'
import { revalidatePath } from 'next/cache'

// =====================================================
// GET CUSTOMER NOTES
// =====================================================

export async function getCustomerNotes(
    customerClerkId: string
): Promise<
    | { success: true; notes: CustomerNote[] }
    | { success: false; error: string }
> {
    try {
        const supabase = createAdminClient()
        if (!supabase) {
            return { success: false, error: 'Database connection failed' }
        }

        const { data: notes, error } = await supabase
            .from('customer_notes')
            .select('*')
            .eq('customer_clerk_id', customerClerkId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching notes:', error)
            return { success: false, error: error.message }
        }

        return { success: true, notes: notes || [] }
    } catch (error: any) {
        console.error('Error in getCustomerNotes:', error)
        return { success: false, error: error.message || 'Failed to fetch notes' }
    }
}

// =====================================================
// ADD CUSTOMER NOTE
// =====================================================

export async function addCustomerNote(
    customerClerkId: string,
    noteText: string,
    isImportant: boolean = false
): Promise<{ success: boolean; error?: string }> {
    try {
        if (!noteText || noteText.trim().length === 0) {
            return { success: false, error: 'Note text is required' }
        }

        const supabase = createAdminClient()
        if (!supabase) {
            return { success: false, error: 'Database connection failed' }
        }

        const adminUser = await getCurrentAdminUser()

        const { error } = await supabase.from('customer_notes').insert({
            customer_clerk_id: customerClerkId,
            admin_clerk_id: adminUser?.clerk_user_id || 'system',
            admin_name: adminUser?.name || 'System Admin', // Fallback
            note_text: noteText,
            is_important: isImportant,
        })

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath(`/admin/customers/${customerClerkId}`)

        return { success: true }
    } catch (error: any) {
        console.error('Error in addCustomerNote:', error)
        return { success: false, error: error.message || 'Failed to add note' }
    }
}
