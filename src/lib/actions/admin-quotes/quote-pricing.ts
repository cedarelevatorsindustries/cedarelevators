'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { revalidatePath } from 'next/cache'
import { calculateQuoteTotals } from '@/lib/utils/quote-pricing'
import { logQuoteAction } from './quote-audit'

export interface SaveCommercialPricingInput {
  items: Array<{
    id: string
    quantity?: number
    unit_price: number
    discount_percentage: number
  }>
  overallDiscountType?: 'fixed' | 'percentage'
  overallDiscountValue?: number
  taxEnabled: boolean
  taxRate: number
  termsAndConditions?: string
  customerMessage?: string
  internalNotes?: string
  customAmountForGeneralEnquiry?: number
}

/**
 * Authoritative server-side commercial pricing calculation & save (Manager+ only).
 * Does NOT transition status to 'quoted' — only saves draft pricing and transitions submitted/pending -> reviewing.
 */
export async function saveQuoteCommercialPricing(
  quoteId: string,
  input: SaveCommercialPricingInput
): Promise<{
  success: boolean
  totals?: ReturnType<typeof calculateQuoteTotals>
  error?: string
}> {
  try {
    const authCheck = await requireAdmin('manager')
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error }
    }

    const supabase = createAdminClient()

    const { data: quote, error: fetchError } = await supabase
      .from('quotes')
      .select('*, items:quote_items(*)')
      .eq('id', quoteId)
      .single()

    if (fetchError || !quote) {
      return { success: false, error: 'Quotation not found' }
    }

    if (['rejected', 'expired', 'converted'].includes(quote.status)) {
      return { success: false, error: `Cannot modify pricing when quote is ${quote.status}` }
    }

    const dbItems = quote.items || []
    const inputMap = new Map((input.items || []).map((i) => [i.id, i]))

    const pricingInputs = dbItems.map((dbItem: any) => {
      const edited = inputMap.get(dbItem.id)
      const qty = edited?.quantity && edited.quantity >= 1 ? Math.floor(edited.quantity) : dbItem.quantity
      const unitPrice = edited ? Math.max(0, Number(edited.unit_price) || 0) : Math.max(0, Number(dbItem.unit_price) || 0)
      const discPct = edited
        ? Math.min(100, Math.max(0, Number(edited.discount_percentage) || 0))
        : Math.min(100, Math.max(0, Number(dbItem.discount_percentage) || 0))
      return {
        id: dbItem.id,
        quantity: qty,
        unit_price: unitPrice,
        discount_percentage: discPct,
      }
    })

    // General enquiries with 0 product rows can supply a custom consultation/package amount
    const isGeneralNoItems = dbItems.length === 0
    const summaryInputs =
      isGeneralNoItems && (input.customAmountForGeneralEnquiry || 0) > 0
        ? [
            {
              quantity: 1,
              unit_price: Number(input.customAmountForGeneralEnquiry),
              discount_percentage: 0,
            },
          ]
        : pricingInputs

    const totals = calculateQuoteTotals({
      items: summaryInputs,
      overallDiscountType: input.overallDiscountType || 'fixed',
      overallDiscountValue: Number(input.overallDiscountValue) || 0,
      taxEnabled: input.taxEnabled,
      taxRate: Number(input.taxRate) || 0,
    })

    // Persist line item calculations
    for (let idx = 0; idx < pricingInputs.length; idx++) {
      const pi = pricingInputs[idx]
      const calc = totals.items[idx]
      if (!calc) continue

      const { error: itemErr } = await supabase
        .from('quote_items')
        .update({
          quantity: calc.quantity,
          unit_price: calc.unit_price,
          discount_percentage: calc.discount_percentage,
          discount_amount: calc.discount_amount,
          total_price: calc.net_amount,
          line_total: calc.net_amount,
        })
        .eq('id', pi.id)
        .eq('quote_id', quoteId)

      if (itemErr) {
        return { success: false, error: `Failed to update line item: ${itemErr.message}` }
      }
    }

    const nextStatus =
      quote.status === 'submitted' || quote.status === 'pending' ? 'reviewing' : quote.status

    const now = new Date().toISOString()
    const updatePayload: Record<string, any> = {
      subtotal: totals.subtotal,
      discount_total: totals.discount_total,
      overall_discount_type: input.overallDiscountType || 'fixed',
      overall_discount_value: Math.max(0, Number(input.overallDiscountValue) || 0),
      taxable_amount: totals.taxable_amount,
      tax_enabled: input.taxEnabled,
      tax_rate: totals.tax_rate,
      tax_total: totals.tax_total,
      estimated_total: totals.grand_total,
      terms_and_conditions: input.termsAndConditions?.trim() || null,
      admin_response_message: input.customerMessage?.trim() || null,
      admin_internal_notes: input.internalNotes?.trim() || null,
      admin_response_at: input.customerMessage?.trim() ? now : quote.admin_response_at,
      status: nextStatus,
      reviewing_started_at: quote.reviewing_started_at || now,
      reviewing_by: quote.reviewing_by || authCheck.adminUser.user_id,
      updated_at: now,
    }

    const { error: updateErr } = await supabase
      .from('quotes')
      .update(updatePayload)
      .eq('id', quoteId)

    if (updateErr) {
      return { success: false, error: updateErr.message }
    }

    await logQuoteAction(quoteId, 'pricing_updated', {
      actorType: 'admin',
      oldStatus: quote.status,
      newStatus: nextStatus,
      oldTotal: Number(quote.estimated_total) || 0,
      newTotal: totals.grand_total,
      notes: 'Admin saved commercial pricing configuration',
      metadata: {
        subtotal: totals.subtotal,
        discount_total: totals.discount_total,
        tax_rate: totals.tax_rate,
        tax_total: totals.tax_total,
        grand_total: totals.grand_total,
      },
    })

    if ((input.internalNotes || '').trim() !== (quote.admin_internal_notes || '').trim()) {
      await logQuoteAction(quoteId, 'internal_note_added', {
        actorType: 'admin',
        notes: 'Internal admin notes updated',
      })
    }

    revalidatePath('/admin/quotes')
    revalidatePath(`/admin/quotes/${quoteId}`)

    return { success: true, totals }
  } catch (error: any) {
    console.error('Error in saveQuoteCommercialPricing:', error)
    return { success: false, error: error.message || 'Failed to save pricing' }
  }
}

export async function updateQuotePricing(
  quoteId: string,
  pricing: {
    subtotal: number
    discount_total: number
    tax_total: number
    estimated_total: number
  }
): Promise<{ success: boolean; error?: string }> {
  const authCheck = await requireAdmin('manager')
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error }
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('quotes')
    .update({
      ...pricing,
      updated_at: new Date().toISOString(),
    })
    .eq('id', quoteId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/quotes')
  revalidatePath(`/admin/quotes/${quoteId}`)
  return { success: true }
}

export async function updateQuoteItemPricing(
  itemId: string,
  pricing: {
    unit_price: number
    discount_percentage: number
    total_price: number
  }
): Promise<{ success: boolean; error?: string }> {
  const authCheck = await requireAdmin('manager')
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error }
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('quote_items')
    .update({
      ...pricing,
      line_total: pricing.total_price,
    })
    .eq('id', itemId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/quotes')
  return { success: true }
}
