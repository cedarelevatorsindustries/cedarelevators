'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Update quote pricing (Admin)
 */
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

/**
 * Update quote item pricing (Admin)
 */
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

