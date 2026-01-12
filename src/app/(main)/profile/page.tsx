import AccountOverviewWrapper from '@/modules/profile/components/sections/account-overview-wrapper'
import { Metadata } from 'next'
import { syncVerificationToClerk } from '@/lib/actions/customers/sync-verification'
import { auth } from '@clerk/nextjs/server'

export const metadata: Metadata = {
  title: 'Account Overview | Cedar Elevators',
  description: 'Manage your account information and settings',
}

export default async function ProfilePage() {
  // Sync verification status from database to Clerk metadata
  // This fixes users whose metadata wasn't updated during approval
  const { userId } = await auth()
  if (userId) {
    await syncVerificationToClerk()
  }

  return <AccountOverviewWrapper />
}
