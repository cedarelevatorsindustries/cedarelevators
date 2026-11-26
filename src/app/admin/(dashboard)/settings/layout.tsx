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
        <div className="cedar-admin-theme cedar-admin-shell flex h-screen">
          <div className="flex h-full min-h-0 w-full">
            {/* Desktop Settings Sidebar */}
            <div className="hidden lg:block flex-shrink-0">
              <SettingsSidebar collapsed={sidebarCollapsed} />
            </div>

            {/* Mobile Settings Sidebar Sheet */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetContent side="left" className="cedar-admin-theme cedar-admin-sidebar p-0 w-64 border-r border-[#EAE8E2]">
                <SettingsSidebar collapsed={false} />
              </SheetContent>
            </Sheet>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0 p-1 sm:p-1.5 lg:p-1.5 lg:pl-0">
              <div className="cedar-admin-workspace-surface flex-1 flex flex-col overflow-hidden">
                <div className="cedar-admin-header flex-shrink-0">
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

