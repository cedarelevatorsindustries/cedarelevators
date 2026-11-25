import { isIssuedQuoteStatus } from '@/lib/quote-state-machine'
import type { SanitizedCustomerQuote } from '@/modules/quote/components/customer-quote-view'

/**
 * Strips private admin metadata and conceals unissued pricing before returning a quote to customer views.
 */
export function buildSanitizedCustomerQuote(
  quote: any,
  latestRevision?: any | null
): SanitizedCustomerQuote {
  const showPricing =
    isIssuedQuoteStatus(quote.status) ||
    (quote.status === 'expired' && Number(quote.current_revision || 0) > 0)

  return {
    id: quote.id,
    quote_number: quote.quote_number,
    status: quote.status,
    request_type: quote.request_type || 'general',
    created_at: quote.created_at,
    issued_at: showPricing ? latestRevision?.issued_at || quote.issued_at || null : null,
    valid_until: showPricing ? latestRevision?.valid_until || quote.valid_until || null : null,
    current_revision: Number(quote.current_revision || 0),
    requester_name: quote.requester_name || quote.guest_name || 'Customer',
    requester_email: quote.requester_email || quote.guest_email || '',
    requester_phone: quote.requester_phone || quote.guest_phone || '',
    company_name: quote.company_name || null,
    gst_number: quote.gst_number || null,
    project_name: quote.project_name || null,
    project_location: quote.project_location || null,
    notes: quote.notes || null,
    rejected_reason: quote.status === 'rejected' ? quote.rejected_reason || null : null,
    admin_response_message: showPricing ? quote.admin_response_message || null : null,
    terms_and_conditions: showPricing
      ? latestRevision?.terms_and_conditions || quote.terms_and_conditions || null
      : null,
    show_pricing: showPricing,
    subtotal: showPricing ? Number(latestRevision?.subtotal ?? quote.subtotal ?? 0) : null,
    discount_total: showPricing
      ? Number(latestRevision?.discount_total ?? quote.discount_total ?? 0)
      : null,
    taxable_amount: showPricing
      ? Number(latestRevision?.taxable_amount ?? quote.taxable_amount ?? 0)
      : null,
    tax_enabled: showPricing ? Boolean(quote.tax_enabled ?? Number(quote.tax_total || 0) > 0) : false,
    tax_rate: showPricing ? Number(latestRevision?.tax_rate ?? quote.tax_rate ?? 18) : null,
    tax_total: showPricing ? Number(latestRevision?.tax_total ?? quote.tax_total ?? 0) : null,
    grand_total: showPricing
      ? Number(latestRevision?.grand_total ?? quote.estimated_total ?? 0)
      : null,
    currency: quote.currency || 'INR',
    items: (quote.items || []).map((item: any) => ({
      id: item.id,
      product_name: item.product_name,
      product_sku: item.variant_sku || item.product_sku || null,
      product_thumbnail: item.product_thumbnail || null,
      variant_title: item.variant_title || null,
      specifications: item.specifications || null,
      quantity: item.quantity,
      unit_price: showPricing && item.unit_price !== null ? Number(item.unit_price) : null,
      discount_percentage:
        showPricing && item.discount_percentage !== null ? Number(item.discount_percentage) : null,
      line_total:
        showPricing && (item.line_total !== null || item.total_price !== null)
          ? Number(item.line_total ?? item.total_price)
          : null,
    })),
  }
}
