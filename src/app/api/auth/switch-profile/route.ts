import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { switchProfile, getOrCreateUser } from '@/lib/services/auth-sync'

export async function POST(request: NextRequest) {
    try {
        const clerkUser = await currentUser()

        if (!clerkUser) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { profileType } = body

        if (!profileType || !['individual', 'business'].includes(profileType)) {
            return NextResponse.json(
                { error: 'Invalid profile type' },
                { status: 400 }
            )
        }

        // Get user
        const user = await getOrCreateUser(clerkUser.id)
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Switch profile
        const result = await switchProfile(user.id, profileType)

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Failed to switch profile' },
                { status: 400 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error switching profile:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

