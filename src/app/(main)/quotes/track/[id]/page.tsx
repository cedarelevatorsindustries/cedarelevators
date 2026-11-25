import { redirect, notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { getVerifiedGuestSession, normalizeEmail } from '@/lib/auth/guest-quote-auth'
import { isIssuedQuoteStatus } from '@/lib/quote-state-machine'
import { checkAndExpireQuote, logQuoteAction } from '@/lib/actions/admin-quotes/quote-audit'
import { CustomerQuoteView } from '@/modules/quote/components/customer-quote-view'
import { buildSanitizedCustomerQuote } from '@/lib/services/quote-sanitizer'

export const dynamic = 'force-dynamic'

export default async function VerifiedGuestQuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getVerifiedGuestSession()
  if (!session) {
    redirect('/quotes/track')
  }

  const { id } = await params
  await checkAndExpireQuote(id)

  const supabase = createAdminClient()
  const [{ data: quote, error }, { data: latestRevision }] = await Promise.all([
    supabase
      .from('quotes')
      .select('*, items:quote_items(*)')
      .eq('id', id)
      .single(),
    supabase
      .from('quote_revisions')
      .select('*')
      .eq('quote_id', id)
      .order('revision_number', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  if (error || !quote) {
    notFound()
  }

  // Strict ownership verification: session email must match quote email
  const quoteEmail = normalizeEmail(quote.requester_email || quote.guest_email || '')
  if (!quoteEmail || quoteEmail !== session.email) {
    notFound()
  }

  await logQuoteAction(quote.id, 'customer_viewed', {
    actorType: 'customer',
    notes: 'Verified guest viewed quotation from history',
  })

  const showPricing =
    isIssuedQuoteStatus(quote.status) ||
    (quote.status === 'expired' && Number(quote.current_revision || 0) > 0)

  const sanitized = buildSanitizedCustomerQuote(quote, latestRevision)

  return (
    <CustomerQuoteView
      quote={sanitized}
      pdfDownloadHref={showPricing ? `/api/quotes/track/${encodeURIComponent(id)}/pdf` : null}
      backHref="/quotes/track"
      backLabel="Back to Your Quotations"
    />
  )
}
