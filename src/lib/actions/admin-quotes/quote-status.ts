'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { revalidatePath } from 'next/cache'
import { QuoteStatus, QuotePriority } from '@/types/b2b/quote'
import { canIssueQuoteStatus } from '@/lib/quote-state-machine'
import { calculateQuoteTotals, formatINR } from '@/lib/utils/quote-pricing'
import {
  generateQuotationPdfBuffer,
  uploadQuotePdfToPrivateStorage,
} from '@/lib/services/quote-pdf'
import {
  dispatchQuoteNotification,
  getVerifiedCompanyConfig,
} from '@/lib/services/quote-notifications'
import { sendQuoteIssuedEmail, sendQuoteRejectedEmail } from '@/lib/services/email'
import { getAppBaseUrl, issueAccessTokenForQuote } from '@/lib/auth/guest-quote-auth'
import { logQuoteAction } from './quote-audit'

/**
 * Update quote review status (Manager+ only).
 * Note: Moving to 'quoted' MUST go through issueQuotation() so PDF & revision are persisted atomically.
 */
export async function updateQuoteStatus(
  quoteId: string,
  status: QuoteStatus,
  adminNotes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const authCheck = await requireAdmin('manager')
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error }
    }

    if (status === 'quoted' || status === 'approved') {
      return {
        success: false,
        error: 'Quotations must be issued via Issue Quotation so the PDF and revision snapshot are generated.',
      }
    }

    const supabase = createAdminClient()
    const { data: currentQuote, error: fetchError } = await supabase
      .from('quotes')
      .select('status, estimated_total, quote_number, reviewing_started_at')
      .eq('id', quoteId)
      .single()

    if (fetchError || !currentQuote) {
      return { success: false, error: 'Quote not found' }
    }

    const now = new Date().toISOString()
    const updateData: Record<string, any> = {
      status,
      updated_at: now,
    }

    if (status === 'reviewing' && !currentQuote.reviewing_started_at) {
      updateData.reviewing_started_at = now
      updateData.reviewing_by = authCheck.adminUser.user_id
    }

    if (adminNotes) {
      updateData.admin_notes = adminNotes
    }

    const { error } = await supabase.from('quotes').update(updateData).eq('id', quoteId)

    if (error) {
      return { success: false, error: error.message }
    }

    await logQuoteAction(
      quoteId,
      status === 'reviewing' ? 'opened_for_review' : 'status_changed',
      {
        actorType: 'admin',
        oldStatus: currentQuote.status,
        newStatus: status,
        notes: adminNotes,
        metadata: { quote_number: currentQuote.quote_number },
      }
    )

    revalidatePath('/admin/quotes')
    revalidatePath(`/admin/quotes/${quoteId}`)
    return { success: true }
  } catch (error: any) {
    console.error('Error in updateQuoteStatus:', error)
    return { success: false, error: error.message || 'Failed to update status' }
  }
}

export interface IssueQuotationOptions {
  validUntilDays?: number
  termsAndConditions?: string
  customerMessage?: string
  internalNotes?: string
  taxEnabled?: boolean
  taxRate?: number
  overallDiscountType?: 'fixed' | 'percentage'
  overallDiscountValue?: number
  notifyCustomer?: boolean
  customAmountForGeneralEnquiry?: number
}

/**
 * Revision-Aware Quotation Issuance (Manager+ only):
 * 1. Validates admin permission & commercial/tax config
 * 2. Recalculates authoritative totals server-side (integer paise)
 * 3. Generates official A4 PDF & uploads to private storage + verifies downloadability
 * 4. Creates immutable quote_revisions snapshot (preserving all previous revisions)
 * 5. Updates status to 'quoted' & logs audit events
 * 6. Sends Customer Quotation Issued email via outbox
 */
