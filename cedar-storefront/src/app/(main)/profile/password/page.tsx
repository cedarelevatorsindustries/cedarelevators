import PasswordSection from '@/modules/profile/components/sections/password-section'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Change Password | Cedar B2B Storefront",
  description: "Update your password",
}

export default function PasswordPage() {
  return (
    <PasswordSection
      onUpdate={async (currentPassword, newPassword) => {
        'use server'
        console.log('Update password:', { currentPassword, newPassword })
      }}
    />
  )
}
