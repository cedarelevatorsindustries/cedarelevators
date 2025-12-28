"use client"

import { useEffect, useState } from "react"
import { ShippingSettingsForm } from "@/modules/admin/settings/shipping-settings-form"
import { getCurrentAdmin, AdminProfile } from "@/lib/admin-auth"
import { Tier2Guard } from "@/components/admin/settings-guards"
import { Loader2 } from "lucide-react"

export default function ShippingSettingsPage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const result = await getCurrentAdmin()
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
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
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
    <Tier2Guard userRole={profile.role}>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Shipping Settings</h1>
          <p className="text-lg text-gray-600 mt-2">
            Configure ST Courier rates and shipping zones
          </p>
        </div>
        <ShippingSettingsForm />
      </div>
    </Tier2Guard>
  )
}