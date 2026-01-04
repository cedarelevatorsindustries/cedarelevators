'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { currentUser } from '@clerk/nextjs/server'

export interface VerificationRequest {
    businessId: string
    companyAddress: string
    contactPerson: string
    contactPhone: string
    gstNumber?: string
    panNumber?: string
    documents: {
        gst_certificate?: string
        company_registration?: string
        pan_card?: string
    }
    additionalNotes?: string
}

export interface VerificationStatus {
    status: 'unverified' | 'pending' | 'verified' | 'rejected'
    requestedAt?: string
    verifiedAt?: string
    rejectedAt?: string
    notes?: string
    documents?: any
}

/**
 * Submit business verification request
 */
export async function submitVerificationRequest(
    data: VerificationRequest
): Promise<{ success: boolean; error?: string }> {
    try {
        const user = await currentUser()
        if (!user) {
            return { success: false, error: 'Unauthorized' }
        }

        const supabase = createAdminClient()

        // Verify business ownership
        const { data: businessMember } = await supabase
            .from('business_members')
            .select('role')
            .eq('business_id', data.businessId)
            .eq('user_id', (await supabase.from('users').select('id').eq('clerk_user_id', user.id).single()).data?.id)
            .single()

        if (!businessMember || businessMember.role !== 'owner') {
            return { success: false, error: 'Only business owners can submit verification requests' }
        }

        // Update business with verification request
        const { error } = await supabase
            .from('businesses')
            .update({
                verification_status: 'pending',
                verification_requested_at: new Date().toISOString(),
                company_address: data.companyAddress,
                contact_person: data.contactPerson,
                contact_phone: data.contactPhone,
                gst_number: data.gstNumber || null,
                pan_number: data.panNumber || null,
                verification_documents: data.documents,
                verification_notes: data.additionalNotes || null
            })
            .eq('id', data.businessId)

        if (error) {
            console.error('Error submitting verification:', error)
            return { success: false, error: 'Failed to submit verification request' }
        }

        // TODO: Send email notification to admin

        return { success: true }
    } catch (error: any) {
        console.error('Error in submitVerificationRequest:', error)
        return { success: false, error: error.message || 'Failed to submit verification request' }
    }
}

/**
 * Get verification status for a business
 */
export async function getVerificationStatus(
    businessId: string
): Promise<{ success: boolean; data?: VerificationStatus; error?: string }> {
    try {
        const supabase = createAdminClient()

        const { data: business, error } = await supabase
            .from('businesses')
            .select('verification_status, verification_requested_at, verified_at, verification_notes, verification_documents')
            .eq('id', businessId)
            .single()

        if (error) {
            return { success: false, error: 'Business not found' }
        }

        return {
            success: true,
            data: {
                status: business.verification_status,
                requestedAt: business.verification_requested_at,
                verifiedAt: business.verified_at,
                notes: business.verification_notes,
                documents: business.verification_documents
            }
        }
    } catch (error: any) {
        console.error('Error in getVerificationStatus:', error)
        return { success: false, error: error.message || 'Failed to get verification status' }
    }
}

/**
 * Admin: Approve business verification
 */
export async function approveVerification(
    businessId: string,
    adminNotes?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const user = await currentUser()
        if (!user) {
            return { success: false, error: 'Unauthorized' }
        }

        // TODO: Verify admin role from Clerk metadata

        const supabase = createAdminClient()

        const { error } = await supabase
            .from('businesses')
            .update({
                verification_status: 'verified',
                verified_at: new Date().toISOString(),
                verified_by: user.id,
                verification_notes: adminNotes || null
            })
            .eq('id', businessId)

        if (error) {
            console.error('Error approving verification:', error)
            return { success: false, error: 'Failed to approve verification' }
        }

        // TODO: Send email notification to business owner
        // TODO: Log audit trail

        return { success: true }
    } catch (error: any) {
        console.error('Error in approveVerification:', error)
        return { success: false, error: error.message || 'Failed to approve verification' }
    }
}

/**
 * Admin: Reject business verification
 */
export async function rejectVerification(
    businessId: string,
    reason: string
): Promise<{ success: boolean; error?: string }> {
    try {
        if (!reason || reason.trim().length === 0) {
            return { success: false, error: 'Rejection reason is required' }
        }

        const user = await currentUser()
        if (!user) {
            return { success: false, error: 'Unauthorized' }
        }

        // TODO: Verify admin role from Clerk metadata

        const supabase = createAdminClient()

        const { error } = await supabase
            .from('businesses')
            .update({
                verification_status: 'rejected',
                verification_notes: reason
            })
            .eq('id', businessId)

        if (error) {
            console.error('Error rejecting verification:', error)
            return { success: false, error: 'Failed to reject verification' }
        }

        // TODO: Send email notification to business owner
        // TODO: Log audit trail

        return { success: true }
    } catch (error: any) {
        console.error('Error in rejectVerification:', error)
        return { success: false, error: error.message || 'Failed to reject verification' }
    }
}

/**
 * Get business details for admin review
 */
export async function getBusinessForReview(
    businessId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
        const supabase = createAdminClient()

        const { data: business, error } = await supabase
            .from('businesses')
            .select(`
        *,
        business_members!inner(
          user_id,
          role,
          users(
            clerk_user_id,
            email,
            name,
            phone
          )
        )
      `)
            .eq('id', businessId)
            .single()

        if (error) {
            return { success: false, error: 'Business not found' }
        }

        return { success: true, data: business }
    } catch (error: any) {
        console.error('Error in getBusinessForReview:', error)
        return { success: false, error: error.message || 'Failed to get business details' }
    }
}

