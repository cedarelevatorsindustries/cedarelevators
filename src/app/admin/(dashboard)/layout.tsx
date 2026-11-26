"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { checkAdminSessionAction } from "@/lib/actions/admin-auth"
import { AdminLoginView } from "@/components/admin/admin-login-view"
import { AdminAccessDeniedView } from "@/components/admin/admin-access-denied-view"
import { Sidebar } from "@/components/common/sidebar"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { QueryProvider } from "@/components/providers/query-provider"
import { Menu } from "lucide-react"

function LoadingScreen() {
  return (
    <div className="cedar-admin-theme cedar-admin-shell flex h-screen animate-pulse">
      {/* Sidebar Skeleton */}
      <div className="hidden lg:flex w-64 flex-col p-3.5 space-y-5">
        <div className="flex items-center gap-2.5 px-1 py-1">
          <div className="h-7 w-7 rounded-md" style={{ backgroundColor: "#E6E3DC" }} />
          <div className="space-y-1.5">
            <div className="h-3.5 w-24 rounded" style={{ backgroundColor: "#E6E3DC" }} />
            <div className="h-2.5 w-20 rounded" style={{ backgroundColor: "#EAE8E2" }} />
          </div>
        </div>
        <div className="h-8 w-full rounded-[8px]" style={{ backgroundColor: "#FFFFFF", border: "1px solid #EAE8E2" }} />
        <div className="space-y-1.5">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-8 w-full rounded-[8px]" style={{ backgroundColor: "#EAE8E2" }} />
          ))}
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col overflow-hidden p-1 sm:p-1.5 lg:p-1.5 lg:pl-0">
        <div className="cedar-admin-workspace-surface flex-1 flex flex-col overflow-hidden">
          <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto w-full">
            <div className="space-y-2">
              <div className="h-9 w-72 rounded-lg" style={{ backgroundColor: "#F3F2EE" }} />
              <div className="h-4 w-80 rounded" style={{ backgroundColor: "#F7F6F3" }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="cedar-admin-metric-card h-28 space-y-3">
                  <div className="h-3.5 w-24 rounded" style={{ backgroundColor: "#F3F2EE" }} />
                  <div className="h-7 w-16 rounded" style={{ backgroundColor: "#EAE8E2" }} />
                </div>
              ))}
            </div>
            <div className="cedar-admin-card h-80 p-6 space-y-4">
              <div className="h-5 w-40 rounded" style={{ backgroundColor: "#F3F2EE" }} />
              <div className="h-56 w-full rounded-lg" style={{ backgroundColor: "#F9F8F5" }} />
            </div>
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

  // Dormant Phase 2 e-commerce routes deferred from Phase 1 release
  const phase2Routes = ['/admin/orders', '/admin/inventory', '/admin/customers', '/admin/coupons', '/admin/business-verification']
  const isPhase2Route = phase2Routes.some(route => pathname.startsWith(route))

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
    if (isPhase2Route) {
      router.replace('/admin')
      return
    }
    if (authStatus === 'unauthenticated' && !isRootAdmin && !isAuthRoute) {
      router.push(pathname.startsWith('/admin') ? '/admin' : '/')
    }
  }, [authStatus, isRootAdmin, isAuthRoute, isPhase2Route, pathname, router])

  // If it's a utility auth route (recover, invite, etc.), render directly
  if (isAuthRoute) {
    return <>{children}</>
  }

  // If user attempted to access a deferred Phase 2 route, don't flash content while redirecting
  if (isPhase2Route) {
    return <LoadingScreen />
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

  // Authenticated active administrator: Headerless workspace inside warm off-white sidebar shell
  return (
    <QueryProvider>
      <div className="cedar-admin-theme cedar-admin-shell flex h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block flex-shrink-0">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
            showGlobalSearch
          />
        </div>

        {/* Mobile Sidebar Sheet */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent
            side="left"
            className="cedar-admin-theme cedar-admin-sidebar p-0 w-64 border-r border-[#EAE8E2]"
          >
            <Sidebar
              collapsed={false}
              onNavigate={() => setMobileMenuOpen(false)}
              showGlobalSearch={false}
            />
          </SheetContent>
        </Sheet>

        {/* Main White Workspace Panel (tight 3-side padding, reduced corner radius, no top header) */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 p-1 sm:p-1.5 lg:p-1.5 lg:pl-0">
          <div className="cedar-admin-workspace-surface flex-1 flex flex-col overflow-hidden">
            {/* Main content area */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden">
              {/* Mobile-only drawer button (desktop has no header; toggle lives in sidebar) */}
              <div className="flex items-center justify-between px-4 pt-3 lg:hidden">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Open navigation menu"
                  className="cedar-admin-btn-compact"
                >
                  <Menu className="h-4 w-4" style={{ color: "#77736D" }} />
                  <span>Menu</span>
                </button>
              </div>

              <div className="p-4 sm:p-6 lg:p-8 xl:p-10 w-full max-w-full">
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
