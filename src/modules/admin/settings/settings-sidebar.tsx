"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Store, DollarSign, Truck, CreditCard, UserCog, ArrowLeft, Settings, Receipt } from "lucide-react"
import { getCurrentAdmin, AdminProfile } from "@/lib/admin-auth"
import { getSettingsSidebarItems, SettingsModule } from "@/lib/admin/settings-access"

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
        const items = getSettingsSidebarItems(result.profile.role)
        setNavItems(items)
      }
    } catch (error) {
      console.error('Error loading navigation:', error)
    }
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
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  className={cn(
                    "w-full h-8 lg:h-9 xl:h-10 rounded-lg font-medium transition-all duration-200 text-xs lg:text-sm xl:text-base",
                    collapsed ? "justify-center px-2" : "justify-start px-2 lg:px-3",
                    pathname === item.href
                      ? "bg-white text-orange-600 shadow-md shadow-orange-100 border border-orange-100"
                      : "text-gray-500 hover:bg-white/50 hover:text-gray-900"
                  )}
                  asChild
                  title={collapsed ? item.title : undefined}
                >
                  <Link href={item.href}>
                    {IconComponent && (
                      <IconComponent className={cn(
                        "h-3.5 w-3.5 lg:h-4 lg:w-4 transition-colors flex-shrink-0",
                        collapsed ? "" : "mr-2 lg:mr-3",
                        pathname === item.href ? "text-orange-600" : "text-gray-400 group-hover:text-gray-500"
                      )} />
                    )}
                    {!collapsed && <span className="truncate">{item.title}</span>}
                  </Link>
                </Button>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
