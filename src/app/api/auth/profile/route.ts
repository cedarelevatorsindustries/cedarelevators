import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getUserWithProfile } from '@/lib/services/auth-sync'

export async function GET(request: NextRequest) {
    try {


        // Note: currentUser() cannot be cached with unstable_cache because it uses headers() internally
        // Clerk handles session caching internally, and we use Cache-Control header for response caching
        const clerkUser = await currentUser()

        if (!clerkUser) {

            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }



        // Get user with profile from Supabase
        // Pass the cached clerkUser to avoid redundant API calls
        const userWithProfile = await getUserWithProfile(clerkUser.id, clerkUser)



        if (!userWithProfile) {

            return NextResponse.json(
                { error: 'User profile not found' },
                { status: 404 }
            )
        }

        const { user, activeProfile, business, hasBusinessProfile } = userWithProfile

        // Derive user type
        let userType: 'guest' | 'individual' | 'business' | 'verified' = 'individual'
        let isVerified = false

        if (activeProfile.profile_type === 'business') {
            if (business?.verification_status === 'verified') {
                userType = 'verified'
                isVerified = true
            } else {
                userType = 'business'
            }
        }

        // Return enhanced user data with cache headers
        // IMPORTANT: hasBusinessProfile now comes from the independent check in getUserWithProfile
        // This ensures it's accurate even if business data fails to load
        return NextResponse.json({
            clerkId: clerkUser.id,
            userId: user.id,
            email: user.email,
            name: user.name,
            imageUrl: clerkUser.imageUrl || null,
            activeProfile: {
                id: activeProfile.id,
                profile_type: activeProfile.profile_type,
                is_active: activeProfile.is_active
            },
            business: business || null,
            userType,
            isVerified,
            hasBusinessProfile  // Now independent of business data loading success
        }, {
            headers: {
                'Cache-Control': 'private, max-age=60', // Cache on client for 60 seconds
            }
        })
    } catch (error) {
        console.error('Error fetching user profile:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
