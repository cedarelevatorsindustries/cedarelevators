import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/products(.*)',
  '/api/webhooks(.*)',
])

const isCheckoutRoute = createRouteMatcher(['/checkout(.*)'])

import { NextResponse } from 'next/server'

export default clerkMiddleware(async (auth, request) => {
  const url = request.nextUrl
  const hostname = request.headers.get("host") || ""

  // Define domains
  const isDev = process.env.NODE_ENV === 'development'
  const adminUrlStr = process.env.NEXT_PUBLIC_ADMIN_URL || (isDev ? 'http://admin.localhost:3000' : 'https://admin.cedarelevators.com')
  const mainUrlStr = process.env.NEXT_PUBLIC_BASE_URL || (isDev ? 'http://localhost:3000' : 'https://www.cedarelevators.com')

  // Extract clean hostnames
  let adminHost = adminUrlStr.replace(/^https?:\/\//, '')
  // If it contains port, keep it (dev), or strip it? 
  // request.headers.get("host") includes port in dev (e.g. localhost:3000)
  // NEXT_PUBLIC_ADMIN_URL usually is https://admin.example.com (no port in prod)
  // Let's use simple logic: if hostname starts with "admin.", it's admin.

  const isAdminSubdomain = hostname.startsWith("admin.")

  // 1. Admin Subdomain Logic
  if (isAdminSubdomain) {
    // Determine the path to rewrite to.
    // If the user requests `admin.com/dashboard`, we want to serve `/admin/dashboard`.
    // But `src/app/admin` is the folder.
    // Rewrite `admin.com/` -> `/admin`
    // Rewrite `admin.com/foo` -> `/admin/foo`

    // Check if the path actually exists? No, rewrite blindly, let Next router handle 404.

    // Prevent infinite rewrite loop?
    // If we are already at /admin, we don't need to rewrite?
    // If the incoming request is `/admin/foo` on `admin.com`, logic below writes it to `/admin/admin/foo`?
    // Yes. So strict check:

    if (!url.pathname.startsWith('/admin')) {
      return NextResponse.rewrite(new URL(`/admin${url.pathname}`, request.url))
    }
  }

  // 2. Main Domain Logic - Redirect /admin access to subdomain
  if (!isAdminSubdomain && url.pathname.startsWith('/admin')) {
    const newUrl = new URL(adminUrlStr)
    // Keep the path (strip /admin prefix from it? or keep it?)
    // If user goes to example.com/admin/dashboard.
    // Admin subdomain maps `admin.com/dashboard` -> `/admin/dashboard`.
    // So we want to redirect to `admin.com/dashboard`.
    // We need to strip `/admin` from the path.

    const pathWithoutAdmin = url.pathname.replace(/^\/admin/, '') || '/'
    newUrl.pathname = pathWithoutAdmin
    newUrl.search = url.search

    return NextResponse.redirect(newUrl)
  }

  // Protect checkout routes - require authentication
  if (isCheckoutRoute(request)) {
    await auth.protect()
  }

  // Allow public routes
  if (!isPublicRoute(request)) {
    // Protect all other routes by default
    // You can customize this based on your needs
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

