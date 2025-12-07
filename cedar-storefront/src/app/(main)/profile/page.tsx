import DashboardSectionWrapper from '@/modules/profile/components/sections/dashboard-section-wrapper'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | Cedar B2B Storefront',
  description: 'Your profile dashboard overview',
}

export default function ProfilePage() {
  return <DashboardSectionWrapper />
}
