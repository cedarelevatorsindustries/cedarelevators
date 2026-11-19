import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

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
])

// Admin authentication exceptions (e.g. login/setup/invite pages)
const isAdminAuthBypass = createRouteMatcher([
  '/admin/login(.*)',
  '/admin/setup(.*)',
  '/admin/recover(.*)',
  '/admin/pending(.*)',
  '/admin/invite(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  const url = request.nextUrl
  const hostname = request.headers.get("host") || ""

  // 1. Phase 1 Scope: Redirect dormant e-commerce & customer profile routes to catalogue
  if (isDormantCommerceRoute(request)) {
    return NextResponse.redirect(new URL('/products', request.url))
  }

  // 2. Admin Subdomain Routing (if admin. subdomain is used)
  const isAdminSubdomain = hostname.startsWith("admin.")
  if (isAdminSubdomain) {
    if (url.pathname.startsWith('/api/')) {
      return // Allow API routes to pass through directly
    }

    if (!url.pathname.startsWith('/admin')) {
      return NextResponse.rewrite(new URL(`/admin${url.pathname}`, request.url))
    }
  }

  // 3. Admin Route Protection: Require Clerk authentication for all /admin routes
  if (isAdminRoute(request) && !isAdminAuthBypass(request)) {
    await auth.protect()
  }

  // All other routes (catalogue, quotes, contact, home) are fully public in Phase 1
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
