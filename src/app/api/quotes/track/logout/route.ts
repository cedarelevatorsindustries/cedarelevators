import { NextResponse } from 'next/server'
import { revokeGuestHistorySession } from '@/lib/auth/guest-quote-auth'

export async function POST() {
  try {
    await revokeGuestHistorySession()
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[GuestLogout] Error:', err)
    return NextResponse.json({ success: false, error: 'Failed to end session' }, { status: 500 })
  }
}