export async function issueQuotation(
  quoteId: string,
  options: IssueQuotationOptions = {}
): Promise<{
  success: boolean
  revisionNumber?: number
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

    if (!canIssueQuoteStatus(quote.status)) {
      return {
        success: false,
        error: `Cannot issue a quotation in "${quote.status}" state.`,
      }
    }

    // 1. Validate verified business & tax configuration
    const { storeSettings, taxSettings } = await getVerifiedCompanyConfig()
    if (!storeSettings || !storeSettings.store_name) {
      return {
        success: false,
        error: 'Company settings are missing. Configure Store Settings before issuing quotations.',
      }
    }

    const taxEnabled =
      options.taxEnabled !== undefined
        ? options.taxEnabled
        : quote.tax_enabled !== undefined && quote.tax_enabled !== null
          ? Boolean(quote.tax_enabled)
          : Boolean(taxSettings?.gst_enabled)

    const configuredTaxRate =
      options.taxRate !== undefined
        ? Number(options.taxRate)
        : Number(quote.tax_rate) > 0
          ? Number(quote.tax_rate)
          : Number(taxSettings?.default_gst_percentage || 0)

    if (taxEnabled && (!Number.isFinite(configuredTaxRate) || configuredTaxRate <= 0)) {
      return {
        success: false,
        error: 'GST rate must be configured (> 0%) when GST is enabled before issuing a quotation.',
      }
    }

    // 2. Validate line item pricing
    const items = quote.items || []
    if (items.length > 0) {
      const unpriced = items.find((i: any) => !i.unit_price || Number(i.unit_price) <= 0)
      if (unpriced) {
        return {
          success: false,
          error: `Please enter a valid unit price (> 0) for "${unpriced.product_name}" and save pricing before issuing.`,
        }
      }
    } else if (
      (!options.customAmountForGeneralEnquiry || options.customAmountForGeneralEnquiry <= 0) &&
      (!quote.estimated_total || Number(quote.estimated_total) <= 0)
    ) {
      return {
        success: false,
        error: 'For a general enquiry without catalog items, enter a quoted package/consultation amount (> 0) before issuing.',
      }
    }

    const overallDiscType =
      options.overallDiscountType || (quote.overall_discount_type as any) || 'fixed'
    const overallDiscVal =
      options.overallDiscountValue !== undefined
        ? Number(options.overallDiscountValue)
        : Number(quote.overall_discount_value || 0)

    const summaryInputs =
      items.length > 0
        ? items.map((i: any) => ({
            id: i.id,
            quantity: Number(i.quantity) || 1,
            unit_price: Number(i.unit_price) || 0,
            discount_percentage: Number(i.discount_percentage) || 0,
          }))
        : [
            {
              quantity: 1,
              unit_price: Number(options.customAmountForGeneralEnquiry || quote.subtotal || quote.estimated_total || 0),
              discount_percentage: 0,
            },
          ]

    const totals = calculateQuoteTotals({
      items: summaryInputs,
      overallDiscountType: overallDiscType,
      overallDiscountValue: overallDiscVal,
      taxEnabled,
      taxRate: configuredTaxRate,
    })

    if (totals.grand_total <= 0) {
      return { success: false, error: 'Quotation grand total must be greater than 0.' }
    }

    // 3. Determine revision & validity
    const { data: latestRev } = await supabase
      .from('quote_revisions')
      .select('revision_number')
      .eq('quote_id', quoteId)
      .order('revision_number', { ascending: false })
      .limit(1)
      .maybeSingle()

    const isReissue = (quote.current_revision || 0) > 0 || quote.status === 'quoted' || quote.status === 'approved'
    const nextRevision = Math.max(Number(quote.current_revision || 0), Number(latestRev?.revision_number || 0)) + 1

    const validityDays = Math.min(
      365,
      Math.max(1, Number(options.validUntilDays || storeSettings.default_quote_validity_days || 30))
    )
    const issuedAt = new Date()
    const validUntil = new Date(issuedAt.getTime() + validityDays * 24 * 60 * 60 * 1000)

    const termsText =
      options.termsAndConditions !== undefined
        ? options.termsAndConditions.trim()
        : quote.terms_and_conditions || storeSettings.quote_terms_and_conditions || ''

    const customerMessage =
      options.customerMessage !== undefined
        ? options.customerMessage.trim()
        : quote.admin_response_message || ''

    const companySnapshot = {
      name: (storeSettings.store_name || 'Cedar Elevators Industries').trim(),
      addressLine1: storeSettings.address_line1 || '',
      addressLine2: storeSettings.address_line2 || null,
      cityStatePin: [storeSettings.city, storeSettings.state, storeSettings.postal_code]
        .filter(Boolean)
        .join(', '),
      country: storeSettings.country || 'India',
      phone: storeSettings.support_phone || '',
      email: storeSettings.support_email || '',
      gstin: taxSettings?.store_gstin || storeSettings.gst_number || null,
    }

    const customerSnapshot = {
      name: quote.requester_name || quote.guest_name || 'Customer',
      email: quote.requester_email || quote.guest_email || '',
      phone: quote.requester_phone || quote.guest_phone || '',
      companyName: quote.company_name || null,
      gstNumber: quote.gst_number || null,
      projectName: quote.project_name || null,
      projectLocation: quote.project_location || null,
    }

    const itemsSnapshot =
      items.length > 0
        ? items.map((item: any, idx: number) => {
            const calc = totals.items[idx]
            return {
              id: item.id,
              productName: item.product_name,
              sku: item.variant_sku || item.product_sku || null,
              variantTitle: item.variant_title || null,
              specifications: item.specifications || null,
              quantity: calc?.quantity ?? item.quantity,
              unitPrice: calc?.unit_price ?? Number(item.unit_price || 0),
              discountPercentage: calc?.discount_percentage ?? Number(item.discount_percentage || 0),
              discountAmount: calc?.discount_amount ?? 0,
              lineTotal: calc?.net_amount ?? Number(item.total_price || 0),
            }
          })
        : [
            {
              id: null,
              productName: 'Custom Engineering / General Quotation',
              sku: null,
              variantTitle: null,
              specifications: null,
              quantity: 1,
              unitPrice: totals.subtotal,
              discountPercentage: 0,
              discountAmount: 0,
              lineTotal: totals.subtotal,
            },
          ]

    // 4. Generate official PDF and verify private storage persistence BEFORE marking 'quoted'
    const pdfBuffer = generateQuotationPdfBuffer({
      quoteNumber: quote.quote_number,
      revisionNumber: nextRevision,
      issuedAt: issuedAt.toISOString(),
      validUntil: validUntil.toISOString(),
      currency: quote.currency || 'INR',
      company: companySnapshot,
      customer: customerSnapshot,
      items: itemsSnapshot,
      subtotal: totals.subtotal,
      discountTotal: totals.discount_total,
      taxableAmount: totals.taxable_amount,
      taxEnabled,
      taxRate: totals.tax_rate,
      taxTotal: totals.tax_total,
      grandTotal: totals.grand_total,
      customerMessage: customerMessage || null,
      termsAndConditions: termsText || null,
    })

    const uploadedPdf = await uploadQuotePdfToPrivateStorage({
      quoteId,
      revisionNumber: nextRevision,
      pdfBuffer,
    })

    // 5. Persist immutable quote revision row
    const { error: revError } = await supabase.from('quote_revisions').insert({
      quote_id: quoteId,
      revision_number: nextRevision,
      status: 'issued',
      subtotal: totals.subtotal,
      discount_total: totals.discount_total,
      taxable_amount: totals.taxable_amount,
      tax_rate: totals.tax_rate,
      tax_total: totals.tax_total,
      grand_total: totals.grand_total,
      currency: quote.currency || 'INR',
      valid_until: validUntil.toISOString(),
      terms_and_conditions: termsText || null,
      customer_message: customerMessage || null,
      company_snapshot: companySnapshot,
      customer_snapshot: customerSnapshot,
      items_snapshot: itemsSnapshot,
      pdf_storage_bucket: uploadedPdf.bucket,
      pdf_storage_path: uploadedPdf.path,
      pdf_size_bytes: uploadedPdf.sizeBytes,
      pdf_sha256: uploadedPdf.sha256,
      issued_by: authCheck.adminUser.user_id,
      issued_by_name:
        authCheck.adminUser.display_name || authCheck.adminUser.full_name || authCheck.adminUser.email,
      issued_at: issuedAt.toISOString(),
    })

    if (revError) {
      throw new Error(`Failed to persist quote revision: ${revError.message}`)
    }

    // 6. Update quote header cleanly to 'quoted'
    const { error: quoteUpdateError } = await supabase
      .from('quotes')
      .update({
        status: 'quoted',
        subtotal: totals.subtotal,
        discount_total: totals.discount_total,
        overall_discount_type: overallDiscType,
        overall_discount_value: overallDiscVal,
        taxable_amount: totals.taxable_amount,
        tax_enabled: taxEnabled,
        tax_rate: totals.tax_rate,
        tax_total: totals.tax_total,
        estimated_total: totals.grand_total,
        terms_and_conditions: termsText || null,
        admin_response_message: customerMessage || null,
        admin_internal_notes:
          options.internalNotes !== undefined
            ? options.internalNotes.trim() || null
            : quote.admin_internal_notes,
        admin_response_at: issuedAt.toISOString(),
        issued_by: authCheck.adminUser.user_id,
        issued_at: issuedAt.toISOString(),
        approved_by: authCheck.adminUser.user_id,
        approved_at: issuedAt.toISOString(),
        valid_until: validUntil.toISOString(),
        expired_at: null,
        current_revision: nextRevision,
        latest_pdf_path: uploadedPdf.path,
        updated_at: issuedAt.toISOString(),
      })
      .eq('id', quoteId)

    if (quoteUpdateError) {
      throw new Error(`Failed to update quote status: ${quoteUpdateError.message}`)
    }

    // 7. Audit events
    await logQuoteAction(quoteId, 'pdf_generated', {
      actorType: 'admin',
      notes: `Generated Quotation PDF Revision ${nextRevision}`,
      metadata: {
        revision_number: nextRevision,
        pdf_path: uploadedPdf.path,
        pdf_sha256: uploadedPdf.sha256,
      },
    })

    await logQuoteAction(quoteId, isReissue ? 'reissued' : 'issued', {
      actorType: 'admin',
      oldStatus: quote.status,
      newStatus: 'quoted',
      oldTotal: Number(quote.estimated_total) || 0,
      newTotal: totals.grand_total,
      notes: `Issued quotation Rev ${nextRevision} valid until ${validUntil.toLocaleDateString('en-IN')}`,
      metadata: {
        quote_number: quote.quote_number,
        revision_number: nextRevision,
        valid_until: validUntil.toISOString(),
        grand_total: totals.grand_total,
      },
    })

    // 8. Notify customer via outbox with fresh secure token & PDF download link
    const recipientEmail = (quote.requester_email || quote.guest_email || '').trim().toLowerCase()
    if (recipientEmail && options.notifyCustomer !== false) {
      const rawToken = await issueAccessTokenForQuote(quoteId)
      const baseUrl = getAppBaseUrl()

      await dispatchQuoteNotification({
        quoteId,
        revisionNumber: nextRevision,
        eventType: 'customer_quote_issued',
        recipientEmail,
        subject: `Your Cedar Elevators quotation is ready — ${quote.quote_number}`,
        dedupeKey: `customer_quote_issued:${quoteId}:rev:${nextRevision}`,
        payload: {
          quoteNumber: quote.quote_number,
          revisionNumber: nextRevision,
          grandTotal: totals.grand_total,
        },
        sendFn: () =>
          sendQuoteIssuedEmail(recipientEmail, {
            quoteNumber: quote.quote_number,
            revisionNumber: nextRevision,
            customerName: customerSnapshot.name,
            issuedDate: issuedAt.toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
            validUntil: validUntil.toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
            grandTotalFormatted: formatINR(totals.grand_total),
            adminMessage: customerMessage || null,
            viewUrl: `${baseUrl}/quotes/view/${rawToken}`,
            pdfUrl: `${baseUrl}/api/quotes/view/${rawToken}/pdf`,
            supportEmail: storeSettings.support_email,
            supportPhone: storeSettings.support_phone,
          }),
      })
    }

    revalidatePath('/admin/quotes')
    revalidatePath(`/admin/quotes/${quoteId}`)

    return { success: true, revisionNumber: nextRevision }
  } catch (error: any) {
    console.error('Error in issueQuotation:', error)
    return { success: false, error: error.message || 'Failed to issue quotation' }
  }
}

