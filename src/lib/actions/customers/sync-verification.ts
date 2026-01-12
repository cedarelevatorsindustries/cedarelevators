'use server'

import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * Sync verification status from database to Clerk metadata.
 * This should be called to fix users whose Clerk metadata wasn't updated
 * when their verification was approved.
 */
export async function syncVerificationToClerk(targetUserId?: string) {
    const { userId } = await auth()

    // Only admins can sync other users, regular users can sync themselves
    const userIdToSync = targetUserId || userId

    if (!userIdToSync) {
        return { success: false, error: 'Not authenticated' }
    }

    try {
        const supabase = createAdminClient()

        // Get the user's profile and verification status from database
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('clerk_user_id, business_id, account_type')
            .eq('clerk_user_id', userIdToSync)
            .single()

        if (!profile) {
            return { success: false, error: 'User profile not found' }
        }

        // If business account, check verification status
        if (profile.account_type === 'business') {
            // Check business_verifications table
            const { data: verification } = await supabase
                .from('business_verifications')
                .select('status')
                .eq('user_id', userIdToSync)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            if (verification?.status === 'approved') {
                // Update Clerk metadata with the correct verification status
                const { clerkClient } = await import('@clerk/nextjs/server')
                const client = await clerkClient()

                await client.users.updateUserMetadata(userIdToSync, {
                    unsafeMetadata: {
                        verificationStatus: 'approved',
                        is_verified: true
                    }
                })

                console.log('[syncVerificationToClerk] Updated Clerk metadata for user:', userIdToSync)
                return { success: true, status: 'approved' }
            } else {
                return { success: true, status: verification?.status || 'not_found' }
            }
        }

        return { success: true, status: 'not_business' }

    } catch (error: any) {
        console.error('[syncVerificationToClerk] Error:', error)
        return { success: false, error: error.message }
    }
}
