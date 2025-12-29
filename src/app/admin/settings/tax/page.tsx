"use client"

import { useEffect, useState } from "react"
import { TaxSettingsFormSimplified } from "@/modules/admin/settings/tax-settings-form-simplified"
import { getCurrentAdminAction } from '@/lib/actions/admin-auth'
import { AdminProfile } from '@/lib/admin-auth-client'
import { Tier1Guard } from "@/components/admin/settings-guards"
import { LoaderCircle } from "lucide-react"

export default function TaxSettingsPage() {
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
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Tax (GST) Settings</h1>
          <p className="text-lg text-gray-600 mt-2">
            Simplified GST configuration for Indian B2B platform — India only, no multi-country logic
          </p>
        </div>
        <TaxSettingsFormSimplified />
      </div>
    </Tier1Guard>
  )
}