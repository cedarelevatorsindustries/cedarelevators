'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { revalidatePath } from 'next/cache'
import { QuoteItem } from '@/types/b2b/quote'
import { calculateQuoteTotals } from '@/lib/utils/quote-pricing'
import { logQuoteAction } from './quote-audit'
import { retryQuoteNotificationById } from '@/lib/services/quote-notifications'

export async function updateQuoteItems(
  quoteId: string,
  items: QuoteItem[],
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const authCheck = await requireAdmin('manager')
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error }
    }

    if (!reason || reason.trim().length < 5) {
      return { success: false, error: 'Reason must be at least 5 characters' }
    }

    const supabase = createAdminClient()

    const { data: existingItems } = await supabase
      .from('quote_items')
      .select('*')
      .eq('quote_id', quoteId)

    await supabase.from('quote_items').delete().eq('quote_id', quoteId)

    if (items.length > 0) {
      const itemsToInsert = items.map((item) => ({
        quote_id: quoteId,
        product_id: item.product_id || null,
        variant_id: item.variant_id || null,
        product_name: item.product_name,
        product_sku: item.product_sku || null,
        product_thumbnail: item.product_thumbnail || null,
        variant_title: item.variant_title || null,
        variant_sku: item.variant_sku || null,
        specifications: item.specifications || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percentage: item.discount_percentage || 0,
        discount_amount: item.discount_amount || 0,
        total_price: item.total_price,
        line_total: item.line_total ?? item.total_price,
        bulk_pricing_requested: item.bulk_pricing_requested || false,
        notes: item.notes || null,
      }))

      const { error: insertError } = await supabase.from('quote_items').insert(itemsToInsert)
      if (insertError) {
        return { success: false, error: insertError.message }
      }
    }

    await logQuoteAction(quoteId, 'item_pricing_updated', {
      actorType: 'admin',
      notes: reason,
      metadata: {
        old_count: existingItems?.length || 0,
        new_count: items.length,
      },
    })

    await recalculateQuoteTotals(quoteId)

    revalidatePath('/admin/quotes')
    revalidatePath(`/admin/quotes/${quoteId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update quote items' }
  }
}

export async function updateQuoteQuantities(
  quoteId: string,
  quantities: { itemId: string; quantity: number }[],
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const authCheck = await requireAdmin('manager')
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error }
    }

    if (!reason || reason.trim().length < 5) {
      return { success: false, error: 'Reason must be at least 5 characters' }
    }

    const supabase = createAdminClient()
    const { data: existingItems } = await supabase
      .from('quote_items')
      .select('*')
      .eq('quote_id', quoteId)

    const existingMap = new Map((existingItems || []).map((i: any) => [i.id, i]))

    for (const { itemId, quantity } of quantities) {
      if (quantity <= 0) {
        return { success: false, error: 'Quantity must be greater than 0' }
      }
      const existing = existingMap.get(itemId)
      const calc = calculateQuoteTotals({
        items: [
          {
            quantity,
            unit_price: Number(existing?.unit_price || 0),
            discount_percentage: Number(existing?.discount_percentage || 0),
          },
        ],
        taxEnabled: false,
      })
      const netAmount = calc.items[0]?.net_amount ?? 0

      const { error } = await supabase
        .from('quote_items')
        .update({
          quantity,
          discount_amount: calc.items[0]?.discount_amount ?? 0,
          total_price: netAmount,
          line_total: netAmount,
        })
        .eq('id', itemId)
        .eq('quote_id', quoteId)

      if (error) {
        return { success: false, error: error.message }
      }
    }

    await logQuoteAction(quoteId, 'item_pricing_updated', {
      actorType: 'admin',
      notes: reason,
      metadata: { new_quantities: quantities },
    })

    await recalculateQuoteTotals(quoteId)

    revalidatePath('/admin/quotes')
    revalidatePath(`/admin/quotes/${quoteId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update quantities' }
  }
}

