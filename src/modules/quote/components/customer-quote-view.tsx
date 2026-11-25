'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Download,
  FileText,
  Package,
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { getCustomerStatusInfo } from '@/lib/quote-state-machine'
import { formatINR } from '@/lib/utils/quote-pricing'
import { QuotationPageShell } from './shared/quotation-page-shell'
import { QuotationStatusBadge } from './shared/quotation-status-badge'
import { formatIndiaDate } from './shared/quote-confirmation-storage'

export interface SanitizedCustomerQuote {
  id: string
  quote_number: string
  status: string
  request_type: string
  created_at: string
  issued_at: string | null
  valid_until: string | null
  current_revision: number
  requester_name: string
  requester_email: string
  requester_phone: string
  company_name: string | null
  gst_number: string | null
  project_name: string | null
  project_location: string | null
  notes: string | null
  rejected_reason: string | null
  admin_response_message: string | null
  terms_and_conditions: string | null
  show_pricing: boolean
  subtotal: number | null
  discount_total: number | null
  taxable_amount: number | null
  tax_enabled: boolean
  tax_rate: number | null
  tax_total: number | null
  grand_total: number | null
  currency: string
  items: Array<{
    id: string
    product_name: string
    product_sku: string | null
    product_thumbnail: string | null
    variant_title: string | null
    specifications: Record<string, any> | null
    quantity: number
    unit_price: number | null
    discount_percentage: number | null
    line_total: number | null
  }>
}

interface CustomerQuoteViewProps {
  quote: SanitizedCustomerQuote
  pdfDownloadHref?: string | null
  backHref?: string
  backLabel?: string
}

