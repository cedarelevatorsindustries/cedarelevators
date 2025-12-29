'use client'

import { useProfile } from '@/lib/hooks/useProfile'
import PersonalInfoSection from './personal-info-section'
import { LoaderCircle } from 'lucide-react'

export default function PersonalInfoSectionWrapper() {
  const {
    user,
    isLoading,
    updateProfile,
    uploadAvatar,
  } = useProfile()

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

  return (
    <PersonalInfoSection
      user={user}
      onUpdate={updateProfile}
      onUploadAvatar={uploadAvatar}
    />
  )
}