export async function setQuoteExpiry(
  quoteId: string,
  expiryDate: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const authCheck = await requireAdmin('manager')
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error }
    }

    const expiry = new Date(expiryDate)
    if (isNaN(expiry.getTime()) || expiry < new Date()) {
      return { success: false, error: 'Expiry date must be a valid future date' }
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('quotes')
      .update({ valid_until: expiry.toISOString(), updated_at: new Date().toISOString() })
      .eq('id', quoteId)

    if (error) {
      return { success: false, error: error.message }
    }

    await logQuoteAction(quoteId, 'status_changed', {
      actorType: 'admin',
      notes: `Validity extended to ${expiry.toLocaleDateString('en-IN')}`,
      metadata: { expiry_date: expiry.toISOString() },
    })

    revalidatePath('/admin/quotes')
    revalidatePath(`/admin/quotes/${quoteId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to set expiry' }
  }
}

export async function addAdminNote(
  quoteId: string,
  note: string,
  isInternal: boolean = true
): Promise<{ success: boolean; error?: string }> {
  try {
    const authCheck = await requireAdmin('manager')
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error }
    }

    if (!note || note.trim().length === 0) {
      return { success: false, error: 'Note cannot be empty' }
    }

    const supabase = createAdminClient()
    const now = new Date().toISOString()

    await supabase.from('quote_admin_responses').insert({
      quote_id: quoteId,
      response_note: note.trim(),
      responded_by: authCheck.adminUser.display_name || authCheck.adminUser.email,
      responded_at: now,
    })

    const updatePayload = isInternal
      ? { admin_internal_notes: note.trim(), updated_at: now }
      : { admin_response_message: note.trim(), admin_response_at: now, updated_at: now }

    await supabase.from('quotes').update(updatePayload).eq('id', quoteId)

    await logQuoteAction(quoteId, isInternal ? 'internal_note_added' : 'message_sent', {
      actorType: 'admin',
      notes: isInternal ? 'Internal admin note saved' : 'Customer-facing response message updated',
    })

    revalidatePath('/admin/quotes')
    revalidatePath(`/admin/quotes/${quoteId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to add note' }
  }
}

export async function retryQuoteNotification(
  quoteId: string,
  notificationId: string
): Promise<{ success: boolean; error?: string }> {
  const authCheck = await requireAdmin('manager')
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error }
  }

  const res = await retryQuoteNotificationById(notificationId)
  revalidatePath(`/admin/quotes/${quoteId}`)
  return res
}

async function recalculateQuoteTotals(quoteId: string): Promise<void> {
  const supabase = createAdminClient()
  const [{ data: quote }, { data: items }] = await Promise.all([
    supabase.from('quotes').select('*').eq('id', quoteId).single(),
    supabase.from('quote_items').select('*').eq('quote_id', quoteId),
  ])

  if (!quote || !items || items.length === 0) return

  const totals = calculateQuoteTotals({
    items: items.map((i: any) => ({
      id: i.id,
      quantity: Number(i.quantity) || 1,
      unit_price: Number(i.unit_price) || 0,
      discount_percentage: Number(i.discount_percentage) || 0,
    })),
    overallDiscountType: (quote.overall_discount_type as any) || 'fixed',
    overallDiscountValue: Number(quote.overall_discount_value || 0),
    taxEnabled: quote.tax_enabled !== false,
    taxRate: Number(quote.tax_rate || 0),
  })

  await supabase
    .from('quotes')
    .update({
      subtotal: totals.subtotal,
      discount_total: totals.discount_total,
      taxable_amount: totals.taxable_amount,
      tax_total: totals.tax_total,
      estimated_total: totals.grand_total,
      updated_at: new Date().toISOString(),
    })
    .eq('id', quoteId)
}

export async function deleteQuote(quoteId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const authCheck = await requireAdmin('admin')
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error }
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from('quotes').delete().eq('id', quoteId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/quotes')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete quote' }
  }
}
