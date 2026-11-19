/**
 * Middleware Protection Code for Checkout Routes
 * Add this logic to your existing middleware.ts file
 * 
 * NOTE: This is a reference implementation. The actual user type check
 * should happen in the checkout page itself since middleware can't easily
 * access Supabase with proper cookies.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function checkoutMiddleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const searchParams = request.nextUrl.searchParams

    // CHECKOUT ROUTE PROTECTION
    if (pathname === '/checkout') {
        const source = searchParams.get('source')

        // Get user auth
        const { userId } = await auth()

        // Guest: Block always
        if (!userId) {
            return NextResponse.redirect(new URL('/sign-in?redirect=/checkout', request.url))
        }

        // For authenticated users, let them through to the checkout page
        // The actual role/verification check will happen in the checkout page itself
        // where we have access to Supabase with proper session handling

        // The checkout template already handles:
        // - Redirecting unverified business to /profile/business/verify
        // - Redirecting guests to /sign-in
        // - Showing appropriate UI for individuals vs business users
    }

    return NextResponse.next()
}

/**
 * Alternative: Store user type in Clerk metadata
 * 
 * If you want to enforce rules in middleware, store the user type
 * in Clerk's publicMetadata when they register/verify:
 * 
 * await clerkClient.users.updateUserMetadata(userId, {
 *   publicMetadata: {
 *     userType: 'business_verified' | 'business_unverified' | 'individual'
 *   }
 * })
 * 
 * Then check it here:
 * const user = await clerkClient.users.getUser(userId)
 * const userType = user.publicMetadata.userType
 */
