'use server'

import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * Sync verification status from database to Clerk metadata.
 * This should be called to fix users whose Clerk metadata wasn't updated
 * when their verification was approved.
 */
export async function syncVerificationToClerk(targetUserId?: string) {
    const { userId: currentUserId } = await auth()

    // Only admins can sync other users, regular users can sync themselves
    const clerkUserId = targetUserId || currentUserId

    if (!clerkUserId) {
        return { success: false, error: 'Not authenticated' }
    }

    try {
        const supabase = createAdminClient()

        // Get the user's profile and verification status from database
        // user_profiles has both the clerk_user_id and the Supabase UUID (id)
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('id, clerk_user_id, business_id, account_type')
            .eq('clerk_user_id', clerkUserId)
            .single()

        if (!profile) {
            console.log('[syncVerificationToClerk] User profile not found for:', clerkUserId)
            return { success: false, error: 'User profile not found' }
        }

        // If business account, check verification status
        if (profile.account_type === 'business') {
            console.log('[syncVerificationToClerk] Checking verification for business user:', clerkUserId)

            // business_verifications.user_id stores the Supabase UUID (profile.id), NOT the Clerk ID!
            const supabaseUserId = profile.id

            // Check business_verifications table using the Supabase UUID
            const { data: verification } = await supabase
                .from('business_verifications')
                .select('status, user_id')
                .eq('user_id', supabaseUserId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            console.log('[syncVerificationToClerk] Verification result:', verification)

            if (verification?.status === 'approved') {
                // Update Clerk metadata with the correct verification status
                const { clerkClient } = await import('@clerk/nextjs/server')
                const client = await clerkClient()

                console.log('[syncVerificationToClerk] Updating Clerk metadata for:', clerkUserId)
                await client.users.updateUserMetadata(clerkUserId, {
                    unsafeMetadata: {
                        verificationStatus: 'approved',
                        is_verified: true
                    }
                })

                console.log('[syncVerificationToClerk] Successfully updated Clerk metadata')
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