export function CustomerQuoteView({
  quote,
  pdfDownloadHref,
  backHref = '/quotes/track',
  backLabel = 'Track Quotations',
}: CustomerQuoteViewProps) {
  const statusInfo = getCustomerStatusInfo(quote.status)

  return (
    <QuotationPageShell maxWidth="default">
      <div className="space-y-6">
        {/* Top Bar Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{backLabel}</span>
          </Link>
          <Link
            href="/quotes/new"
            className="text-sm text-orange-600 hover:text-orange-700 transition-colors"
          >
            Request Another Quotation →
          </Link>
        </div>

        {/* Summary Header Card */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-[0_1px_2px_rgba(17,24,39,0.03)] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <p className="type-eyebrow text-gray-400 mb-1">Quotation Reference</p>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="type-section font-mono text-gray-900">#{quote.quote_number}</h1>
                <QuotationStatusBadge
                  status={quote.status}
                  labelOverride={statusInfo.label}
                  toneOverride={statusInfo.tone}
                  size="md"
                />
                {quote.show_pricing && quote.current_revision > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-gray-900 text-white text-xs">
                    Rev {quote.current_revision}
                  </span>
                )}
              </div>
              <p className="type-body-sm text-gray-600 mt-2">{statusInfo.description}</p>
            </div>

            {quote.show_pricing && pdfDownloadHref && (
              <a
                href={pdfDownloadHref}
                className="self-start inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FF5A1F] hover:bg-[#e54e18] text-white rounded-lg text-sm transition-colors shadow-sm shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </a>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100 text-sm">
            <div>
              <p className="text-xs text-gray-500 flex items-center gap-1 mb-0.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Submitted</span>
              </p>
              <p className="text-gray-900">{formatIndiaDate(quote.created_at)}</p>
            </div>

            {quote.issued_at && quote.show_pricing && (
              <div>
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Issued</span>
                </p>
                <p className="text-gray-900">{formatIndiaDate(quote.issued_at)}</p>
              </div>
            )}

            {quote.valid_until && quote.show_pricing && (
              <div>
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Valid Until</span>
                </p>
                <p className="text-gray-900">{formatIndiaDate(quote.valid_until)}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-gray-500 mb-0.5">Items</p>
              <p className="text-gray-900">
                {quote.items.length === 0
                  ? 'General Enquiry'
                  : `${quote.items.length} ${quote.items.length === 1 ? 'Product' : 'Products'}`}
              </p>
            </div>
          </div>
        </div>

        {/* Rejection Notice */}
        {quote.status === 'rejected' && quote.rejected_reason && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm text-red-900">Update from Cedar Elevators</h2>
              <p className="text-sm text-red-800 mt-1">{quote.rejected_reason}</p>
            </div>
          </div>
        )}

        {/* Customer-visible Admin Message */}
        {quote.show_pricing && quote.admin_response_message && (
          <div className="bg-orange-50/60 border border-orange-200/80 rounded-xl p-5">
            <h2 className="text-sm text-gray-900 mb-1">Note from Cedar Elevators</h2>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.admin_response_message}</p>
          </div>
        )}

        {/* Contact & Project Info */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-[0_1px_2px_rgba(17,24,39,0.03)]">
          <h2 className="type-subsection text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-orange-600" />
            <span>Requester &amp; Project Details</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-500">Contact Name</p>
              <p className="text-gray-900 mt-0.5">{quote.requester_name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-gray-900 mt-0.5 break-all">{quote.requester_email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-gray-900 mt-0.5">{quote.requester_phone}</p>
            </div>
            {quote.company_name && (
              <div>
                <p className="text-xs text-gray-500">Company / Organization</p>
                <p className="text-gray-900 mt-0.5">{quote.company_name}</p>
              </div>
            )}
            {quote.gst_number && (
              <div>
                <p className="text-xs text-gray-500">GSTIN</p>
                <p className="font-mono text-gray-900 mt-0.5">{quote.gst_number}</p>
              </div>
            )}
            {quote.project_name && (
              <div>
                <p className="text-xs text-gray-500">Project Name</p>
                <p className="text-gray-900 mt-0.5">{quote.project_name}</p>
              </div>
            )}
            {quote.project_location && (
              <div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Project Location</span>
                </p>
                <p className="text-gray-900 mt-0.5">{quote.project_location}</p>
              </div>
            )}
          </div>
          {quote.notes && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Submitted Notes</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
            </div>
          )}
        </div>

        {/* Items & Pricing */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-[0_1px_2px_rgba(17,24,39,0.03)] space-y-5">
          <h2 className="type-subsection text-gray-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-600" />
            <span>{quote.show_pricing ? 'Quoted Items & Pricing' : 'Requested Components'}</span>
          </h2>

          {quote.items.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="text-left px-3 py-2.5 font-normal">Component</th>
                      <th className="text-center px-3 py-2.5 font-normal">Qty</th>
                      {quote.show_pricing && (
                        <>
                          <th className="text-right px-3 py-2.5 font-normal">Unit Price</th>
                          <th className="text-right px-3 py-2.5 font-normal">Discount</th>
                          <th className="text-right px-3 py-2.5 font-normal">Line Total</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {quote.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-3 py-3.5">
                          <div className="flex items-start gap-3">
                            {item.product_thumbnail ? (
                              <img
                                src={item.product_thumbnail}
                                alt={item.product_name}
                                className="w-10 h-10 rounded-lg border border-gray-200 object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                                <Package className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="text-gray-900">{item.product_name}</p>
                              {item.variant_title && (
                                <p className="text-xs text-gray-600">Variant: {item.variant_title}</p>
                              )}
                              {item.product_sku && (
                                <p className="text-xs font-mono text-gray-500">SKU: {item.product_sku}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3.5 text-center text-gray-900 tabular-nums">
                          {item.quantity}
                        </td>
                        {quote.show_pricing && (
                          <>
                            <td className="px-3 py-3.5 text-right text-gray-900 tabular-nums">
                              {item.unit_price !== null ? formatINR(item.unit_price) : '—'}
                            </td>
                            <td className="px-3 py-3.5 text-right text-gray-600 tabular-nums">
                              {item.discount_percentage ? `${item.discount_percentage}%` : '—'}
                            </td>
                            <td className="px-3 py-3.5 text-right text-gray-900 tabular-nums">
                              {item.line_total !== null ? formatINR(item.line_total) : '—'}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Items */}
              <div className="md:hidden space-y-3">
                {quote.items.map((item) => (
                  <div key={item.id} className="rounded-xl border border-gray-200 p-3.5 space-y-2.5">
                    <div className="flex items-start gap-3">
                      {item.product_thumbnail ? (
                        <img
                          src={item.product_thumbnail}
                          alt={item.product_name}
                          className="w-11 h-11 rounded-lg border border-gray-200 object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-900">{item.product_name}</p>
                        {item.variant_title && (
                          <p className="text-xs text-gray-600">Variant: {item.variant_title}</p>
                        )}
                        {item.product_sku && (
                          <p className="text-xs font-mono text-gray-500">SKU: {item.product_sku}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
                      <span className="text-gray-500">Quantity: {item.quantity}</span>
                      {quote.show_pricing && item.line_total !== null && (
                        <span className="text-sm text-gray-900 tabular-nums">
                          {formatINR(item.line_total)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
              General elevator consultation / project quotation request.
            </p>
          )}

          {/* Post-issuance Financial Breakdown */}
          {quote.show_pricing && quote.grand_total !== null && (
            <div className="pt-4 border-t border-gray-200 flex justify-end">
              <div className="w-full sm:w-80 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900 tabular-nums">{formatINR(quote.subtotal)}</span>
                </div>
                {(quote.discount_total || 0) > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount</span>
                    <span className="tabular-nums">- {formatINR(quote.discount_total)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxable Amount</span>
                  <span className="text-gray-900 tabular-nums">{formatINR(quote.taxable_amount)}</span>
                </div>
                {quote.tax_enabled && (quote.tax_total || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">GST ({quote.tax_rate || 18}%)</span>
                    <span className="text-gray-900 tabular-nums">{formatINR(quote.tax_total)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-300 flex justify-between items-center">
                  <span className="text-base text-gray-900">Grand Total</span>
                  <span className="text-xl text-orange-600 tabular-nums">
                    {formatINR(quote.grand_total)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Terms & Conditions */}
          {quote.show_pricing && quote.terms_and_conditions && (
            <div className="pt-4 border-t border-gray-100">
              <p className="type-eyebrow text-gray-500 mb-1.5">Terms &amp; Conditions</p>
              <p className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">
                {quote.terms_and_conditions}
              </p>
            </div>
          )}
        </div>
      </div>
    </QuotationPageShell>
  )
}
