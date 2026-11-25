import Link from 'next/link'
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyQuoteAccessToken } from '@/lib/auth/guest-quote-auth'
import { checkRateLimit } from '@/lib/services/rate-limit'
import { isIssuedQuoteStatus } from '@/lib/quote-state-machine'
import { checkAndExpireQuote, logQuoteAction } from '@/lib/actions/admin-quotes/quote-audit'
import { CustomerQuoteView } from '@/modules/quote/components/customer-quote-view'
import { buildSanitizedCustomerQuote } from '@/lib/services/quote-sanitizer'
import { AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SecureTokenQuoteViewPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const headerList = await headers()
  const ip =
    headerList.get('x-forwarded-for')?.split(',')[0].trim() ||
    headerList.get('x-real-ip') ||
    'unknown'

  const rl = await checkRateLimit(`quote-view-page:ip:${ip}`, 40, 300)
  if (!rl.allowed) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] pt-24 pb-16 px-4 flex justify-center">
        <div className="max-w-[540px] w-full bg-white rounded-2xl border border-gray-200/90 p-6 sm:p-8 text-center space-y-4 h-fit">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h1 className="type-subsection text-gray-900">Too Many Requests</h1>
          <p className="type-body-sm text-gray-600">
            Please wait a few minutes before accessing this quotation link again.
          </p>
        </div>
      </div>
    )
  }

  const { token } = await params
  const verification = await verifyQuoteAccessToken(token)

  if (!verification.valid) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] pt-24 pb-16 px-4 flex justify-center">
        <div className="max-w-[540px] w-full bg-white rounded-2xl border border-gray-200/90 p-6 sm:p-8 text-center space-y-4 h-fit">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h1 className="type-subsection text-gray-900">
            {verification.reason === 'expired'
              ? 'Quotation Link Expired'
              : verification.reason === 'revoked'
                ? 'Quotation Link Revoked'
                : 'Invalid Quotation Link'}
          </h1>
          <p className="type-body-sm text-gray-600">
            {verification.reason === 'expired'
              ? 'This secure link has expired. Verify your email address to access all your Cedar Elevators quotations.'
              : 'We could not verify this quotation link. You can access your quotations securely by verifying your email address.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/quotes/track"
              className="flex-1 inline-flex items-center justify-center px-5 py-2.5 bg-[#FF5A1F] hover:bg-[#e54e18] text-white rounded-lg text-sm transition-colors"
            >
              Track Your Quotations
            </Link>
            <Link
              href="/quotes/new"
              className="flex-1 inline-flex items-center justify-center px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-lg text-sm transition-colors"
            >
              Request a Quotation
            </Link>
          </div>
        </div>
      </div>
    )
  }

  await checkAndExpireQuote(verification.quoteId)

  const supabase = createAdminClient()
  const [{ data: quote, error }, { data: latestRevision }] = await Promise.all([
    supabase
      .from('quotes')
      .select('*, items:quote_items(*)')
      .eq('id', verification.quoteId)
      .single(),
    supabase
      .from('quote_revisions')
      .select('*')
      .eq('quote_id', verification.quoteId)
      .order('revision_number', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 px-4 text-center">
        <p className="text-gray-600">Quotation not found.</p>
      </div>
    )
  }

  await logQuoteAction(quote.id, 'customer_viewed', {
    actorType: 'customer',
    notes: 'Customer viewed quotation via secure email link',
  })

  const showPricing =
    isIssuedQuoteStatus(quote.status) ||
    (quote.status === 'expired' && Number(quote.current_revision || 0) > 0)

  const sanitized = buildSanitizedCustomerQuote(quote, latestRevision)

  return (
    <CustomerQuoteView
      quote={sanitized}
      pdfDownloadHref={showPricing ? `/api/quotes/view/${encodeURIComponent(token)}/pdf` : null}
    />
  )
}
