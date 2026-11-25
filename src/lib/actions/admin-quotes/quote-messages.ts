'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { revalidatePath } from 'next/cache'
import { logQuoteAction } from './quote-audit'

export async function addAdminQuoteMessage(
  quoteId: string,
  message: string,
  isInternal: boolean = false
): Promise<{ success: boolean; error?: string }> {
  try {
    const authCheck = await requireAdmin('manager')
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error }
    }

    const supabase = createAdminClient()
    const now = new Date().toISOString()

    const updateData: Record<string, any> = {
      updated_at: now,
    }

    if (isInternal) {
      updateData.admin_internal_notes = message
    } else {
      updateData.admin_response_message = message
      updateData.admin_response_at = now
    }

    const { error } = await supabase.from('quotes').update(updateData).eq('id', quoteId)
    if (error) {
      return { success: false, error: error.message }
    }

    await logQuoteAction(quoteId, isInternal ? 'internal_note_added' : 'message_sent', {
      actorType: 'admin',
      notes: isInternal ? 'Internal admin note updated' : 'Customer response message updated',
    })

    revalidatePath(`/admin/quotes/${quoteId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to save message' }
  }
}
