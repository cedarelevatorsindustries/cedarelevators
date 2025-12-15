import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/nextjs/server'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/products(.*)',
  '/collections(.*)',
  '/categories(.*)',
  '/login(.*)',
  '/register(.*)',
  '/forgot-password(.*)',
  '/reset-password(.*)',
  '/verify-otp(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/choose-type(.*)',
  '/sso-callback(.*)',
  '/individual-signup(.*)',
  '/business-signup(.*)',
  '/select-role(.*)',
  '/api/webhooks(.*)',
  '/api/auth/update-role(.*)',
  '/api/sync-role(.*)',
  '/request-quote(.*)',
])

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/orders(.*)',
  '/account(.*)',
  '/addresses(.*)',
  '/wishlist(.*)',
  '/notifications(.*)',
  '/settings(.*)',
  '/password(.*)',
  '/verification(.*)',
])

// Define business-only routes
const isBusinessRoute = createRouteMatcher([
  '/quotes(.*)',
  '/bulk-orders(.*)',
  '/invoices(.*)',
  '/team(.*)',
  '/company(.*)',
  '/analytics(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  const signInUrl = new URL('/sign-in', request.url)
  const dashboardUrl = new URL('/dashboard', request.url)

  // Check if user is authenticated and needs account type selection
  const { userId } = await auth()
  if (userId && 
      !request.nextUrl.pathname.startsWith('/choose-type') && 
      !request.nextUrl.pathname.startsWith('/sso-callback') &&
      !request.nextUrl.pathname.startsWith('/api/auth/update-role') &&
      !request.nextUrl.pathname.startsWith('/api/sync-role')) {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const accountType = (user.unsafeMetadata?.accountType as string) ||
      (user.publicMetadata?.accountType as string)

    // If user doesn't have account type and is trying to access protected routes, redirect to choose-type
    if (!accountType && (isProtectedRoute(request) || isBusinessRoute(request))) {
      const chooseTypeUrl = new URL('/choose-type', request.url)
      return Response.redirect(chooseTypeUrl.toString())
    }
  }

  // Protect authenticated routes
  if (isProtectedRoute(request) || isBusinessRoute(request)) {
    await auth.protect({
      unauthenticatedUrl: signInUrl.toString(),
      unauthorizedUrl: signInUrl.toString(),
    })
  }

  // Protect business-only routes - redirect non-business users to dashboard
  if (isBusinessRoute(request)) {
    if (userId) {
      const client = await clerkClient()
      const user = await client.users.getUser(userId)
      const accountType = (user.unsafeMetadata?.accountType as string) ||
        (user.publicMetadata?.accountType as string)

      if (accountType !== 'business') {
        return Response.redirect(dashboardUrl.toString())
      }
    }
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
