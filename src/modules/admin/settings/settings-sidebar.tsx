"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Store,
  Truck,
  CreditCard,
  Receipt,
  Users,
  ArrowLeft,
  Settings,
  ChevronDown,
  LogOut,
  User,
  FileText,
  AlertTriangle
} from "lucide-react"
import { getCurrentAdminAction } from '@/lib/actions/admin-auth'
import { AdminProfile } from '@/lib/admin-auth-client'
import { createClient } from '@/lib/supabase/client'
import {
  SETTINGS_MODULES,
  SETTINGS_GROUPS,
  SettingsModule,
  SettingsGroup,
  getGroupedModules
} from "@/lib/admin/settings-access"

// Icon mapping
const ICON_MAP: Record<string, any> = {
  Store,
  Truck,
  CreditCard,
  Receipt,
  Users,
  Settings,
  FileText,
  AlertTriangle
}

interface SettingsSidebarProps {
  collapsed?: boolean
}

export function SettingsSidebar({ collapsed = false }: SettingsSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [expandedGroups, setExpandedGroups] = useState<Record<SettingsGroup, boolean>>({
    store: true,
    commerce: true,
    access: true,
    cms: true,
    system: true
  })

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      const result = await getCurrentAdminAction()
      if (result?.profile) {
        setProfile(result.profile)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const canAccessItem = (item: SettingsModule) => {
    if (!profile) return false
    return item.allowedRoles.includes(profile.role)
  }

  const toggleGroup = (groupId: SettingsGroup) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }))
  }

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/admin/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const groupedModules = getGroupedModules()

  return (
    <div className={cn(
      "flex flex-col h-full bg-transparent transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className={cn(
        "border-b border-gray-100/50 flex-shrink-0",
        collapsed ? "p-3" : "p-4"
      )}>
        <div className={cn(
          "flex items-center",
          collapsed ? "justify-center" : "justify-between"
        )}>
          <div className={cn(
            "flex items-center",
            collapsed ? "justify-center" : "space-x-3"
          )}>
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <h1 className="text-lg font-semibold text-gray-900">
                Settings
              </h1>
            )}
          </div>
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              asChild
            >
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className={cn("py-2", collapsed ? "px-2" : "px-3")}>
          {SETTINGS_GROUPS.map((group) => {
            const groupModules = groupedModules[group.id]
            if (groupModules.length === 0) return null

            const isExpanded = expandedGroups[group.id]

            return (
              <div key={group.id} className="mb-1">
                {/* Group Header */}
                {!collapsed && (
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider hover:text-gray-600"
                  >
                    <span>{group.title}</span>
                    <ChevronDown
                      className={cn(
                        "h-3 w-3 transition-transform duration-200",
                        isExpanded ? "" : "-rotate-90"
                      )}
                    />
                  </button>
                )}

                {/* Group Items */}
                {(collapsed || isExpanded) && (
                  <div className="space-y-0.5">
                    {groupModules.map((item) => {
                      const IconComponent = ICON_MAP[item.icon]
                      const hasAccess = canAccessItem(item)
                      const isActive = pathname === item.href ||
                        (item.id === 'general' && pathname === '/admin/settings/store')

                      return (
                        <div key={item.id}>
                          {hasAccess ? (
                            <Link href={item.href}>
                              <div
                                className={cn(
                                  "flex items-center rounded-lg transition-all duration-150",
                                  collapsed ? "justify-center p-2.5" : "px-3 py-2",
                                  isActive
                                    ? "bg-orange-50 text-orange-600"
                                    : "text-gray-600 hover:bg-gray-50/50 hover:text-gray-900"
                                )}
                              >
                                {IconComponent && (
                                  <IconComponent
                                    className={cn(
                                      "h-4 w-4 flex-shrink-0",
                                      !collapsed && "mr-3",
                                      isActive ? "text-orange-600" : "text-gray-400"
                                    )}
                                  />
                                )}
                                {!collapsed && (
                                  <span className="text-sm font-medium flex-1">
                                    {item.title}
                                  </span>
                                )}
                              </div>
                            </Link>
                          ) : (
                            <div
                              className={cn(
                                "flex items-center rounded-lg opacity-50 cursor-not-allowed",
                                collapsed ? "justify-center p-2.5" : "px-3 py-2"
                              )}
                            >
                              {IconComponent && (
                                <IconComponent
                                  className={cn(
                                    "h-4 w-4 flex-shrink-0 text-gray-300",
                                    !collapsed && "mr-3"
                                  )}
                                />
                              )}
                              {!collapsed && (
                                <>
                                  <span className="text-sm font-medium flex-1 text-gray-400">
                                    {item.title}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] px-1.5 py-0 h-4 border-gray-200 text-gray-400"
                                  >
                                    🔒
                                  </Badge>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </ScrollArea>

      {/* Footer - Profile & Logout */}
      <div className={cn(
        "border-t border-gray-100/50 flex-shrink-0",
        collapsed ? "p-2" : "p-3"
      )}>
        {/* Profile Link */}
        <Link href="/admin/settings/profile">
          <div className={cn(
            "flex items-center rounded-lg transition-all duration-150 mb-2",
            collapsed ? "justify-center p-2.5" : "px-3 py-2",
            pathname === '/admin/settings/profile'
              ? "bg-orange-50 text-orange-600"
              : "text-gray-600 hover:bg-gray-50/50 hover:text-gray-900"
          )}>
            <User className={cn(
              "h-4 w-4 flex-shrink-0",
              !collapsed && "mr-3",
              pathname === '/admin/settings/profile' ? "text-orange-600" : "text-gray-400"
            )} />
            {!collapsed && (
              <span className="text-sm font-medium">Profile</span>
            )}
          </div>
        </Link>

        {/* Logout Button */}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full text-red-600 hover:text-red-700 hover:bg-red-50",
            collapsed ? "justify-center px-2" : "justify-start px-3"
          )}
        >
          <LogOut className={cn("h-4 w-4", !collapsed && "mr-3")} />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </Button>
      </div>
    </div>
  )
}