/**
 * Legacy compatibility alias -> delegates to issueQuotation()
 */
export async function approveQuote(
  quoteId: string,
  options: {
    validUntilDays?: number
    adminNotes?: string
  } = {}
): Promise<{ success: boolean; error?: string }> {
  return issueQuotation(quoteId, {
    validUntilDays: options.validUntilDays,
    customerMessage: options.adminNotes,
  })
}

/**
 * Reject quote (Manager+ only)
 */
export async function rejectQuote(
  quoteId: string,
  reason: string,
  notifyCustomer: boolean = true
): Promise<{ success: boolean; error?: string }> {
  try {
    const authCheck = await requireAdmin('manager')
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error }
    }

    if (!reason || reason.trim().length < 3) {
      return { success: false, error: 'Rejection reason is required (at least 3 characters).' }
    }

    const supabase = createAdminClient()

    const { data: quote, error: fetchError } = await supabase
      .from('quotes')
      .select('status, quote_number, guest_email, requester_email, guest_name, requester_name')
      .eq('id', quoteId)
      .single()

    if (fetchError || !quote) {
      return { success: false, error: 'Quote not found' }
    }

    if (['rejected', 'expired', 'converted'].includes(quote.status)) {
      return { success: false, error: `Quote is already ${quote.status}` }
    }

    const now = new Date().toISOString()
    const { error: updateError } = await supabase
      .from('quotes')
      .update({
        status: 'rejected',
        rejected_reason: reason.trim(),
        rejected_at: now,
        rejected_by: authCheck.adminUser.user_id,
        updated_at: now,
      })
      .eq('id', quoteId)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    await logQuoteAction(quoteId, 'rejected', {
      actorType: 'admin',
      oldStatus: quote.status,
      newStatus: 'rejected',
      notes: reason.trim(),
      metadata: { quote_number: quote.quote_number },
    })

    const customerEmail = (quote.requester_email || quote.guest_email || '').trim().toLowerCase()
    const customerName = quote.requester_name || quote.guest_name || 'Customer'
    if (customerEmail && notifyCustomer) {
      await dispatchQuoteNotification({
        quoteId,
        eventType: 'customer_quote_rejected',
        recipientEmail: customerEmail,
        subject: `Quote ${quote.quote_number} Update - Cedar Elevators`,
        dedupeKey: `customer_quote_rejected:${quoteId}`,
        payload: { quoteNumber: quote.quote_number, reason: reason.trim() },
        sendFn: async () => {
          const res = await sendQuoteRejectedEmail(customerEmail, {
            quoteNumber: quote.quote_number,
            customerName,
            reason: reason.trim(),
          })
          return { success: res.success, error: res.error }
        },
      })
    }

    revalidatePath('/admin/quotes')
    revalidatePath(`/admin/quotes/${quoteId}`)
    return { success: true }
  } catch (error: any) {
    console.error('Error in rejectQuote:', error)
    return { success: false, error: error.message || 'Failed to reject quote' }
  }
}

export async function updateQuotePriority(
  quoteId: string,
  priority: QuotePriority
): Promise<{ success: boolean; error?: string }> {
  try {
    const authCheck = await requireAdmin('manager')
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error }
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('quotes')
      .update({ priority, updated_at: new Date().toISOString() })
      .eq('id', quoteId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/quotes')
    revalidatePath(`/admin/quotes/${quoteId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update priority' }
  }
}
