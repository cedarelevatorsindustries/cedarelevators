import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/services/rate-limit'
import { submitUnifiedQuote } from '@/lib/services/quote-service'

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // 1. Durable rate limiting (10 submissions per 10 minutes per IP)
    const ipLimit = await checkRateLimit(`quote-submit:ip:${ip}`, 10, 600)
    if (!ipLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many quote requests from this network. Please wait a few minutes before submitting again.',
        },
        {
          status: 429,
          headers: { 'Retry-After': String(ipLimit.retryAfterSeconds) },
        }
      )
    }

    const body = await request.json()

    // 2. Honeypot Anti-Spam Trap
    if (body?.hp_website && typeof body.hp_website === 'string' && body.hp_website.trim().length > 0) {
      console.warn(`[Spam Guard] Trapped bot quote submission from IP: ${ip}`)
      return NextResponse.json({
        success: true,
        message: 'Your quotation request has been received.',
        quoteNumber: 'CED-QT-GS-RECEIVED',
      })
    }

    // 3. Per-email abuse guard
    if (typeof body?.email === 'string' && body.email.trim()) {
      const emailKey = body.email.trim().toLowerCase()
      const emailLimit = await checkRateLimit(`quote-submit:email:${emailKey}`, 8, 600)
      if (!emailLimit.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: 'Too many requests for this email address. Please wait before submitting again.',
          },
          {
            status: 429,
            headers: { 'Retry-After': String(emailLimit.retryAfterSeconds) },
          }
        )
      }
    }

    // 4. Unified atomic quote submission
    const result = await submitUnifiedQuote(body)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          details: result.details,
        },
        { status: result.status }
      )
    }

    return NextResponse.json(
      {
        success: true,
        quoteId: result.quoteId,
        quoteNumber: result.quoteNumber,
        itemsCount: result.itemsCount,
        requestType: result.requestType,
        duplicate: result.duplicate,
        message: result.message,
      },
      { status: result.duplicate ? 200 : 201 }
    )
  } catch (err: any) {
    console.error('[Quotes API] Unexpected error:', err)
    return NextResponse.json(
      { success: false, error: 'Unable to process your quotation request right now.' },
      { status: 500 }
    )
  }
}
