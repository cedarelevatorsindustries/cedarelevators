import QuotesSection from '@/modules/profile/components/sections/quotes-section'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'

export const metadata: Metadata = {
  title: "Quotes | Cedar B2B Storefront",
  description: "View and manage your quotes",
}

export default async function QuotesPage() {
  // Check Clerk authentication
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in?redirect=/profile/quotes')
  }

  const { createClerkSupabaseClient } = await import('@/lib/supabase/server')
  const supabase = await createClerkSupabaseClient()

  // Get user profile to check account type
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('account_type, verification_status')
    .eq('id', userId)
    .single()

  // Only business accounts can access quotes
  if (profile?.account_type !== 'business') {
    redirect('/profile')
  }

  return (
    <QuotesSection
      accountType={profile?.account_type || 'individual'}
      verificationStatus={profile?.verification_status}
    />
  )
}
