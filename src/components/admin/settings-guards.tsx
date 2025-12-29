"use client"

import { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldAlert } from "lucide-react"
import { AdminRole } from '@/lib/admin-auth-client'
import { canAccessTier1, canAccessTier2, canAccessModule } from "@/lib/admin/settings-access"

interface SettingsGuardProps {
  children: ReactNode
  userRole: AdminRole
  requiredTier: 'tier1' | 'tier2' | string // tier1, tier2, or module id
  fallback?: ReactNode
}

/**
 * Guard component for settings pages
 * Shows restricted access message if user doesn't have permission
 */
export function SettingsGuard({ children, userRole, requiredTier, fallback }: SettingsGuardProps) {
  let hasAccess = false

  if (requiredTier === 'tier1') {
    hasAccess = canAccessTier1(userRole)
  } else if (requiredTier === 'tier2') {
    hasAccess = canAccessTier2(userRole)
  } else {
    // Module-specific check
    hasAccess = canAccessModule(userRole, requiredTier)
  }

  if (!hasAccess) {
    return fallback || <RestrictedAccessMessage />
  }

  return <>{children}</>
}

/**
 * Tier-1 Guard Component
 * Only Super Admin can access
 */
export function Tier1Guard({ children, userRole, fallback }: { children: ReactNode; userRole: AdminRole; fallback?: ReactNode }) {
  return (
    <SettingsGuard userRole={userRole} requiredTier="tier1" fallback={fallback}>
      {children}
    </SettingsGuard>
  )
}

/**
 * Tier-2 Guard Component
 * Admin, Manager, Staff can access
 */
export function Tier2Guard({ children, userRole, fallback }: { children: ReactNode; userRole: AdminRole; fallback?: ReactNode }) {
  return (
    <SettingsGuard userRole={userRole} requiredTier="tier2" fallback={fallback}>
      {children}
    </SettingsGuard>
  )
}

/**
 * Default restricted access message
 */
export function RestrictedAccessMessage() {
  return (
    <div className="space-y-6">
      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-600 rounded-xl">
              <ShieldAlert className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Access Restricted</CardTitle>
              <CardDescription className="text-base mt-1">
                This settings module requires Super Admin permissions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-orange-300 bg-orange-50">
            <ShieldAlert className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-900">
              <strong>Why am I seeing this?</strong>
              <br />
              This settings module contains critical platform configurations that can affect payments, taxes, or business operations. Only Super Administrators have permission to access and modify these settings.
            </AlertDescription>
          </Alert>
          
          <div className="p-4 bg-white rounded-lg border border-orange-200">
            <h4 className="font-semibold text-gray-900 mb-2">Need access?</h4>
            <p className="text-sm text-gray-600">
              Contact your Super Administrator if you need access to this settings module. They can review your request and grant appropriate permissions if necessary.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
