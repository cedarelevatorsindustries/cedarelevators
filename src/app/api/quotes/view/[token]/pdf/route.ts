import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyQuoteAccessToken } from '@/lib/auth/guest-quote-auth'
import { checkRateLimit } from '@/lib/services/rate-limit'
import { isIssuedQuoteStatus } from '@/lib/quote-state-machine'
import { resolveCustomerIssuedPdfBuffer } from '@/lib/services/quote-pdf'
import { logQuoteAction } from '@/lib/actions/admin-quotes/quote-audit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    const rl = await checkRateLimit(`quote-token-pdf:ip:${ip}`, 30, 300)
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { token } = await params
    const tokenResult = await verifyQuoteAccessToken(token)
    if (!tokenResult.valid) {
      return NextResponse.json(
        {
          error:
            tokenResult.reason === 'expired'
              ? 'This quotation link has expired. Please verify your email on Track Quotations.'
              : tokenResult.reason === 'revoked'
                ? 'This quotation link has been revoked.'
                : 'Invalid quotation link.',
        },
        { status: tokenResult.reason === 'invalid' ? 404 : 403 }
      )
    }

    const supabase = createAdminClient()
    const { data: quote, error } = await supabase
      .from('quotes')
      .select('*, items:quote_items(*)')
      .eq('id', tokenResult.quoteId)
      .single()

    if (error || !quote) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 })
    }

    const allowPdf =
      isIssuedQuoteStatus(quote.status) ||
      (quote.status === 'expired' && (quote.current_revision || 0) > 0)

    if (!allowPdf) {
      return NextResponse.json(
        { error: 'Quotation PDF is available once your quotation has been officially issued.' },
        { status: 403 }
      )
    }

    const { pdfBuffer, filename } = await resolveCustomerIssuedPdfBuffer(quote)

    await logQuoteAction(quote.id, 'customer_pdf_downloaded', {
      actorType: 'customer',
      notes: 'Customer downloaded quotation PDF via secure link',
    })

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (err: any) {
    console.error('[CustomerTokenPDF] Error:', err)
    return NextResponse.json({ error: 'Unable to download quotation PDF' }, { status: 500 })
  }
}
