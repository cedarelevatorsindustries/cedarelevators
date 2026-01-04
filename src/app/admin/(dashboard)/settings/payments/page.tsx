"use client"

import { useEffect, useState } from "react"
import { PaymentSettingsForm } from "@/modules/admin/settings/payment-settings-form"
import { getCurrentAdminAction } from '@/lib/actions/admin-auth'
import { AdminProfile } from '@/lib/admin-auth-client'
import { Tier1Guard } from "@/components/admin/settings-guards"
import { LoaderCircle } from "lucide-react"

export default function PaymentSettingsPage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const result = await getCurrentAdminAction()
      if (result?.profile) {
        setProfile(result.profile)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoaderCircle className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Unable to load user profile</p>
      </div>
    )
  }

  return (
    <Tier1Guard userRole={profile.role}>
      <div className="max-w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Payments</h1>
          <p className="text-gray-500 mt-1">
            Enable or disable payment methods
          </p>
        </div>
        <PaymentSettingsForm />
      </div>
    </Tier1Guard>
  )
}
