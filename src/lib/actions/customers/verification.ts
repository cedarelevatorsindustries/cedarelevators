'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { VerificationActionType, VerificationStatus } from '@/types/b2b/customer'
import { getCurrentAdminUser, canApproveVerification } from '@/lib/auth/admin-roles'

// =====================================================
// AUDIT LOG HELPER
// =====================================================

export async function logVerificationAction(
    customerClerkId: string,
    businessProfileId: string | undefined,
    actionType: VerificationActionType,
    details: {
        oldStatus?: VerificationStatus
        newStatus?: VerificationStatus
        notes?: string
        metadata?: Record<string, any>
    } = {}
): Promise<void> {
    // TODO: verification_audit_log table doesn't exist yet
    // Stubbed out for now
    return Promise.resolve()
}

// =====================================================
// APPROVE VERIFICATION (ADMIN ONLY)
// =====================================================

export async function approveVerification(
    businessProfileId: string,
    notes?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Permission check
        // const canApprove = await canApproveVerification()
        // if (!canApprove) {
        //   return { success: false, error: 'Insufficient permissions to approve verifications' }
        // }

        const supabase = createAdminClient()
        if (!supabase) {
            return { success: false, error: 'Database connection failed' }
        }

        // Attempt to find in business_profiles first
        let targetTable = 'business_profiles'
        let profile: any
        let fetchError: any

        const { data: bpData, error: bpError } = await supabase
            .from('business_profiles')
            .select('*')
            .eq('id', businessProfileId)
            .single()

        if (bpData) {
            profile = bpData
        } else {
            // If not found, try business_verifications (legacy table support)
            const { data: bvData, error: bvError } = await supabase
                .from('business_verifications')
                .select('*')
                .eq('id', businessProfileId)
                .single()

            if (bvData) {
                profile = bvData
                targetTable = 'business_verifications'
            } else {
                return { success: false, error: 'Business profile/verification not found' }
            }
        }

        // Check if profile is in pending status
        // Note: business_verifications uses 'status', business_profiles uses 'verification_status'
        const statusField = targetTable === 'business_profiles' ? 'verification_status' : 'status'
        const currentStatus = profile[statusField]

        if (currentStatus !== 'pending') {
            return { success: false, error: 'Only pending verifications can be approved' }
        }

        const adminUser = await getCurrentAdminUser()
        const updateTime = new Date().toISOString()
        const userId = targetTable === 'business_profiles' ? profile.clerk_user_id : profile.user_id

        // Update verification status
        // business_verifications only has: id, user_id, legal_business_name, contact_person_name, contact_person_phone, gstin, status, rejection_reason, created_at, updated_at

        let updateData: any = {
            updated_at: updateTime,
        }

        if (targetTable === 'business_profiles') {
            updateData.verification_status = 'verified' // business_profiles uses 'verified'
            updateData.verified_by = adminUser?.id
            updateData.verified_at = updateTime
            updateData.verification_notes = notes
            updateData.last_verification_check_at = updateTime
        } else {
            // business_verifications table
            updateData.status = 'approved' // business_verifications uses 'approved'
            updateData.reviewed_at = updateTime
            updateData.reviewed_by = adminUser?.id || 'unknown'
        }

        const { error: updateError } = await supabase
            .from(targetTable)
            .update(updateData)
            .eq('id', businessProfileId)

        if (updateError) {
            return { success: false, error: updateError.message }
        }

        // Find the business_id - either from profile or via business_members lookup
        let businessId = profile.business_id

        // If business_id is not set, find it via business_members table
        if (targetTable === 'business_verifications' && !businessId) {
            const { data: businessMember } = await supabase
                .from('business_members')
                .select('business_id')
                .eq('user_id', userId)
                .single()

            if (businessMember?.business_id) {
                businessId = businessMember.business_id

                // Update the verification record with the business_id
                await supabase
                    .from('business_verifications')
                    .update({ business_id: businessId })
                    .eq('id', businessProfileId)
            }
        }

        // Update businesses table when verification is approved
        // CRITICAL: Update both verification_status AND status columns
        if (targetTable === 'business_verifications' && businessId) {
            console.log('[approveVerification] Updating businesses table for business_id:', businessId)
            const { error: businessUpdateError } = await supabase
                .from('businesses')
                .update({
                    status: 'verified',
                    verification_status: 'verified',
                    verified_at: updateTime
                })
                .eq('id', businessId)

            if (businessUpdateError) {
                console.error('[approveVerification] Error updating businesses:', businessUpdateError)
            } else {
                console.log('[approveVerification] Successfully updated businesses table')
            }
        }

        // Update customer_meta
        // For business_verifications, we need the clerk user id. usually user_id key holds it.
        // If not, we might need to look up user_profiles if userId is not the clerk id.
        // Assuming profile.clerk_user_id or profile.user_id is the key.
        const clerkIdToUpdate = profile.clerk_user_id || profile.user_id

        if (clerkIdToUpdate) {
            await supabase
                .from('customer_meta')
                .update({ business_verified: true })
                .eq('clerk_user_id', clerkIdToUpdate)

            // Update Clerk user metadata to reflect verified status
            try {
                const { clerkClient } = await import('@clerk/nextjs/server')
                const client = await clerkClient()
                await client.users.updateUserMetadata(clerkIdToUpdate, {
                    unsafeMetadata: {
                        verification_status: 'verified',
                        is_verified: true
                    }
                })
            } catch (clerkError) {
                console.error('Error updating Clerk metadata:', clerkError)
                // Don't fail the entire operation if Clerk update fails
            }
        }

        // Log the action
        await logVerificationAction(
            clerkIdToUpdate,
            businessProfileId,
            'verification_approved',
            {
                oldStatus: currentStatus,
                newStatus: 'verified',
                notes,
                metadata: {
                    company_name: profile.company_name || profile.legal_business_name,
                },
            }
        )

        // Send verification approved email
        try {
            const { sendVerificationStatus } = await import('@/lib/services/email')

            // Get user email
            const { data: userData } = await supabase
                .from('user_profiles')
                .select('email')
                .eq('clerk_user_id', clerkIdToUpdate)
                .single()

            if (userData?.email) {
                await sendVerificationStatus(userData.email, 'approved', profile.company_name || profile.legal_business_name, notes)
                console.log('Sent verification approved email to:', userData.email)
            } else {
                console.warn('Could not find user email to send verification notification')
            }
        } catch (emailError) {
            console.error('Error sending verification email:', emailError)
        }

        revalidatePath('/admin/customers')
        if (clerkIdToUpdate) {
            revalidatePath(`/admin/customers/${clerkIdToUpdate}`)
        }

        return { success: true }
    } catch (error: any) {
        console.error('Error in approveVerification:', error)
        return { success: false, error: error.message || 'Failed to approve verification' }
    }
}

