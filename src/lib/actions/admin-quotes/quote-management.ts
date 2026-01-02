'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Quote, QuoteItem } from '@/types/b2b/quote'

/**
 * Get all quotes with filters (Admin)
 */
export async function getAdminQuotes(filters?: {
    status?: string
    priority?: string
    user_type?: string
    search?: string
    date_range?: string
}): Promise<{ success: boolean; quotes?: Quote[]; error?: string }> {
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
                messages:quote_messages(*)
            `)
            .order('created_at', { ascending: false })

        // Apply filters
        if (filters?.status && filters.status !== 'all') {
            query = query.eq('status', filters.status)
        }

        if (filters?.priority && filters.priority !== 'all') {
            query = query.eq('priority', filters.priority)
        }

        if (filters?.user_type && filters.user_type !== 'all') {
            query = query.eq('user_type', filters.user_type)
        }

        if (filters?.search) {
            query = query.or(`quote_number.ilike.%${filters.search}%,guest_email.ilike.%${filters.search}%,guest_name.ilike.%${filters.search}%`)
        }

        if (filters?.date_range) {
            const now = new Date()
            let startDate: Date
            switch (filters.date_range) {
                case 'last_7_days':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                    break
                case 'last_30_days':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                    break
                case 'last_90_days':
                    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
                    break
                default:
                    startDate = new Date(0)
            }
            query = query.gte('created_at', startDate.toISOString())
        }

        const { data: quotes, error } = await query

        if (error) {
            console.error('Error fetching admin quotes:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/quotes')
        return { success: true, quotes: quotes as Quote[] }
    } catch (error: any) {
        console.error('Error in getAdminQuotes:', error)
        return { success: false, error: error.message || 'Failed to fetch quotes' }
    }
}

/**
 * Get single quote by ID with full details (Admin)
 */
export async function getAdminQuoteById(quoteId: string): Promise<{ success: boolean; quote?: Quote; error?: string }> {
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
            console.error('Error fetching admin quote:', error)
            return { success: false, error: error.message }
        }

        return { success: true, quote: quote as Quote }
    } catch (error: any) {
        console.error('Error in getAdminQuoteById:', error)
        return { success: false, error: error.message || 'Failed to fetch quote' }
    }
}

/**
 * Update quote items (Add/Remove with audit trail)
 */
export async function updateQuoteItems(
    quoteId: string,
    items: QuoteItem[],
    reason: string,
    adminId: string,
    adminName: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createServerSupabaseClient()
        if (!supabase) {
            return { success: false, error: 'Database connection failed' }
        }

        if (!reason || reason.trim().length < 10) {
            return { success: false, error: 'Reason must be at least 10 characters' }
        }

        // Get existing items
        const { data: existingItems } = await supabase
            .from('quote_items')
            .select('*')
            .eq('quote_id', quoteId)

        // Delete all existing items
        await supabase
            .from('quote_items')
            .delete()
            .eq('quote_id', quoteId)

        // Insert new items
        const itemsToInsert = items.map(item => ({
            quote_id: quoteId,
            product_id: item.product_id,
            variant_id: item.variant_id,
            product_name: item.product_name,
            product_sku: item.product_sku,
            product_thumbnail: item.product_thumbnail,
            quantity: item.quantity,
            unit_price: item.unit_price,
            discount_percentage: item.discount_percentage || 0,
            total_price: item.total_price,
            bulk_pricing_requested: item.bulk_pricing_requested,
            notes: item.notes
        }))

        const { error: insertError } = await supabase
            .from('quote_items')
            .insert(itemsToInsert)

        if (insertError) {
            console.error('Error updating quote items:', insertError)
            return { success: false, error: insertError.message }
        }

        // Log to audit trail
        await supabase.from('quote_audit_log').insert({
            quote_id: quoteId,
            action_type: 'item_pricing_updated',
            admin_clerk_id: adminId,
            admin_name: adminName,
            notes: reason,
            metadata: {
                old_items: existingItems,
                new_items: items,
                item_count_changed: (existingItems?.length || 0) !== items.length
            }
        })

        // Recalculate totals
        await recalculateQuoteTotals(quoteId)

        revalidatePath('/admin/quotes')
        revalidatePath(`/admin/quotes/${quoteId}`)
        return { success: true }
    } catch (error: any) {
        console.error('Error in updateQuoteItems:', error)
        return { success: false, error: error.message || 'Failed to update quote items' }
    }
}

/**
 * Update quote quantities with audit trail
 */
export async function updateQuoteQuantities(
    quoteId: string,
    quantities: { itemId: string; quantity: number }[],
    reason: string,
    adminId: string,
    adminName: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createServerSupabaseClient()
        if (!supabase) {
            return { success: false, error: 'Database connection failed' }
        }

        if (!reason || reason.trim().length < 10) {
            return { success: false, error: 'Reason must be at least 10 characters' }
        }

        // Get existing items for audit
        const { data: existingItems } = await supabase
            .from('quote_items')
            .select('*')
            .eq('quote_id', quoteId)

        // Update each quantity
        for (const { itemId, quantity } of quantities) {
            if (quantity <= 0) {
                return { success: false, error: 'Quantity must be greater than 0' }
            }

            const { error } = await supabase
                .from('quote_items')
                .update({
                    quantity,
                    total_price: supabase.rpc('calculate_item_total', { item_id: itemId })
                })
                .eq('id', itemId)

            if (error) {
                console.error('Error updating quantity:', error)
                return { success: false, error: error.message }
            }
        }

        // Log to audit trail
        await supabase.from('quote_audit_log').insert({
            quote_id: quoteId,
            action_type: 'item_pricing_updated',
            admin_clerk_id: adminId,
            admin_name: adminName,
            notes: reason,
            metadata: {
                old_quantities: existingItems,
                new_quantities: quantities
            }
        })

        // Recalculate totals
        await recalculateQuoteTotals(quoteId)

        revalidatePath('/admin/quotes')
        revalidatePath(`/admin/quotes/${quoteId}`)
        return { success: true }
    } catch (error: any) {
        console.error('Error in updateQuoteQuantities:', error)
        return { success: false, error: error.message || 'Failed to update quantities' }
    }
}

/**
 * Set quote expiry date
 */
export async function setQuoteExpiry(
    quoteId: string,
    expiryDate: string,
    adminId: string,
    adminName: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createServerSupabaseClient()
        if (!supabase) {
            return { success: false, error: 'Database connection failed' }
        }

        const expiry = new Date(expiryDate)
        if (expiry < new Date()) {
            return { success: false, error: 'Expiry date must be in the future' }
        }

        const { error } = await supabase
            .from('quotes')
            .update({ valid_until: expiry.toISOString() })
            .eq('id', quoteId)

        if (error) {
            console.error('Error setting expiry:', error)
            return { success: false, error: error.message }
        }

        // Log to audit trail
        await supabase.from('quote_audit_log').insert({
            quote_id: quoteId,
            action_type: 'status_changed',
            admin_clerk_id: adminId,
            admin_name: adminName,
            notes: `Expiry date set to ${expiry.toLocaleDateString()}`,
            metadata: { expiry_date: expiryDate }
        })

        revalidatePath('/admin/quotes')
        revalidatePath(`/admin/quotes/${quoteId}`)
        return { success: true }
    } catch (error: any) {
        console.error('Error in setQuoteExpiry:', error)
        return { success: false, error: error.message || 'Failed to set expiry' }
    }
}

/**
 * Add admin internal note
 */
export async function addAdminNote(
    quoteId: string,
    note: string,
    isInternal: boolean,
    adminId: string,
    adminName: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createServerSupabaseClient()
        if (!supabase) {
            return { success: false, error: 'Database connection failed' }
        }

        if (!note || note.trim().length === 0) {
            return { success: false, error: 'Note cannot be empty' }
        }

        const { error } = await supabase.from('quote_messages').insert({
            quote_id: quoteId,
            sender_type: 'admin',
            sender_id: adminId,
            sender_name: adminName,
            message: note,
            is_internal: isInternal
        })

        if (error) {
            console.error('Error adding admin note:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/quotes')
        revalidatePath(`/admin/quotes/${quoteId}`)
        return { success: true }
    } catch (error: any) {
        console.error('Error in addAdminNote:', error)
        return { success: false, error: error.message || 'Failed to add note' }
    }
}

/**
 * Recalculate quote totals (internal helper)
 */
async function recalculateQuoteTotals(quoteId: string): Promise<void> {
    const supabase = createServerSupabaseClient()
    if (!supabase) return

    // Get all items
    const { data: items } = await supabase
        .from('quote_items')
        .select('*')
        .eq('quote_id', quoteId)

    if (!items || items.length === 0) return

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.total_price || 0), 0)
    const discountTotal = items.reduce((sum, item) => {
        const discount = (item.unit_price * item.quantity * (item.discount_percentage || 0)) / 100
        return sum + discount
    }, 0)
    const taxTotal = subtotal * 0.18 // 18% GST
    const estimatedTotal = subtotal - discountTotal + taxTotal

    // Update quote
    await supabase
        .from('quotes')
        .update({
            subtotal,
            discount_total: discountTotal,
            tax_total: taxTotal,
            estimated_total: estimatedTotal
        })
        .eq('id', quoteId)
}

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
