import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkRateLimit } from '@/lib/services/rate-limit'
import {
  createEmailVerificationChallenge,
  normalizeEmail,
} from '@/lib/auth/guest-quote-auth'
import { sendGuestOtpEmail } from '@/lib/services/email'

const requestSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address').max(150),
})

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    const ipLimit = await checkRateLimit(`quote-otp-req:ip:${ip}`, 10, 600)
    if (!ipLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many verification requests. Please wait a few minutes.',
        },
        { status: 429, headers: { 'Retry-After': String(ipLimit.retryAfterSeconds) } }
      )
    }

    const body = await request.json()
    const parsed = requestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      )
    }

    const email = normalizeEmail(parsed.data.email)
    const emailLimit = await checkRateLimit(`quote-otp-req:email:${email}`, 5, 600)
    if (!emailLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many verification code requests for this email. Please wait a few minutes.',
        },
        { status: 429, headers: { 'Retry-After': String(emailLimit.retryAfterSeconds) } }
      )
    }

    const challenge = await createEmailVerificationChallenge({ email, ipAddress: ip })
    if (challenge.cooldownRemainingSeconds) {
      return NextResponse.json(
        {
          success: false,
          error: `Please wait ${challenge.cooldownRemainingSeconds} seconds before requesting another code.`,
          retryAfterSeconds: challenge.cooldownRemainingSeconds,
        },
        { status: 429, headers: { 'Retry-After': String(challenge.cooldownRemainingSeconds) } }
      )
    }

    // Send OTP via Resend cleanly; return same non-enumerating success response whether email has quotes or not
    const emailRes = await sendGuestOtpEmail(email, {
      code: challenge.code,
      expiresInMinutes: 10,
    })

    if (!emailRes.success) {
      console.error('[GuestOTP] Resend error:', emailRes.error)
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to send verification email right now. Please try again later.',
        },
        { status: 503 }
      )
    }

    return NextResponse.json({
      success: true,
      message:
        'A 6-digit verification code has been sent to your email address. Please enter it below to view your quotations.',
    })
  } catch (err: any) {
    console.error('[GuestOTP Request] Unexpected error:', err)
    return NextResponse.json(
      { success: false, error: 'Unable to process verification request.' },
      { status: 500 }
    )
  }
}
