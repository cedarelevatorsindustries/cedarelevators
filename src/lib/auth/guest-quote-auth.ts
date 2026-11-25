import crypto from 'crypto'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'

export const GUEST_HISTORY_COOKIE = 'cedar_guest_quote_session'
const QUOTE_ACCESS_TOKEN_TTL_DAYS = 90
const OTP_TTL_MINUTES = 10
const OTP_MAX_ATTEMPTS = 5
const GUEST_SESSION_TTL_HOURS = 24

function getServerPepper(): string {
  return (
    process.env.GUEST_QUOTE_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'cedar-dev-quote-pepper-do-not-use-in-prod'
  )
}

export function getAppBaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    'http://localhost:3000'
  return url.replace(/\/+$/, '')
}

export function normalizeEmail(email: string): string {
  return (email || '').trim().toLowerCase()
}

export function hashEmail(email: string): string {
  return crypto.createHash('sha256').update(normalizeEmail(email)).digest('hex')
}

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('base64url')
}

export function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex')
}

export function generateOtpCode(): string {
  return crypto.randomInt(100000, 1000000).toString()
}

export function hashOtpCode(email: string, code: string): string {
  return crypto
    .createHmac('sha256', getServerPepper())
    .update(`${normalizeEmail(email)}:${code.trim()}`)
    .digest('hex')
}

export function createAccessTokenPayload(): {
  rawToken: string
  tokenHash: string
  expiresAtIso: string
} {
  const rawToken = generateSecureToken()
  const tokenHash = hashToken(rawToken)
  const expiresAt = new Date(Date.now() + QUOTE_ACCESS_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000)
  return {
    rawToken,
    tokenHash,
    expiresAtIso: expiresAt.toISOString(),
  }
}

/**
 * Rotates / ensures an individual quote has a valid access token hash stored in DB
 * and returns a fresh raw token for outbound customer emails.
 */
