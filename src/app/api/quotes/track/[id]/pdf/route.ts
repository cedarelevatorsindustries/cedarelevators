import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getVerifiedGuestSession, normalizeEmail } from '@/lib/auth/guest-quote-auth'
import { isIssuedQuoteStatus } from '@/lib/quote-state-machine'
import { resolveCustomerIssuedPdfBuffer } from '@/lib/services/quote-pdf'
import { logQuoteAction } from '@/lib/actions/admin-quotes/quote-audit'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getVerifiedGuestSession()
    if (!session) {
      return NextResponse.json({ error: 'Verification required' }, { status: 401 })
    }

    const { id: quoteId } = await params
    const supabase = createAdminClient()

    const { data: quote, error } = await supabase
      .from('quotes')
      .select('*, items:quote_items(*)')
      .eq('id', quoteId)
      .single()

    if (error || !quote) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 })
    }

    const quoteEmail = normalizeEmail(quote.requester_email || quote.guest_email || '')
    if (!quoteEmail || quoteEmail !== session.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const allowPdf =
      isIssuedQuoteStatus(quote.status) ||
      (quote.status === 'expired' && (quote.current_revision || 0) > 0)

    if (!allowPdf) {
      return NextResponse.json(
        { error: 'PDF is only available once the quotation is issued.' },
        { status: 403 }
      )
    }

    const { pdfBuffer, filename } = await resolveCustomerIssuedPdfBuffer(quote)

    await logQuoteAction(quote.id, 'customer_pdf_downloaded', {
      actorType: 'customer',
      notes: 'Verified guest downloaded quotation PDF from history',
    })

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (err: any) {
    console.error('[GuestSessionPDF] Error:', err)
    return NextResponse.json({ error: 'Unable to download quotation PDF' }, { status: 500 })
  }
}
