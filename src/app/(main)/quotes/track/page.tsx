import { Metadata } from 'next'
import { getVerifiedGuestSession } from '@/lib/auth/guest-quote-auth'
import { GuestTrackPortal } from '@/modules/quote/components/guest-track-portal'

export const metadata: Metadata = {
  title: 'Track Your Quotations | Cedar Elevators',
  description: 'Verify your email address to track all your Cedar Elevators quotation requests.',
}

export const dynamic = 'force-dynamic'

export default async function TrackQuotationsPage() {
  const session = await getVerifiedGuestSession()
  return <GuestTrackPortal initialVerifiedEmail={session?.email || null} />
}
