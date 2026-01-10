import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/server'

/**
 * GET /api/auth/user-profile
 * Returns the current user's profile information including business verification status
 */
export async function GET() {
    try {
        const authUser = await getAuthUser()

        if (!authUser) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            )
        }

        return NextResponse.json({
            userType: authUser.userType,
            isVerified: authUser.isVerified,
            activeProfile: {
                id: authUser.activeProfile.id,
                profile_type: authUser.activeProfile.profile_type,
                is_active: authUser.activeProfile.is_active
            },
            business: authUser.business ? {
                id: authUser.business.id,
                name: authUser.business.name,
                verification_status: authUser.business.verification_status
            } : null
        })
    } catch (error) {
        console.error('Error fetching user profile:', error)
        return NextResponse.json(
            { error: 'Failed to fetch user profile' },
            { status: 500 }
        )
    }
}
