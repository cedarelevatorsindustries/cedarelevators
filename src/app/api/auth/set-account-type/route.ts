import { auth, clerkClient, currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { getOrCreateUser, switchProfile, createBusinessProfile } from "@/lib/services/auth-sync"

export async function POST(request: Request) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { accountType } = body

        if (!accountType || !["individual", "business"].includes(accountType)) {
            return NextResponse.json(
                { error: "Invalid account type. Must be 'individual' or 'business'" },
                { status: 400 }
            )
        }

        // Get current user details from Clerk
        const clerkUser = await currentUser()
        if (!clerkUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        // Update user metadata in Clerk
        const client = await clerkClient()
        await client.users.updateUser(userId, {
            unsafeMetadata: {
                accountType,
            },
        })

        // Create or get user in Supabase with the account type
        const user = await getOrCreateUser(userId, clerkUser)

        if (!user) {
            return NextResponse.json(
                { error: "Failed to create user in database" },
                { status: 500 }
            )
        }

        // Switch to the appropriate profile type
        // If business, ensure business profile exists
        if (accountType === 'business') {
            await createBusinessProfile(user.id, {
                name: `${user.name || 'My'} Business`
            })
            // createBusinessProfile automatically activates it
        } else {
            // Ensure default individual is active
            await switchProfile(user.id, accountType)
        }

        return NextResponse.json({
            success: true,
            data: {
                userId: user.id,
                clerkId: userId,
                accountType,
            },
        })
    } catch (error: any) {
        console.error("Error setting account type:", error)
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        )
    }
}