// =====================================================
// REJECT VERIFICATION (ADMIN ONLY)
// =====================================================

export async function rejectVerification(
    businessProfileId: string,
    reason: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Permission check
        // const canApprove = await canApproveVerification()
        // if (!canApprove) {
        //   return { success: false, error: 'Insufficient permissions to reject verifications' }
        // }

        if (!reason || reason.trim().length === 0) {
            return { success: false, error: 'Rejection reason is required' }
        }

        const supabase = createAdminClient()
        if (!supabase) {
            return { success: false, error: 'Database connection failed' }
        }

        // Attempt to find in business_profiles first
        let targetTable = 'business_profiles'
        let profile: any

        const { data: bpData } = await supabase
            .from('business_profiles')
            .select('*')
            .eq('id', businessProfileId)
            .single()

        if (bpData) {
            profile = bpData
        } else {
            // If not found, try business_verifications (legacy table support)
            const { data: bvData } = await supabase
                .from('business_verifications')
                .select('*')
                .eq('id', businessProfileId)
                .single()

            if (bvData) {
                profile = bvData
                targetTable = 'business_verifications'
            } else {
                return { success: false, error: 'Business profile/verification not found' }
            }
        }

        // Check if profile is in pending status
        const statusField = targetTable === 'business_profiles' ? 'verification_status' : 'status'
        const currentStatus = profile[statusField]

        if (currentStatus !== 'pending') {
            return { success: false, error: 'Only pending verifications can be rejected' }
        }

        const adminUser = await getCurrentAdminUser()
        const updateTime = new Date().toISOString()
        const userId = targetTable === 'business_profiles' ? profile.clerk_user_id : profile.user_id

        // Update verification status
        // business_verifications only has: id, user_id, legal_business_name, contact_person_name, contact_person_phone, gstin, status, rejection_reason, created_at, updated_at

        let updateData: any = {
            updated_at: updateTime,
        }

        if (targetTable === 'business_profiles') {
            updateData.verification_status = 'rejected'
            updateData.verified_by = adminUser?.id // store who rejected
            updateData.rejected_at = updateTime
            updateData.verification_notes = reason
            // updateData.rejection_reason = reason // IF exists
        } else {
            // business_verifications table
            updateData.status = 'rejected'
            updateData.rejection_reason = reason
            // No verification_notes or rejected_at in business_verifications
        }

        const { error: updateError } = await supabase
            .from(targetTable)
            .update(updateData)
            .eq('id', businessProfileId)

        if (updateError) {
            return { success: false, error: updateError.message }
        }

        // Update businesses.status to 'rejected' when verification is rejected
        // This ensures the frontend verification checks work correctly
        if (targetTable === 'business_verifications' && profile.business_id) {
            await supabase
                .from('businesses')
                .update({ status: 'rejected' })
                .eq('id', profile.business_id)
        }

        // Update customer_meta
        const clerkIdToUpdate = profile.clerk_user_id || profile.user_id

        if (clerkIdToUpdate) {
            await supabase
                .from('customer_meta')
                .update({ business_verified: false })
                .eq('clerk_user_id', clerkIdToUpdate)

            // Update Clerk user metadata to reflect rejected status
            try {
                const { clerkClient } = await import('@clerk/nextjs/server')
                const client = await clerkClient()
                await client.users.updateUserMetadata(clerkIdToUpdate, {
                    unsafeMetadata: {
                        verification_status: 'rejected',
                        is_verified: false
                    }
                })
            } catch (clerkError) {
                console.error('Error updating Clerk metadata:', clerkError)
                // Don't fail the entire operation if Clerk update fails
            }
        }

        // Log the action
        await logVerificationAction(
            clerkIdToUpdate,
            businessProfileId,
            'verification_rejected',
            {
                oldStatus: currentStatus,
                newStatus: 'rejected',
                notes: reason,
                metadata: {
                    company_name: profile.company_name || profile.legal_business_name,
                },
            }
        )

        // Send verification rejected email
        try {
            const { sendVerificationStatus } = await import('@/lib/services/email')

            const { data: userData } = await supabase
                .from('user_profiles')
                .select('email')
                .eq('clerk_user_id', clerkIdToUpdate)
                .single()

            if (userData?.email) {
                await sendVerificationStatus(userData.email, 'rejected', profile.company_name || profile.legal_business_name, reason)
                console.log('Sent verification rejected email to:', userData.email)
            } else {
                console.warn('Could not find user email to send verification notification')
            }
        } catch (emailError) {
            console.error('Error sending verification email:', emailError)
        }

        revalidatePath('/admin/customers')
        if (clerkIdToUpdate) {
            revalidatePath(`/admin/customers/${clerkIdToUpdate}`)
        }

        return { success: true }
    } catch (error: any) {
        console.error('Error in rejectVerification:', error)
        return { success: false, error: error.message || 'Failed to reject verification' }
    }
}

