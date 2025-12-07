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
  '/individual-signup(.*)',
  '/business-signup(.*)',
  '/api/webhooks(.*)',
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

  // Protect authenticated routes
  if (isProtectedRoute(request) || isBusinessRoute(request)) {
    await auth.protect({
      unauthenticatedUrl: signInUrl.toString(),
      unauthorizedUrl: signInUrl.toString(),
    })
  }

  // Protect business-only routes - redirect non-business users to dashboard
  if (isBusinessRoute(request)) {
    const { userId } = await auth()
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