export async function issueAccessTokenForQuote(quoteId: string): Promise<string> {
  const supabase = createAdminClient()
  const { rawToken, tokenHash, expiresAtIso } = createAccessTokenPayload()

  const { error } = await supabase
    .from('quotes')
    .update({
      access_token_hash: tokenHash,
      access_token_expires_at: expiresAtIso,
      access_token_revoked_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', quoteId)

  if (error) {
    throw new Error(`Failed to issue quote access token: ${error.message}`)
  }

  return rawToken
}

/**
 * Verifies an individual quotation bearer token safely (checks hash, expiry, and revocation).
 */
export async function verifyQuoteAccessToken(rawToken: string): Promise<
  | { valid: true; quoteId: string; email: string | null }
  | { valid: false; reason: 'invalid' | 'expired' | 'revoked' }
> {
  if (!rawToken || rawToken.length < 16) {
    return { valid: false, reason: 'invalid' }
  }

  const tokenHash = hashToken(rawToken)
  const supabase = createAdminClient()

  const { data: quote, error } = await supabase
    .from('quotes')
    .select('id, requester_email, guest_email, access_token_expires_at, access_token_revoked_at')
    .eq('access_token_hash', tokenHash)
    .maybeSingle()

  if (error || !quote) {
    return { valid: false, reason: 'invalid' }
  }

  if (quote.access_token_revoked_at) {
    return { valid: false, reason: 'revoked' }
  }

  if (quote.access_token_expires_at && new Date(quote.access_token_expires_at) < new Date()) {
    return { valid: false, reason: 'expired' }
  }

  return {
    valid: true,
    quoteId: quote.id,
    email: normalizeEmail(quote.requester_email || quote.guest_email || ''),
  }
}

/**
 * Creates a hashed OTP record for guest history verification.
 */
export async function createEmailVerificationChallenge(params: {
  email: string
  ipAddress?: string
}): Promise<{ code: string; expiresAt: string; cooldownRemainingSeconds?: number }> {
  const supabase = createAdminClient()
  const emailNorm = normalizeEmail(params.email)
  const emailHash = hashEmail(emailNorm)

  // Check 60-second resend cooldown
  const { data: recent } = await supabase
    .from('quote_email_verifications')
    .select('id, created_at')
    .eq('email_hash', emailHash)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (recent?.created_at) {
    const elapsedSec = (Date.now() - new Date(recent.created_at).getTime()) / 1000
    if (elapsedSec < 60) {
      return {
        code: '',
        expiresAt: '',
        cooldownRemainingSeconds: Math.ceil(60 - elapsedSec),
      }
    }
  }

  // Invalidate any previous unconsumed challenges for this email
  await supabase
    .from('quote_email_verifications')
    .update({ consumed_at: new Date().toISOString() })
    .eq('email_hash', emailHash)
    .is('consumed_at', null)

  const code = generateOtpCode()
  const codeHash = hashOtpCode(emailNorm, code)
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString()

  const { error } = await supabase.from('quote_email_verifications').insert({
    email_normalized: emailNorm,
    email_hash: emailHash,
    code_hash: codeHash,
    expires_at: expiresAt,
    attempts: 0,
    max_attempts: OTP_MAX_ATTEMPTS,
    ip_address: params.ipAddress || null,
  })

  if (error) {
    throw new Error(`Failed to store verification challenge: ${error.message}`)
  }

  return { code, expiresAt }
}

/**
 * Verifies an OTP challenge, increments attempt count on mismatch, and issues a guest history session cookie.
 */
export async function verifyEmailChallengeAndCreateSession(params: {
  email: string
  code: string
  ipAddress?: string
}): Promise<{ success: true; email: string } | { success: false; error: string }> {
  const supabase = createAdminClient()
  const emailNorm = normalizeEmail(params.email)
  const emailHash = hashEmail(emailNorm)

  const { data: challenge, error } = await supabase
    .from('quote_email_verifications')
    .select('*')
    .eq('email_hash', emailHash)
    .is('consumed_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !challenge) {
    return { success: false, error: 'Invalid or expired verification code.' }
  }

  if (new Date(challenge.expires_at) < new Date()) {
    return { success: false, error: 'Verification code has expired. Please request a new code.' }
  }

  if (challenge.attempts >= (challenge.max_attempts || OTP_MAX_ATTEMPTS)) {
    return {
      success: false,
      error: 'Maximum verification attempts exceeded. Please request a new code.',
    }
  }

  const submittedHash = hashOtpCode(emailNorm, params.code)
  const expectedBuf = Buffer.from(challenge.code_hash, 'hex')
  const actualBuf = Buffer.from(submittedHash, 'hex')
  const isMatch =
    expectedBuf.length === actualBuf.length && crypto.timingSafeEqual(expectedBuf, actualBuf)

  if (!isMatch) {
    const nextAttempts = (challenge.attempts || 0) + 1
    await supabase
      .from('quote_email_verifications')
      .update({ attempts: nextAttempts })
      .eq('id', challenge.id)

    if (nextAttempts >= (challenge.max_attempts || OTP_MAX_ATTEMPTS)) {
      return {
        success: false,
        error: 'Maximum verification attempts exceeded. Please request a new code.',
      }
    }

    return {
      success: false,
      error: `Incorrect verification code. ${Math.max(0, (challenge.max_attempts || OTP_MAX_ATTEMPTS) - nextAttempts)} attempt(s) remaining.`,
    }
  }

  // Mark challenge consumed
  await supabase
    .from('quote_email_verifications')
    .update({ consumed_at: new Date().toISOString() })
    .eq('id', challenge.id)

  // Create guest history session
  const rawSessionToken = generateSecureToken()
  const sessionTokenHash = hashToken(rawSessionToken)
  const expiresAt = new Date(Date.now() + GUEST_SESSION_TTL_HOURS * 60 * 60 * 1000)

  const { error: sessionError } = await supabase.from('quote_guest_sessions').insert({
    session_token_hash: sessionTokenHash,
    email_normalized: emailNorm,
    email_hash: emailHash,
    expires_at: expiresAt.toISOString(),
    ip_address: params.ipAddress || null,
  })

  if (sessionError) {
    throw new Error(`Failed to create guest history session: ${sessionError.message}`)
  }

  const cookieStore = await cookies()
  cookieStore.set(GUEST_HISTORY_COOKIE, rawSessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  })

  return { success: true, email: emailNorm }
}

/**
 * Reads and verifies the current guest history session cookie from the server request.
 */
export async function getVerifiedGuestSession(): Promise<{
  email: string
  emailHash: string
  sessionId: string
} | null> {
  const cookieStore = await cookies()
  const rawToken = cookieStore.get(GUEST_HISTORY_COOKIE)?.value
  if (!rawToken || rawToken.length < 16) return null

  const tokenHash = hashToken(rawToken)
  const supabase = createAdminClient()

  const { data: session, error } = await supabase
    .from('quote_guest_sessions')
    .select('id, email_normalized, email_hash, expires_at, revoked_at')
    .eq('session_token_hash', tokenHash)
    .maybeSingle()

  if (error || !session || session.revoked_at) {
    return null
  }

  if (new Date(session.expires_at) < new Date()) {
    return null
  }

  // Update last_used_at asynchronously (non-blocking)
  supabase
    .from('quote_guest_sessions')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', session.id)
    .then(() => {})

  return {
    email: session.email_normalized,
    emailHash: session.email_hash,
    sessionId: session.id,
  }
}

export async function revokeGuestHistorySession(): Promise<void> {
  const cookieStore = await cookies()
  const rawToken = cookieStore.get(GUEST_HISTORY_COOKIE)?.value

  if (rawToken) {
    const tokenHash = hashToken(rawToken)
    const supabase = createAdminClient()
    await supabase
      .from('quote_guest_sessions')
      .update({ revoked_at: new Date().toISOString() })
      .eq('session_token_hash', tokenHash)
  }

  cookieStore.delete(GUEST_HISTORY_COOKIE)
}
