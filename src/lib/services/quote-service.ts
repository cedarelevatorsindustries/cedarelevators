import { createAdminClient } from '@/lib/supabase/server'
import { unifiedQuoteSchema } from '@/modules/quote/forms/quote-schema'
import {
  createAccessTokenPayload,
  getAppBaseUrl,
  normalizeEmail,
} from '@/lib/auth/guest-quote-auth'
import {
  dispatchQuoteNotification,
  getVerifiedCompanyConfig,
} from '@/lib/services/quote-notifications'
import {
  sendAdminNewQuoteAlertEmail,
  sendQuoteSubmissionConfirmationEmail,
} from '@/lib/services/email'

export type SubmitQuoteResult =
  | {
      success: true
      quoteId: string
      quoteNumber: string
      itemsCount: number
      requestType: 'general' | 'single' | 'bulk'
      duplicate: boolean
      emailStatus: 'sent' | 'failed'
      submittedAt: string
      message: string
    }
  | {
      success: false
      status: number
      error: string
      details?: Record<string, string[]>
    }

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function submitUnifiedQuote(rawInput: any): Promise<SubmitQuoteResult> {
  const parseResult = unifiedQuoteSchema.safeParse(rawInput)
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors
    const firstMsg = Object.values(fieldErrors).flat().find(Boolean)
    return {
      success: false,
      status: 400,
      error: firstMsg || 'Please check the highlighted form fields.',
      details: fieldErrors as Record<string, string[]>,
    }
  }

  const valid = parseResult.data
  const supabase = createAdminClient()

  // Normalize submitted items (filter empty rows)
  const rawItems = (valid.items || []).filter(
    (item) => item && typeof item.product_id === 'string' && item.product_id.trim().length > 0
  )

  // Validate product IDs & resolve authoritative DB snapshots
  const resolvedItems: Array<{
    product_id: string
    variant_id: string | null
    quantity: number
    product_name: string
    product_sku: string | null
    product_thumbnail: string | null
    variant_title: string | null
    variant_sku: string | null
    specifications: Record<string, any> | null
  }> = []

  if (rawItems.length > 0) {
    const uniqueProductIds = Array.from(new Set(rawItems.map((i) => i.product_id.trim())))

    for (const pid of uniqueProductIds) {
      if (!UUID_REGEX.test(pid)) {
        return {
          success: false,
          status: 400,
          error: 'One or more selected products are invalid.',
        }
      }
    }

    const { data: dbProducts, error: productsError } = await supabase
      .from('products')
      .select('id, name, sku, thumbnail_url, status, specifications, technical_specs')
      .in('id', uniqueProductIds)

    if (productsError) {
      console.error('[QuoteService] Product lookup error:', productsError)
      return {
        success: false,
        status: 500,
        error: 'Unable to verify selected products right now.',
      }
    }

    const productMap = new Map((dbProducts || []).map((p: any) => [p.id, p]))

    // Verify every requested product exists and is active
    for (const pid of uniqueProductIds) {
      const prod = productMap.get(pid)
      if (!prod || prod.status !== 'active') {
        return {
          success: false,
          status: 400,
          error: `Selected product (${prod?.name || pid}) is currently unavailable for quotation.`,
        }
      }
    }

    // Fetch variants if any non-product-fallback variant IDs were passed
    const candidateVariantIds = Array.from(
      new Set(
        rawItems
          .map((i) => i.variant_id?.trim())
          .filter(
            (vid): vid is string =>
              Boolean(vid) && !uniqueProductIds.includes(vid!)
          )
      )
    )

    for (const vid of candidateVariantIds) {
      if (!UUID_REGEX.test(vid)) {
        return {
          success: false,
          status: 400,
          error: 'One or more selected product variants are invalid.',
        }
      }
    }

    let variantMap = new Map<string, any>()
    if (candidateVariantIds.length > 0) {
      const { data: dbVariants, error: variantsError } = await supabase
        .from('product_variants')
        .select('id, product_id, name, sku, variant_title, options, status')
        .in('id', candidateVariantIds)

      if (variantsError) {
        console.error('[QuoteService] Variant lookup error:', variantsError)
        return {
          success: false,
          status: 500,
          error: 'Unable to verify selected product variants right now.',
        }
      }

      variantMap = new Map((dbVariants || []).map((v: any) => [v.id, v]))
    }

    // Merge duplicate product+variant rows cleanly while summing quantities
    const mergedMap = new Map<string, (typeof resolvedItems)[number]>()

    for (const item of rawItems) {
      const pid = item.product_id.trim()
      const prod = productMap.get(pid)
      const rawVid = item.variant_id?.trim() || null
      // ProductCard uses product.id as placeholder variantId when no variants exist
      const effectiveVid = rawVid && rawVid !== pid ? rawVid : null

      let variantRecord: any = null
      if (effectiveVid) {
        variantRecord = variantMap.get(effectiveVid)
        if (!variantRecord || variantRecord.product_id !== pid || variantRecord.status === 'inactive') {
          return {
            success: false,
            status: 400,
            error: `Selected variant is no longer available for ${prod.name}.`,
          }
        }
      }

      const mergeKey = `${pid}::${effectiveVid || 'base'}`
      const existingMerged = mergedMap.get(mergeKey)
      if (existingMerged) {
        existingMerged.quantity = Math.min(10000, existingMerged.quantity + item.quantity)
        continue
      }

      const variantTitle = variantRecord
        ? variantRecord.variant_title ||
          (variantRecord.options && typeof variantRecord.options === 'object'
            ? Object.values(variantRecord.options).filter(Boolean).join(' / ')
            : null) ||
          variantRecord.name ||
          null
        : null

      const specsSnapshot: Record<string, any> | null = (() => {
        const merged: Record<string, any> = {}
        if (prod.specifications && typeof prod.specifications === 'object' && !Array.isArray(prod.specifications)) {
          Object.assign(merged, prod.specifications)
        }
        if (prod.technical_specs && typeof prod.technical_specs === 'object' && !Array.isArray(prod.technical_specs)) {
          Object.assign(merged, prod.technical_specs)
        }
        if (variantRecord?.options && typeof variantRecord.options === 'object') {
          Object.assign(merged, variantRecord.options)
        }
        return Object.keys(merged).length > 0 ? merged : null
      })()

      mergedMap.set(mergeKey, {
        product_id: pid,
        variant_id: effectiveVid,
        quantity: item.quantity,
        product_name: prod.name,
        product_sku: prod.sku || null,
        product_thumbnail: prod.thumbnail_url || null,
        variant_title: variantTitle,
        variant_sku: variantRecord?.sku || null,
        specifications: specsSnapshot,
      })
    }

    resolvedItems.push(...mergedMap.values())
  }

  const distinctProductCount = new Set(resolvedItems.map((i) => i.product_id)).size
  const requestType: 'general' | 'single' | 'bulk' =
    distinctProductCount >= 2 ? 'bulk' : distinctProductCount === 1 ? 'single' : 'general'

  // Authoritative server-side enforcement of conditional company rule
  if (requestType === 'bulk' && (!valid.company_name || valid.company_name.trim().length < 2)) {
    return {
      success: false,
      status: 400,
      error: 'Company name is required for bulk quotation requests with 2 or more products.',
      details: {
        company_name: ['Company name is required for bulk quotation requests with 2 or more products.'],
      },
    }
  }

  // Generate individual access token before atomic commit
  const { rawToken, tokenHash, expiresAtIso } = createAccessTokenPayload()
  const emailNorm = normalizeEmail(valid.email)

  const { data: rpcResult, error: rpcError } = await supabase.rpc('create_quote_atomic', {
    p_name: valid.name.trim(),
    p_email: emailNorm,
    p_phone: valid.phone.trim(),
    p_company_name: valid.company_name?.trim() || null,
    p_gst_number: valid.gst_number?.trim() ? valid.gst_number.trim().toUpperCase() : null,
    p_project_name: valid.project_name?.trim() || null,
    p_project_location: valid.project_location?.trim() || null,
    p_notes: valid.notes?.trim() || null,
    p_request_type: requestType,
    p_items: resolvedItems,
    p_access_token_hash: tokenHash,
    p_access_token_expires_at: expiresAtIso,
    p_idempotency_key: valid.idempotency_key?.trim() || null,
  })

  if (rpcError || !rpcResult) {
    console.error('[QuoteService] Atomic creation RPC failed:', rpcError)
    return {
      success: false,
      status: 500,
      error: 'Unable to submit your quotation request right now. Please try again.',
    }
  }

  const quoteId: string = rpcResult.quote_id
  const quoteNumber: string = rpcResult.quote_number
  const itemsCount: number = Number(rpcResult.items_count ?? resolvedItems.length)
  const isDuplicate = Boolean(rpcResult.duplicate)

  // Dispatch emails only for newly created quotes (never duplicate alerts on idempotent retries)
  const submittedAt = new Date().toISOString()
  let emailStatus: 'sent' | 'failed' = 'sent'

  if (!isDuplicate) {
    const { storeSettings, adminRecipient } = await getVerifiedCompanyConfig()
    const baseUrl = getAppBaseUrl()
    const adminBaseUrl =
      process.env.NEXT_PUBLIC_ADMIN_URL?.replace(/\/+$/, '') || `${baseUrl}/admin`
    const submittedDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

    // Fire both outbox notifications cleanly without letting email failure fail quote creation
    const [customerNotifResult] = await Promise.allSettled([
      dispatchQuoteNotification({
        quoteId,
        eventType: 'customer_submission_confirmation',
        recipientEmail: emailNorm,
        subject: `We received your quotation request — ${quoteNumber}`,
        dedupeKey: `customer_submission_confirmation:${quoteId}`,
        payload: { quoteNumber, requestType, itemsCount },
        sendFn: () =>
          sendQuoteSubmissionConfirmationEmail(emailNorm, {
            quoteNumber,
            customerName: valid.name.trim(),
            companyName: valid.company_name?.trim() || null,
            submittedDate,
            requestType,
            items: resolvedItems.map((i) => ({
              product_name: i.product_name,
              variant_title: i.variant_title,
              quantity: i.quantity,
            })),
            viewUrl: `${baseUrl}/quotes/view/${rawToken}`,
            trackUrl: `${baseUrl}/quotes/track`,
            supportEmail: storeSettings?.support_email,
            supportPhone: storeSettings?.support_phone,
          }),
      }),
      adminRecipient
        ? dispatchQuoteNotification({
            quoteId,
            eventType: 'admin_new_quote_alert',
            recipientEmail: adminRecipient,
            subject: `New Quotation Request — ${quoteNumber}`,
            dedupeKey: `admin_new_quote_alert:${quoteId}`,
            payload: { quoteNumber, requestType, itemsCount },
            sendFn: () =>
              sendAdminNewQuoteAlertEmail(adminRecipient, {
                quoteId,
                quoteNumber,
                customerName: valid.name.trim(),
                companyName: valid.company_name?.trim() || null,
                email: emailNorm,
                phone: valid.phone.trim(),
                requestType,
                itemsCount,
                submittedDate,
                adminQuoteUrl: `${adminBaseUrl}/quotes/${quoteId}`,
              }),
          })
        : Promise.resolve(),
    ])

    if (
      customerNotifResult.status === 'rejected' ||
      (customerNotifResult.status === 'fulfilled' && !customerNotifResult.value.success)
    ) {
      emailStatus = 'failed'
    }
  }

  return {
    success: true,
    quoteId,
    quoteNumber,
    itemsCount,
    requestType,
    duplicate: isDuplicate,
    emailStatus,
    submittedAt,
    message:
      'Your quotation request has been submitted. Our engineering team will review your requirements.',
  }
}
