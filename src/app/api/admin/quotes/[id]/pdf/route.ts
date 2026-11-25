import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createAdminClient } from '@/lib/supabase/server'
import {
  downloadQuotePdfFromStorage,
  generateQuotationPdfBuffer,
} from '@/lib/services/quote-pdf'
import { getVerifiedCompanyConfig } from '@/lib/services/quote-notifications'
import { calculateQuoteTotals } from '@/lib/utils/quote-pricing'
import { logQuoteAction } from '@/lib/actions/admin-quotes/quote-audit'

/**
 * Admin Quotation PDF Route:
 * - ?revision=N -> downloads preserved PDF for revision N from private storage
 * - ?preview=1  -> generates live preview PDF from current quote/pricing state without issuing
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await requireAdmin('staff')
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const { id: quoteId } = await params
    const searchParams = request.nextUrl.searchParams
    const preview = searchParams.get('preview') === '1'
    const revisionParam = searchParams.get('revision')

    const supabase = createAdminClient()

    const { data: quote, error } = await supabase
      .from('quotes')
      .select('*, items:quote_items(*)')
      .eq('id', quoteId)
      .single()

    if (error || !quote) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 })
    }

    // If not previewing and a revision exists in private storage, stream the exact preserved PDF
    if (!preview) {
      let revQuery = supabase
        .from('quote_revisions')
        .select('revision_number, pdf_storage_path')
        .eq('quote_id', quoteId)

      if (revisionParam && !isNaN(parseInt(revisionParam, 10))) {
        revQuery = revQuery.eq('revision_number', parseInt(revisionParam, 10))
      } else {
        revQuery = revQuery.order('revision_number', { ascending: false }).limit(1)
      }

      const { data: revision } = await revQuery.maybeSingle()

      if (revision?.pdf_storage_path) {
        const pdfBuffer = await downloadQuotePdfFromStorage(revision.pdf_storage_path)
        const filename = `${quote.quote_number}-Rev${revision.revision_number}.pdf`
        return new NextResponse(new Uint8Array(pdfBuffer), {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${filename}"`,
            'Cache-Control': 'private, no-store',
          },
        })
      }
    }

    // Generate live preview PDF (or fallback for legacy approved quote without stored PDF)
    const { storeSettings, taxSettings } = await getVerifiedCompanyConfig()
    const items = quote.items || []
    const taxEnabled =
      quote.tax_enabled !== undefined && quote.tax_enabled !== null
        ? Boolean(quote.tax_enabled)
        : Boolean(taxSettings?.gst_enabled)
    const taxRate =
      Number(quote.tax_rate) > 0
        ? Number(quote.tax_rate)
        : Number(taxSettings?.default_gst_percentage || 0)

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
              unit_price: Number(quote.subtotal || quote.estimated_total || 0),
              discount_percentage: 0,
            },
          ]

    const totals = calculateQuoteTotals({
      items: summaryInputs,
      overallDiscountType: (quote.overall_discount_type as any) || 'fixed',
      overallDiscountValue: Number(quote.overall_discount_value || 0),
      taxEnabled,
      taxRate,
    })

    const validUntil =
      quote.valid_until ||
      new Date(
        Date.now() + Number(storeSettings?.default_quote_validity_days || 30) * 86400000
      ).toISOString()

    const pdfBuffer = generateQuotationPdfBuffer({
      quoteNumber: quote.quote_number,
      revisionNumber: Number(quote.current_revision || 0) + (preview ? 1 : 0) || 1,
      issuedAt: quote.issued_at || new Date().toISOString(),
      validUntil,
      currency: quote.currency || 'INR',
      company: {
        name: (storeSettings?.store_name || 'Cedar Elevators Industries').trim(),
        addressLine1: storeSettings?.address_line1 || '',
        addressLine2: storeSettings?.address_line2 || null,
        cityStatePin: [storeSettings?.city, storeSettings?.state, storeSettings?.postal_code]
          .filter(Boolean)
          .join(', '),
        country: storeSettings?.country || 'India',
        phone: storeSettings?.support_phone || '',
        email: storeSettings?.support_email || '',
        gstin: taxSettings?.store_gstin || storeSettings?.gst_number || null,
      },
      customer: {
        name: quote.requester_name || quote.guest_name || 'Customer',
        email: quote.requester_email || quote.guest_email || '',
        phone: quote.requester_phone || quote.guest_phone || '',
        companyName: quote.company_name || null,
        gstNumber: quote.gst_number || null,
        projectName: quote.project_name || null,
        projectLocation: quote.project_location || null,
      },
      items:
        items.length > 0
          ? items.map((item: any, idx: number) => {
              const calc = totals.items[idx]
              return {
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
            ],
      subtotal: totals.subtotal,
      discountTotal: totals.discount_total,
      taxableAmount: totals.taxable_amount,
      taxEnabled,
      taxRate: totals.tax_rate,
      taxTotal: totals.tax_total,
      grandTotal: totals.grand_total,
      customerMessage: quote.admin_response_message || null,
      termsAndConditions:
        quote.terms_and_conditions || storeSettings?.quote_terms_and_conditions || null,
      isDraft: preview || Number(quote.current_revision || 0) === 0,
    })

    if (preview) {
      await logQuoteAction(quoteId, 'pdf_generated', {
        actorType: 'admin',
        notes: 'Admin generated Draft Quotation PDF preview',
        metadata: { preview: true, quote_number: quote.quote_number },
      })
    }

    const suffix = preview ? '-DRAFT-PREVIEW' : ''
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${quote.quote_number}${suffix}.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (err: any) {
    console.error('[AdminQuotePDF] Error:', err)
    return NextResponse.json({ error: err?.message || 'Failed to generate PDF' }, { status: 500 })
  }
}
