import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { createServerClient } from '@supabase/ssr'
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server'

// Routes requiring administrative authentication
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)',
])

// Dormant Phase 2 customer-account and e-commerce routes
const isDormantCommerceRoute = createRouteMatcher([
  '/checkout(.*)',
  '/cart(.*)',
  '/profile(.*)',
  '/wishlist(.*)',
  '/track(.*)',
  '/order-confirmation(.*)',
  '/choose-type(.*)',
  '/individual-signup(.*)',
  '/business-signup(.*)',
])

/**
 * Refreshes Supabase Auth session tokens in cookies for admin routes
 * Ensures session persistence across browser refreshes and prevents expired tokens.
 */
async function refreshAdminSupabaseSession(request: NextRequest, response: NextResponse): Promise<NextResponse> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  // Only attempt refresh if Supabase auth cookies are present
  const allCookies = request.cookies.getAll?.() || []
  const hasSupabaseCookie = allCookies.some((c: { name: string }) =>
    c.name.startsWith('sb-') && (c.name.includes('-auth-token') || c.name.includes('-access-token'))
  )

  if (!hasSupabaseCookie) {
    return response
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    })

    // Calling getUser() triggers automatic token refresh if expired
    await supabase.auth.getUser()
  } catch (err) {
    console.warn('[proxy] Supabase session refresh error:', err)
  }

  return response
}

const clerkHandler = clerkMiddleware(async (auth, request) => {
  // All customer-facing routes: continue with Clerk
})

export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  const url = request.nextUrl
  const hostname = request.headers.get("host") || ""

  // 1. Phase 1 Scope: Redirect dormant e-commerce & customer profile routes to catalogue
  if (isDormantCommerceRoute(request)) {
    return NextResponse.redirect(new URL('/products', request.url))
  }

  // Normalize legacy category routes to /catalog/categories/[handle]
  if (url.pathname.startsWith('/categories/') && url.pathname !== '/categories/') {
    const handle = url.pathname.replace(/^\/categories\//, '')
    return NextResponse.redirect(new URL(`/catalog/categories/${handle}`, request.url), 301)
  }

  // 2. Admin Subdomain Routing (e.g. admin.cedarelevators.com or admin.localhost:3000)
  const hostWithoutPort = (hostname.split(':')[0] || '').toLowerCase()
  const configuredAdminDomain = process.env.ADMIN_DOMAIN
    ? process.env.ADMIN_DOMAIN.replace(/^https?:\/\//, '').split(':')[0].toLowerCase()
    : null
  const isAdminSubdomain =
    hostWithoutPort === 'admin.localhost' ||
    Boolean(configuredAdminDomain && hostWithoutPort === configuredAdminDomain)
  if (isAdminSubdomain) {
    if (url.pathname.startsWith('/api/')) {
      return NextResponse.next() // Allow API routes to pass through directly
    }

    // Redirect legacy login entry points to root on subdomain
    if (url.pathname === '/login' || url.pathname === '/login/' || url.pathname === '/admin/login' || url.pathname === '/admin/login/') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    if (!url.pathname.startsWith('/admin')) {
      const rewriteResponse = NextResponse.rewrite(new URL(`/admin${url.pathname}`, request.url))
      return await refreshAdminSupabaseSession(request, rewriteResponse)
    }

    const nextResponse = NextResponse.next()
    return await refreshAdminSupabaseSession(request, nextResponse)
  }

  // 3. Main Domain: Redirect legacy /admin/login directly to /admin entry point
  if (url.pathname === '/admin/login' || url.pathname === '/admin/login/') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // 4. Admin Route Protection & Session Refresh:
  // Admin routes are exclusively handled by Supabase Auth (requireAdmin).
  // Clerk authentication is completely bypassed - clerkHandler is never called!
  if (isAdminRoute(request)) {
    const nextResponse = NextResponse.next()
    return await refreshAdminSupabaseSession(request, nextResponse)
  }

  // All other customer-facing routes: delegate to Clerk
  return clerkHandler(request, event)
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
