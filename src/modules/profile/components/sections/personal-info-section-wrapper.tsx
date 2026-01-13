'use client'

import { useProfile } from '@/lib/hooks/useProfile'
import { useUser } from '@/lib/auth/client'
import ConsolidatedAccountForm from './consolidated-account-form'
import { LoaderCircle } from 'lucide-react'

export default function PersonalInfoSectionWrapper() {
  const {
    user,
    isLoading,
    updateProfile,
    uploadAvatar,
  } = useProfile()

  const { user: authUser } = useUser()

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <LoaderCircle size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isBusinessUser = authUser?.activeProfile?.profile_type === 'business'

  // Default empty address for business info
  const emptyAddress = {
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: ''
  }

  const companyProfile = isBusinessUser ? {
    company_name: authUser?.business?.name || authUser?.name || '',
    company_logo: authUser?.imageUrl || undefined,
    tax_id: '',  // TODO: Add GST field to businesses table if needed
    industry: '',
    company_size: '',
    billing_address: emptyAddress,  // TODO: Add address fields to businesses table if needed
    shipping_address: emptyAddress,
    contact_email: authUser?.email || '',
    contact_phone: ''  // TODO: Add contact_phone field to businesses table if needed
  } : null

  return (
    <ConsolidatedAccountForm
      user={user}
      companyProfile={companyProfile}
      onUpdatePersonal={async (updates) => {
        await updateProfile(updates)
      }}
      onUpdateCompany={async (updates) => {
        console.log('Update company info:', updates)
        // TODO: Implement company updates
      }}
      onUploadAvatar={uploadAvatar}

    />
  )
}

