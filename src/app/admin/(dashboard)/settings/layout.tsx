"use client"

import { useState } from "react"
import { SettingsSidebar } from "@/modules/admin/settings/settings-sidebar"
import { SettingsHeader } from "@/modules/admin/settings/settings-header"
import { SettingsProvider } from "@/modules/admin/settings/settings-context"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { QueryProvider } from "@/components/providers/query-provider"

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // This layout completely replaces the admin layout for settings pages
  return (
    <QueryProvider>
      <SettingsProvider>
        <div className="flex h-screen bg-gradient-to-br from-orange-50/50 to-orange-100/30">
          <div className="flex h-full min-h-0 w-full">
            {/* Desktop Settings Sidebar */}
            <div className="hidden lg:block">
              <SettingsSidebar collapsed={sidebarCollapsed} />
            </div>

            {/* Mobile Settings Sidebar Sheet */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetContent side="left" className="p-0 w-64 bg-white border-r border-orange-100">
                <SettingsSidebar collapsed={false} />
              </SheetContent>
            </Sheet>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0 p-1.5 lg:p-2">
              <div className="flex-1 flex flex-col overflow-hidden bg-white/80 backdrop-blur-sm rounded-xl lg:rounded-2xl shadow-xl border border-orange-100/50">
                <div className="border-b border-gray-100 flex-shrink-0">
                  <SettingsHeader
                    sidebarCollapsed={sidebarCollapsed}
                    onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                    mobileMenuOpen={mobileMenuOpen}
                    onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
                  />
                </div>

                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                  <div className="p-4 lg:p-8 w-full max-w-full">
                    <div className="max-w-full mx-auto w-full min-w-0">
                      {children}
                    </div>
                  </div>
                </main>
              </div>
            </div>
          </div>
        </div>
      </SettingsProvider>
    </QueryProvider>
  )
}
