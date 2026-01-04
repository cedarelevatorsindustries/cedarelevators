import PersonalInfoSectionWrapper from '@/modules/profile/components/sections/personal-info-section-wrapper'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Account Settings | Cedar B2B Storefront",
  description: "Manage your account settings",
}

export default function AccountPage() {
  return <PersonalInfoSectionWrapper />
}

