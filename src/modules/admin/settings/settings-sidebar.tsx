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
  AlertTriangle,
  Shield,
  Star,
  Sparkles
} from "lucide-react"
import { getCurrentAdminAction } from '@/lib/actions/admin-auth'
import { AdminProfile } from '@/lib/admin-auth-client'
import { createClient } from '@/lib/supabase/client'
import { performAdminLogout } from '@/lib/auth/admin-logout'
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
  AlertTriangle,
  Shield,
  Star,
  Sparkles
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
    await performAdminLogout()
  }

  const groupedModules = getGroupedModules()

  return (
    <div className={cn(
      "cedar-admin-sidebar flex flex-col h-full transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className={cn(
        "cedar-admin-sidebar-divider border-b flex-shrink-0",
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
            <div className="cedar-admin-icon-well" style={{ width: 32, height: 32, backgroundColor: "#FFFFFF", color: "#E85A24" }}>
              <Settings className="w-4 h-4" />
            </div>
            {!collapsed && (
              <h1 className="text-[15px] font-semibold" style={{ color: "#171717" }}>
                Settings
              </h1>
            )}
          </div>
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg hover:bg-black/5"
              style={{ color: "#77736D" }}
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
                                  "cedar-admin-nav-item",
                                  collapsed ? "justify-center p-2.5" : "px-3 py-2",
                                  isActive && "cedar-admin-nav-item-active"
                                )}
                              >
                                {IconComponent && (
                                  <IconComponent
                                    className="h-4 w-4 flex-shrink-0"
                                    style={{
                                      marginRight: collapsed ? 0 : 10,
                                      color: isActive ? "#E85A24" : "#9A958D",
                                    }}
                                  />
                                )}
                                {!collapsed && (
                                  <span className="text-[13.5px] font-medium flex-1">
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
        "cedar-admin-sidebar-divider border-t flex-shrink-0",
        collapsed ? "p-2" : "p-3"
      )}>
        {/* Profile Link */}
        <Link href="/admin/settings/profile">
          <div className={cn(
            "cedar-admin-nav-item mb-1.5",
            collapsed ? "justify-center p-2.5" : "px-3 py-2",
            pathname === '/admin/settings/profile' && "cedar-admin-nav-item-active"
          )}>
            <User
              className="h-4 w-4 flex-shrink-0"
              style={{
                marginRight: collapsed ? 0 : 10,
                color: pathname === '/admin/settings/profile' ? "#E85A24" : "#9A958D",
              }}
            />
            {!collapsed && (
              <span className="text-[13.5px] font-medium">Profile</span>
            )}
          </div>
        </Link>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            "cedar-admin-nav-item cedar-admin-nav-logout cursor-pointer",
            collapsed ? "justify-center px-2" : "justify-start px-3"
          )}
        >
          <LogOut className="h-4 w-4" style={{ marginRight: collapsed ? 0 : 10 }} />
          {!collapsed && <span className="text-[13.5px] font-medium">Logout</span>}
        </button>
      </div>
    </div>
  )
}

