'use client'

import { useProfile } from '@/lib/hooks/useProfile'
import AddressesSection from './addresses-section'
import { LoaderCircle } from 'lucide-react'

export default function AddressesSectionWrapper() {
  const {
    addresses,
    isLoading,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useProfile()

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <LoaderCircle size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading addresses...</p>
        </div>
      </div>
    )
  }

  return (
    <AddressesSection
      addresses={addresses}
      onAdd={addAddress}
      onUpdate={updateAddress}
      onDelete={deleteAddress}
      onSetDefault={setDefaultAddress}
    />
  )
}
