"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoaderCircle, Store, DollarSign, CreditCard, Receipt, Truck, UserCog, ArrowRight } from "lucide-react"
import { getCurrentAdmin, AdminProfile } from "@/lib/admin-auth"
import { getAccessibleSettings, getTierBadgeVariant, getTierBadgeText, SettingsModule } from "@/lib/admin/settings-access"

// Icon mapping
const ICON_MAP: Record<string, any> = {
  Store,
  DollarSign,
  CreditCard,
  Receipt,
  Truck,
  UserCog
}

export default function SettingsLandingPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [accessibleModules, setAccessibleModules] = useState<SettingsModule[]>([])

  useEffect(() => {
    loadUserAndModules()
  }, [])

  const loadUserAndModules = async () => {
    try {
      const result = await getCurrentAdmin()
      if (result?.profile) {
        setProfile(result.profile)
        const modules = getAccessibleSettings(result.profile.role)
        setAccessibleModules(modules)
      }
    } catch (error) {
      console.error('Error loading user:', error)
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
        <p className="text-gray-600">Unable to load settings. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">Settings</h1>
        <p className="text-base lg:text-lg text-gray-600 mt-2">
          Platform configuration and system preferences
        </p>
      </div>

      {/* Settings Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {accessibleModules.map((module) => {
          const IconComponent = ICON_MAP[module.icon]
          const badgeVariant = getTierBadgeVariant(module.tier)
          const badgeText = getTierBadgeText(module.tier)

          return (
            <Link 
              key={module.id} 
              href={module.href}
              className="group"
            >
              <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-orange-50/30 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 h-full border-orange-100/50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="p-2.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg shadow-orange-500/20 flex-shrink-0">
                        {IconComponent && <IconComponent className="h-5 w-5 text-white" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg lg:text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors truncate">
                          {module.title}
                        </CardTitle>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CardDescription className="text-sm text-gray-600 line-clamp-2">
                    {module.description}
                  </CardDescription>
                  <div>
                    <Badge 
                      variant={badgeVariant}
                      className="text-xs font-medium"
                    >
                      {badgeText}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Role Info */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-gray-100/50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-gray-600">
                Logged in as <span className="font-semibold text-gray-900 capitalize">{profile.role.replace('_', ' ')}</span>
              </p>
            </div>
            <p className="text-xs text-gray-500">
              You have access to {accessibleModules.length} settings module{accessibleModules.length !== 1 ? 's' : ''}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
