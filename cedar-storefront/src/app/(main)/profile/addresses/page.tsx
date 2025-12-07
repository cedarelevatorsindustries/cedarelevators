import AddressesSectionWrapper from '@/modules/profile/components/sections/addresses-section-wrapper'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Addresses | Cedar B2B Storefront",
  description: "Manage your delivery addresses",
}

export default function AddressesPage() {
  return <AddressesSectionWrapper />
}
