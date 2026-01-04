import AccountOverviewWrapper from '@/modules/profile/components/sections/account-overview-wrapper'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Account Overview | Cedar Elevators',
  description: 'Manage your account information and settings',
}

export default function ProfilePage() {
  return <AccountOverviewWrapper />
}

