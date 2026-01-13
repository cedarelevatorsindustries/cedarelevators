// Temporary script to update Clerk metadata for user
// Run this once to fix the user's account type

import { clerkClient } from '@clerk/nextjs/server'

async function fixUserMetadata() {
    const client = await clerkClient()

    const userId = 'user_387ZZG94crD3rtCOKWoH2TW1mr8'

    await client.users.updateUserMetadata(userId, {
        unsafeMetadata: {
            accountType: 'business',
            is_verified: false,
            verificationStatus: 'pending'
        }
    })

    console.log('Updated Clerk metadata for:', userId)
}

fixUserMetadata()
