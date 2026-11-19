import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { generateQuoteNumber } from '@/lib/utils/quote-number-generator'

// Rate limiting map: IP -> timestamp array
const ipRequestHistory = new Map<string, number[]>()
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000 // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = ipRequestHistory.get(ip) || []
  const recent = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS)

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    return true
  }

  recent.push(now)
  ipRequestHistory.set(ip, recent)
  return false
}

// Zod Validation Schema for Public Quote Enquiry
const quoteItemSchema = z.object({
  product_id: z.string().min(1, 'Product ID is required'),
  variant_id: z.string().nullable().optional(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
})

const quoteSubmissionSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Valid email address is required').max(150),
  phone: z.string().trim().min(10, 'Valid contact phone number is required').max(20),
  company_name: z.string().trim().max(150).optional(),
  notes: z.string().trim().max(2000).optional(),
  items: z.array(quoteItemSchema).min(1, 'At least one product item is required'),
  // Honeypot field for bot spam trap (should be empty for humans)
  hp_website: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // 1. Rate Limiting Check
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many quote requests. Please wait 10 minutes before submitting again.' },
        { status: 429, headers: { 'Retry-After': '600' } }
      )
    }

    const body = await request.json()

    // 2. Honeypot Anti-Spam Check: If bot fills hidden honeypot, fake success without DB writes
    if (body.hp_website && body.hp_website.trim().length > 0) {
      console.warn(`[Spam Guard] Trapped bot quote submission from IP: ${ip}`)
      return NextResponse.json({
        success: true,
        message: 'Your quote request has been received.',
        quoteNumber: 'CED-QT-GS-BOT-000000',
      })
    }

    // 3. Schema Validation
    const parseResult = quoteSubmissionSchema.safeParse(body)
    if (!parseResult.success) {
      const fieldErrors = parseResult.error.flatten().fieldErrors
      return NextResponse.json(
        { error: 'Validation failed', details: fieldErrors },
        { status: 400 }
      )
    }

    const validData = parseResult.data
    const supabase = createAdminClient()

    // 4. Generate Enterprise Quote Number
    const quoteNumber = await generateQuoteNumber('guest')

    // 5. Insert Quote Record
    const quotePayload = {
      quote_number: quoteNumber,
      user_id: null,
      account_type: 'guest',
      status: 'reviewing',
      priority: 'normal',
      guest_name: validData.name,
      guest_email: validData.email.toLowerCase(),
      guest_phone: validData.phone,
      notes: validData.company_name
        ? `[Company: ${validData.company_name}] ${validData.notes || ''}`.trim()
        : validData.notes || null,
    }

    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert(quotePayload)
      .select('id, quote_number')
      .single()

    if (quoteError || !quote) {
      console.error('[Quotes API] Database insert error:', quoteError)
      return NextResponse.json(
        { error: 'Failed to record quote request' },
        { status: 500 }
      )
    }

    // 6. Fetch Product Details and Insert Quote Items
    const productIds = validData.items.map(item => item.product_id)
    const { data: products } = await supabase
      .from('products')
      .select('id, name, thumbnail_url, sku')
      .in('id', productIds)

    const productMap = new Map((products || []).map((p: any) => [p.id, p]))

    const quoteItemsData = validData.items.map(item => {
      const product = productMap.get(item.product_id)
      return {
        quote_id: quote.id,
        product_id: item.product_id,
        variant_id: item.variant_id || null,
        quantity: item.quantity,
        product_name: product?.name || 'Elevator Product',
        product_sku: product?.sku || null,
        product_thumbnail: product?.thumbnail_url || null,
      }
    })

    const { error: itemsError } = await supabase
      .from('quote_items')
      .insert(quoteItemsData)

    if (itemsError) {
      console.error('[Quotes API] Quote items insert error:', itemsError)
      // The parent quote still exists; return success with quote number so user has reference
    }

    return NextResponse.json({
      success: true,
      quoteId: quote.id,
      quoteNumber: quote.quote_number,
      message: 'Your quotation enquiry has been submitted. Our technical team will contact you within 24 hours.'
    }, { status: 201 })

  } catch (err: any) {
    console.error('[Quotes API] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error processing quote request' },
      { status: 500 }
    )
  }
}