// =====================================================
// REQUEST MORE DOCUMENTS (ADMIN ONLY)
// =====================================================

export async function requestMoreDocuments(
    businessProfileId: string,
    documentTypes: string[],
    message: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Permission check
        const canApprove = await canApproveVerification()
        if (!canApprove) {
            return { success: false, error: 'Insufficient permissions' }
        }

        const supabase = createAdminClient()
        if (!supabase) {
            return { success: false, error: 'Database connection failed' }
        }

        // Get current profile
        const { data: profile, error: fetchError } = await supabase
            .from('business_profiles')
            .select('*')
            .eq('id', businessProfileId)
            .single()

        if (fetchError || !profile) {
            return { success: false, error: 'Business profile not found' }
        }

        // Update verification notes
        const { error: updateError } = await supabase
            .from('business_profiles')
            .update({
                verification_notes: message,
                last_verification_check_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', businessProfileId)

        if (updateError) {
            return { success: false, error: updateError.message }
        }

        // Log action
        await logVerificationAction(
            profile.clerk_user_id,
            businessProfileId,
            'more_documents_requested',
            {
                notes: message,
                metadata: {
                    requested_documents: documentTypes
                }
            }
        )

        revalidatePath('/admin/customers')
        revalidatePath(`/admin/customers/${profile.clerk_user_id}`)

        return { success: true }
    } catch (error: any) {
        console.error('Error in requestMoreDocuments:', error)
        return { success: false, error: error.message || 'Failed to request documents' }
    }
}

// =====================================================
// APPROVE DOCUMENT (ADMIN ONLY)
// =====================================================

export async function approveDocument(
    documentId: string,
    notes?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createAdminClient()
        if (!supabase) {
            return { success: false, error: 'Database connection failed' }
        }

        const { error } = await supabase
            .from('verification_documents')
            .update({
                status: 'approved',
                reviewed_at: new Date().toISOString(),
            })
            .eq('id', documentId)

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/customers')
        return { success: true }
    } catch (error: any) {
        console.error('Error in approveDocument:', error)
        return { success: false, error: error.message || 'Failed to approve document' }
    }
}

// =====================================================
// REJECT DOCUMENT (ADMIN ONLY)
// =====================================================

export async function rejectDocument(
    documentId: string,
    reason: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createAdminClient()
        if (!supabase) {
            return { success: false, error: 'Database connection failed' }
        }

        const { error } = await supabase
            .from('verification_documents')
            .update({
                status: 'rejected',
                rejection_reason: reason,
                reviewed_at: new Date().toISOString(),
            })
            .eq('id', documentId)

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/customers')
        return { success: true }
    } catch (error: any) {
        console.error('Error in rejectDocument:', error)
        return { success: false, error: error.message || 'Failed to reject document' }
    }
}

// =====================================================
// GET VERIFICATION AUDIT LOG
// =====================================================

export async function getVerificationAuditLog(
    customerClerkId: string
): Promise<
    | { success: true; logs: any[] }
    | { success: false; error: string }
> {
    // Stubbed
    return { success: true, logs: [] }
}
