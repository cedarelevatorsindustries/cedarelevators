import { createServerSupabase } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Supabase Auth Callback Route Handler
 * 
 * Exchanges PKCE auth code for an active session and redirects to the target path
 * (e.g. /admin/reset-password for password recovery).
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const rawNext = requestUrl.searchParams.get('next') || '/admin/reset-password'
  // Enforce internal relative path starting with /admin to prevent open redirects (no protocol-relative //)
  const next = (rawNext.startsWith('/admin') && !rawNext.startsWith('//'))
    ? rawNext
    : '/admin/reset-password'

  if (code) {
    try {
      const supabase = await createServerSupabase()
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        return NextResponse.redirect(new URL(next, request.url))
      }

      console.error('[auth/callback] Code exchange error:', error.message)
    } catch (err: any) {
      console.error('[auth/callback] Exception during code exchange:', err.message)
    }
  }

  // If code is missing or exchange failed, redirect to recovery page with error parameter
  return NextResponse.redirect(new URL('/admin/recover?error=invalid_link', request.url))
}
