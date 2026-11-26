"use client"

import { Button } from "@/components/ui/button"
import { Bell, Save, Menu } from "lucide-react"
import { useSettings } from "@/modules/admin/settings/settings-context"
import { toast } from "sonner"

interface SettingsHeaderProps {
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
  mobileMenuOpen: boolean
  onToggleMobileMenu: () => void
}

export function SettingsHeader({
  sidebarCollapsed,
  onToggleSidebar,
  mobileMenuOpen,
  onToggleMobileMenu
}: SettingsHeaderProps) {
  const { triggerSave, isSaving } = useSettings()

  return (
    <header className="px-4 lg:px-6 py-3 lg:py-4 flex-shrink-0">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3 lg:space-x-4 min-w-0 flex-1">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg hover:bg-black/5 lg:hidden"
            style={{ color: "#77736D" }}
            onClick={onToggleMobileMenu}
          >
            <Menu className="h-4 w-4" />
          </Button>

          {/* Desktop Sidebar Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex h-9 w-9 rounded-lg hover:bg-black/5"
            style={{ color: "#77736D" }}
            onClick={onToggleSidebar}
          >
            <Menu className="h-4 w-4" />
          </Button>

          <div className="min-w-0 flex-1">
            <h2 className="text-base lg:text-lg font-semibold truncate" style={{ color: "#171717" }}>
              Store Configuration
            </h2>
            <p className="text-xs mt-0.5 truncate hidden sm:block" style={{ color: "#77736D" }}>
              Manage your store settings and preferences
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
          <button
            type="button"
            className="cedar-admin-btn-compact hidden md:inline-flex"
            onClick={async () => {
              const promise = triggerSave()
              toast.promise(promise, {
                loading: 'Saving changes...',
                success: 'All changes saved successfully',
                error: 'Failed to save changes'
              })
              await promise
            }}
            disabled={isSaving}
          >
            <Save className="mr-2 h-3.5 w-3.5 lg:h-4 lg:w-4" />
            <span className="hidden lg:inline">{isSaving ? "Saving..." : "Save All Changes"}</span>
            <span className="lg:hidden">{isSaving ? "Saving..." : "Save"}</span>
          </button>


        </div>
      </div>
    </header>
  )
}
