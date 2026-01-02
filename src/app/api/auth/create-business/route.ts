import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createBusinessProfile, getOrCreateUser } from '@/lib/services/auth-sync'

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
        const { name, gst_number, pan_number } = body

        if (!name || name.trim().length === 0) {
            return NextResponse.json(
                { error: 'Business name is required' },
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

        // Create business profile
        const result = await createBusinessProfile(user.id, {
            name,
            gst_number,
            pan_number
        })

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Failed to create business profile' },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            businessId: result.businessId
        })
    } catch (error) {
        console.error('Error creating business profile:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
