"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Store, DollarSign, Truck, CreditCard, UserCog, ArrowLeft, Settings, Receipt } from "lucide-react"
import { getCurrentAdmin, AdminProfile } from "@/lib/admin-auth"
import { getSettingsSidebarItems, SettingsModule, SETTINGS_MODULES } from "@/lib/admin/settings-access"

// Icon mapping
const ICON_MAP: Record<string, any> = {
  Store,
  DollarSign,
  CreditCard,
  Receipt,
  Truck,
  UserCog,
  Settings
}

interface SettingsSidebarProps {
  collapsed?: boolean
}

export function SettingsSidebar({ collapsed = false }: SettingsSidebarProps) {
  const pathname = usePathname()
  const [navItems, setNavItems] = useState<SettingsModule[]>([])
  const [profile, setProfile] = useState<AdminProfile | null>(null)

  useEffect(() => {
    loadUserAndNav()
  }, [])

  const loadUserAndNav = async () => {
    try {
      const result = await getCurrentAdmin()
      if (result?.profile) {
        setProfile(result.profile)
        // Get all modules (not just accessible ones) to show disabled state
        const allModules = SETTINGS_MODULES.filter(m => !m.hidden)
        setNavItems(allModules)
      }
    } catch (error) {
      console.error('Error loading navigation:', error)
    }
  }

  // Check if user can access a specific module
  const canAccessItem = (item: SettingsModule) => {
    if (!profile) return false
    return item.allowedRoles.includes(profile.role)
  }

  return (
    <div className={cn(
      "flex flex-col h-full min-w-0 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className={cn(
        "border-b border-orange-100 flex-shrink-0",
        collapsed ? "p-3" : "p-3 lg:p-4 xl:p-6"
      )}>
        <div className={cn(
          "flex items-center gap-2",
          collapsed ? "justify-center" : "justify-between"
        )}>
          <div className={cn(
            "flex items-center min-w-0 flex-1",
            collapsed ? "justify-center" : "space-x-2 lg:space-x-3"
          )}>
            <div className="w-7 h-7 lg:w-8 lg:h-8 xl:w-9 xl:h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 flex-shrink-0">
              <Settings className="w-3.5 h-3.5 lg:w-4 lg:h-4 xl:w-5 xl:h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <h1 className="text-sm lg:text-base xl:text-lg font-bold text-gray-900 truncate">
                  Settings
                </h1>
              </div>
            )}
          </div>
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 lg:h-8 lg:w-8 hover:bg-gray-100 text-gray-500 rounded-lg flex-shrink-0"
              asChild
            >
              <Link href="/admin">
                <ArrowLeft className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className={cn(
          "h-full py-3 lg:py-4",
          collapsed ? "px-2" : "px-2 lg:px-3 xl:px-4"
        )}>
          <div className="space-y-1">
            {navItems.map((item) => {
              const IconComponent = ICON_MAP[item.icon]
              const hasAccess = canAccessItem(item)
              const isActive = pathname === item.href
              
              return (
                <div key={item.href} className="relative">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full h-auto rounded-lg font-medium transition-all duration-200",
                      collapsed ? "justify-center px-2 py-3" : "justify-start px-2 lg:px-3 py-2.5",
                      isActive
                        ? "bg-white text-orange-600 shadow-md shadow-orange-100 border border-orange-100"
                        : hasAccess
                        ? "text-gray-700 hover:bg-white/50 hover:text-gray-900"
                        : "text-gray-400 cursor-not-allowed opacity-60 hover:bg-transparent",
                      !hasAccess && "pointer-events-none"
                    )}
                    asChild={hasAccess}
                    title={collapsed ? item.title : undefined}
                    disabled={!hasAccess}
                  >
                    {hasAccess ? (
                      <Link href={item.href}>
                        <div className={cn(
                          "flex items-center w-full",
                          collapsed ? "justify-center" : "justify-between"
                        )}>
                          <div className={cn(
                            "flex items-center",
                            collapsed ? "" : "flex-1 min-w-0"
                          )}>
                            {IconComponent && (
                              <IconComponent className={cn(
                                "h-3.5 w-3.5 lg:h-4 lg:w-4 transition-colors flex-shrink-0",
                                collapsed ? "" : "mr-2 lg:mr-3",
                                isActive ? "text-orange-600" : "text-gray-400 group-hover:text-gray-500"
                              )} />
                            )}
                            {!collapsed && (
                              <span className="truncate text-xs lg:text-sm">{item.title}</span>
                            )}
                          </div>
                          {!collapsed && item.tier === 'critical' && (
                            <Badge 
                              variant="destructive" 
                              className="ml-2 text-[10px] px-1.5 py-0 h-4 flex-shrink-0"
                            >
                              🔴
                            </Badge>
                          )}
                          {!collapsed && item.tier === 'operational' && (
                            <Badge 
                              variant="warning" 
                              className="ml-2 text-[10px] px-1.5 py-0 h-4 flex-shrink-0"
                            >
                              🟡
                            </Badge>
                          )}
                        </div>
                      </Link>
                    ) : (
                      <div className={cn(
                        "flex items-center w-full",
                        collapsed ? "justify-center" : "justify-between"
                      )}>
                        <div className={cn(
                          "flex items-center",
                          collapsed ? "" : "flex-1 min-w-0"
                        )}>
                          {IconComponent && (
                            <IconComponent className={cn(
                              "h-3.5 w-3.5 lg:h-4 lg:w-4 flex-shrink-0",
                              collapsed ? "" : "mr-2 lg:mr-3",
                              "text-gray-300"
                            )} />
                          )}
                          {!collapsed && (
                            <span className="truncate text-xs lg:text-sm">{item.title}</span>
                          )}
                        </div>
                        {!collapsed && (
                          <Badge 
                            variant="outline" 
                            className="ml-2 text-[10px] px-1.5 py-0 h-4 flex-shrink-0 border-gray-300 text-gray-400"
                          >
                            🔒
                          </Badge>
                        )}
                      </div>
                    )}
                  </Button>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
