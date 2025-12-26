"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Sidebar } from "@/components/common/sidebar"
import { Header } from "@/components/common/header"
import { Sheet, SheetContent } from "@/components/ui/admin-ui/sheet"
import { QueryProvider } from "@/components/providers/query-provider"

function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-950">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-800 border-t-orange-500 mx-auto mb-6"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-orange-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        <h3 className="font-heading text-xl font-bold text-white mb-2">Admin Portal</h3>
        <p className="text-blue-200">Verifying authentication...</p>
      </div>
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Auth routes that don't need the admin layout
  const authRoutes = ['/admin/login', '/admin/setup', '/admin/recover', '/admin/pending', '/admin/logout']
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // Settings routes that have their own complete layout
  const isSettingsRoute = pathname.startsWith('/admin/settings')

  // Client-side auth verification (backup to middleware)
  // IMPORTANT: ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  useEffect(() => {
    // Skip auth check for auth routes
    const skipAuth = authRoutes.some(route => pathname.startsWith(route))
    if (skipAuth) {
      setIsCheckingAuth(false)
      return
    }

    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/admin/login')
        return
      }

      setIsCheckingAuth(false)
    }

    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // If it's an auth route, just render the children without the admin layout
  if (isAuthRoute) {
    return <>{children}</>
  }

  // If it's a settings route, render children without the admin layout wrapper
  // Settings has its own complete layout
  if (pathname.startsWith('/admin/settings')) {
    if (isCheckingAuth) {
      return <LoadingScreen />
    }
    return <QueryProvider>{children}</QueryProvider>
  }

  // Show loading state while checking auth
  if (isCheckingAuth) {
    return <LoadingScreen />
  }

  return (
    <QueryProvider>
      <div className="flex h-screen bg-slate-950">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar collapsed={sidebarCollapsed} />
        </div>

        {/* Mobile Sidebar Sheet */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-64 bg-slate-950 border-r border-blue-800">
            <Sidebar collapsed={false} />
          </SheetContent>
        </Sheet>

        {/* Merged Single Card - Header + Content */}
        <div className="flex-1 flex flex-col overflow-hidden p-1.5 lg:p-2">
          <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-xl lg:rounded-2xl shadow-2xl border border-blue-200/20">
            {/* Header inside the card */}
            <div className="border-b border-gray-100 flex-shrink-0">
              <Header
                sidebarCollapsed={sidebarCollapsed}
                onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                mobileMenuOpen={mobileMenuOpen}
                onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
              />
            </div>

            {/* Main content area */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden">
              <div className="p-6 lg:p-10 w-full max-w-full">
                <div className="max-w-7xl mx-auto w-full min-w-0">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </QueryProvider>
  )
}