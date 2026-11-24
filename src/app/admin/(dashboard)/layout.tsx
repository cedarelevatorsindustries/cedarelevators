"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { checkAdminSessionAction } from "@/lib/actions/admin-auth"
import { AdminLoginView } from "@/components/admin/admin-login-view"
import { AdminAccessDeniedView } from "@/components/admin/admin-access-denied-view"
import { Sidebar } from "@/components/common/sidebar"
import { Header } from "@/components/common/header"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { QueryProvider } from "@/components/providers/query-provider"

function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100/50">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600 mx-auto mb-6"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-orange-600 rounded-full animate-pulse"></div>
          </div>
        </div>
        <h3 className="font-heading text-xl font-bold text-gray-900 mb-2">Admin Portal</h3>
        <p className="text-gray-500">Verifying administrator session...</p>
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
  const [authStatus, setAuthStatus] = useState<
    'loading' | 'authenticated' | 'unauthenticated' | 'unauthorized' | 'inactive'
  >('loading')
  const [authError, setAuthError] = useState<string>('')

  // Specific admin utility routes that bypass dashboard layout
  const authRoutes = ['/admin/setup', '/admin/recover', '/admin/reset-password', '/admin/pending', '/admin/logout', '/admin/invite']
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  const isRootAdmin = pathname === '/admin' || pathname === '/admin/' || pathname === '/'

  const verifySession = useCallback(async () => {
    try {
      const res = await checkAdminSessionAction()
      if (res.status === 'authenticated') {
        setAuthStatus('authenticated')
        setAuthError('')
      } else if (res.status === 'inactive') {
        setAuthStatus('inactive')
        setAuthError(res.error || 'Your administrator account is awaiting approval or has been deactivated.')
      } else if (res.status === 'unauthorized') {
        setAuthStatus('unauthorized')
        setAuthError(res.error || 'Access denied: You do not have administrator permissions.')
      } else {
        setAuthStatus('unauthenticated')
        setAuthError('')
      }
    } catch (err: any) {
      console.error('[AdminLayout] Session verification error:', err)
      setAuthStatus('unauthenticated')
    }
  }, [])

  useEffect(() => {
    if (isAuthRoute) {
      setAuthStatus('authenticated')
      return
    }

    verifySession()

    // Listen to Supabase client auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await verifySession()
      } else if (event === 'SIGNED_OUT') {
        setAuthStatus('unauthenticated')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname, isAuthRoute, verifySession, supabase])

  // Redirect unauthenticated visitors attempting to access inner admin sub-routes
  useEffect(() => {
    if (authStatus === 'unauthenticated' && !isRootAdmin && !isAuthRoute) {
      router.push(pathname.startsWith('/admin') ? '/admin' : '/')
    }
  }, [authStatus, isRootAdmin, isAuthRoute, pathname, router])

  // If it's a utility auth route (recover, invite, etc.), render directly
  if (isAuthRoute) {
    return <>{children}</>
  }

  // Show loading state while verifying
  if (authStatus === 'loading') {
    return <LoadingScreen />
  }

  // Unauthenticated visitor on root admin path -> render Supabase login UI directly
  if (authStatus === 'unauthenticated') {
    return <AdminLoginView onLoginSuccess={verifySession} />
  }

  // Unauthorized visitor (e.g. ordinary customer) or inactive admin -> render access denied view
  if (authStatus === 'unauthorized' || authStatus === 'inactive') {
    return <AdminAccessDeniedView type={authStatus} error={authError} onSignOut={verifySession} />
  }

  // If it's a settings route, render children without duplicating sidebar (settings has its own layout)
  if (pathname.startsWith('/admin/settings')) {
    return <QueryProvider>{children}</QueryProvider>
  }

  // Authenticated active administrator: Render dashboard shell
  return (
    <QueryProvider>
      <div className="flex h-screen bg-gradient-to-br from-orange-50/50 to-orange-100/30">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar collapsed={sidebarCollapsed} />
        </div>

        {/* Mobile Sidebar Sheet */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-64 bg-white border-r border-orange-100">
            <Sidebar collapsed={false} />
          </SheetContent>
        </Sheet>

        {/* Merged Single Card - Header + Content */}
        <div className="flex-1 flex flex-col overflow-hidden p-1.5 lg:p-2">
          <div className="flex-1 flex flex-col overflow-hidden bg-white/80 backdrop-blur-sm rounded-xl lg:rounded-2xl shadow-xl border border-orange-100/50">
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
