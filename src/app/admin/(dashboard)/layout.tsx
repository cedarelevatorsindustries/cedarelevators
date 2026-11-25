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
    <div className="flex h-screen bg-gray-50 animate-pulse">
      {/* Sidebar Skeleton */}
      <div className="hidden lg:flex w-64 flex-col border-r border-gray-200 bg-white p-4 space-y-6">
        <div className="h-8 w-36 bg-gray-200 rounded-md" />
        <div className="space-y-2.5">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-9 w-full bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
          <div className="h-6 w-48 bg-gray-200 rounded" />
          <div className="h-9 w-9 bg-gray-200 rounded-full" />
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-7 w-16 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
          <div className="h-80 bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <div className="h-5 w-40 bg-gray-200 rounded" />
            <div className="h-56 w-full bg-gray-100 rounded-lg" />
          </div>
        </div>
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
