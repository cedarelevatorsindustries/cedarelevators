import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

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

export default clerkMiddleware(async (_auth, request) => {
  const url = request.nextUrl
  const rawHost =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    url.hostname ||
    ""
  const hostWithoutPort = (rawHost.split(':')[0] || '').toLowerCase()

  const configuredAdminDomain = (
    process.env.ADMIN_DOMAIN || 'admin.cedarelevators.in'
  ).replace(/^https?:\/\//, '').split(':')[0].toLowerCase()

  const isLocalhost = hostWithoutPort === 'localhost' || hostWithoutPort === '127.0.0.1'

  // Admin subdomain identification
  const isAdminSubdomain =
    hostWithoutPort === 'admin.localhost' ||
    hostWithoutPort === 'admin.cedarelevators.in' ||
    Boolean(configuredAdminDomain && hostWithoutPort === configuredAdminDomain)

  // =========================================================================
  // 1. ADMIN SUBDOMAIN ROUTING (admin.cedarelevators.in or admin.localhost:3000)
  // =========================================================================
  if (isAdminSubdomain) {
    if (
      url.pathname.startsWith('/api/') ||
      url.pathname.startsWith('/videos/') ||
      url.pathname.startsWith('/logo/') ||
      url.pathname.startsWith('/images/') ||
      url.pathname.startsWith('/_next/') ||
      url.pathname === '/favicon.ico'
    ) {
      return NextResponse.next() // Allow API routes and static media to pass through directly
    }

    // Redirect legacy login entry points to root on subdomain
    if (url.pathname === '/login' || url.pathname === '/login/' || url.pathname === '/admin/login' || url.pathname === '/admin/login/') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Root on admin subdomain -> rewrite directly to /admin (loads admin portal)
    if (url.pathname === '/') {
      const rewriteResponse = NextResponse.rewrite(new URL('/admin', request.url))
      return await refreshAdminSupabaseSession(request, rewriteResponse)
    }

    // Other paths not starting with /admin (e.g. /products, /quotes, /settings) -> rewrite to /admin/...
    if (!url.pathname.startsWith('/admin')) {
      const rewriteResponse = NextResponse.rewrite(new URL(`/admin${url.pathname}`, request.url))
      return await refreshAdminSupabaseSession(request, rewriteResponse)
    }

    // Paths starting with /admin -> allow through directly
    const nextResponse = NextResponse.next()
    return await refreshAdminSupabaseSession(request, nextResponse)
  }

  // =========================================================================
  // 2. MAIN DOMAIN: PROTECT ADMIN ACCESS
  // In production, /admin routes MUST NOT open on the main domain (cedarelevators.in).
  // They are strictly redirected to the dedicated admin subdomain (https://admin.cedarelevators.in).
  // =========================================================================
  if (url.pathname.startsWith('/admin')) {
    if (!isLocalhost) {
      // In production: Redirect https://cedarelevators.in/admin -> https://admin.cedarelevators.in/
      const subPath =
        url.pathname === '/admin' || url.pathname === '/admin/' || url.pathname === '/admin/login' || url.pathname === '/admin/login/'
          ? '/'
          : url.pathname.replace(/^\/admin/, '') || '/'
      const redirectUrl = new URL(subPath, `https://${configuredAdminDomain}`)
      redirectUrl.search = url.search
      return NextResponse.redirect(redirectUrl, 308)
    }

    // In local development (localhost:3000): Redirect legacy /admin/login to /admin
    if (url.pathname === '/admin/login' || url.pathname === '/admin/login/') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    // In local development (localhost:3000): Allow /admin entry point with session refresh
    const nextResponse = NextResponse.next()
    return await refreshAdminSupabaseSession(request, nextResponse)
  }

  // =========================================================================
  // 3. STOREFRONT: REDIRECT DORMANT E-COMMERCE & LEGACY ROUTES TO CANONICAL PRODUCTS
  // =========================================================================
  if (isDormantCommerceRoute(request)) {
    return NextResponse.redirect(new URL('/products', request.url))
  }

  // Canonicalize legacy /catalog to single /products destination with query preservation
  if (url.pathname === '/catalog' || url.pathname === '/catalog/') {
    const redirectUrl = new URL('/products', request.url)
    redirectUrl.search = url.search
    return NextResponse.redirect(redirectUrl, 301)
  }

  if (url.pathname.startsWith('/catalog/categories/')) {
    const handle = url.pathname.replace(/^\/catalog\/categories\//, '')
    return NextResponse.redirect(new URL(`/products?category=${handle}`, request.url), 301)
  }

  if (url.pathname.startsWith('/catalog/applications/')) {
    const handle = url.pathname.replace(/^\/catalog\/applications\//, '')
    return NextResponse.redirect(new URL(`/products?application=${handle}`, request.url), 301)
  }

  if (url.pathname.startsWith('/catalog/types/')) {
    const handle = url.pathname.replace(/^\/catalog\/types\//, '')
    return NextResponse.redirect(new URL(`/products?type=${handle}`, request.url), 301)
  }

  if (url.pathname.startsWith('/catalog/collections/')) {
    const handle = url.pathname.replace(/^\/catalog\/collections\//, '')
    return NextResponse.redirect(new URL(`/products?collection=${handle}`, request.url), 301)
  }

  // Normalize legacy category handle routes to canonical /products?category=...
  if (url.pathname.startsWith('/categories/') && url.pathname !== '/categories/') {
    const handle = url.pathname.replace(/^\/categories\//, '')
    return NextResponse.redirect(new URL(`/products?category=${handle}`, request.url), 301)
  }

  // Legacy /store route normalization
  if (url.pathname === '/store' || url.pathname === '/store/') {
    return NextResponse.redirect(new URL('/products', request.url), 301)
  }

  // =========================================================================
  // 4. ALL OTHER CUSTOMER-FACING STOREFRONT ROUTES: ALLOW THROUGH
  // =========================================================================
  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp4|webm|ogg|mov|mp3|wav|m4a|avi)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
