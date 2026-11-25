import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkRateLimit } from '@/lib/services/rate-limit'
import {
  normalizeEmail,
  verifyEmailChallengeAndCreateSession,
} from '@/lib/auth/guest-quote-auth'
import { createAdminClient } from '@/lib/supabase/server'

const verifySchema = z.object({
  email: z.string().trim().email('Valid email required'),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Verification code must be 6 digits'),
})

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    const ipLimit = await checkRateLimit(`quote-otp-verify:ip:${ip}`, 20, 600)
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many verification attempts. Please wait a few minutes.' },
        { status: 429, headers: { 'Retry-After': String(ipLimit.retryAfterSeconds) } }
      )
    }

    const body = await request.json()
    const parsed = verifySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Enter a valid email address and 6-digit code.' },
        { status: 400 }
      )
    }

    const emailNorm = normalizeEmail(parsed.data.email)
    const emailLimit = await checkRateLimit(`quote-otp-verify:email:${emailNorm}`, 10, 600)
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many verification attempts. Please wait before trying again.' },
        { status: 429 }
      )
    }

    const result = await verifyEmailChallengeAndCreateSession({
      email: emailNorm,
      code: parsed.data.code,
      ipAddress: ip,
    })

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 401 })
    }

    // Best-effort audit log entry on the customer's latest quote if one exists
    try {
      const supabase = createAdminClient()
      const { data: latestQuote } = await supabase
        .from('quotes')
        .select('id')
        .or(`requester_email.ilike.${emailNorm},guest_email.ilike.${emailNorm}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (latestQuote?.id) {
        await supabase.from('quote_audit_log').insert({
          quote_id: latestQuote.id,
          action_type: 'guest_history_verified',
          actor_type: 'customer',
          notes: 'Guest customer completed OTP verification for quotation history',
        })
      }
    } catch {
      // ignore audit failure
    }

    return NextResponse.json({
      success: true,
      email: result.email,
    })
  } catch (err: any) {
    console.error('[GuestOTP Verify] Unexpected error:', err)
    return NextResponse.json(
      { success: false, error: 'Verification failed. Please try again.' },
      { status: 500 }
    )
  }
}
