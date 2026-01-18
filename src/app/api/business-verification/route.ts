import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// GET - Get current user's verification status
export async function GET() {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const supabase = createAdminClient()

        // First, get the user from users table using clerk_user_id
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_user_id', userId)
            .maybeSingle()

        if (userError || !user) {
            // No user found
            return NextResponse.json({
                success: true,
                verification: null
            })
        }


        // Get verification with documents using users.id (matching POST logic)
        const { data: verification, error } = await supabase
            .from('business_verifications')
            .select(`
        *,
        documents:business_verification_documents(*)
      `)
            .eq('user_id', user.id)
            .maybeSingle()

        if (error && error.code !== 'PGRST116') {
            console.error('[Verification GET] Error fetching verification:', error)
        }

        return NextResponse.json({
            success: true,
            verification: verification || null
        })
    } catch (error) {
        console.error('Error fetching verification:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch verification' },
            { status: 500 }
        )
    }
}

// POST - Submit or update verification
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()

        // Use admin client to bypass RLS - RLS policies cause UUID casting errors
        const { createAdminClient } = await import('@/lib/supabase/server')
        const supabase = createAdminClient()

        // First, get the user from users table using clerk_user_id
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_user_id', userId)
            .maybeSingle()

        if (userError) {
            console.error('Error fetching user:', userError)
            return NextResponse.json(
                { success: false, error: 'Failed to fetch user' },
                { status: 500 }
            )
        }

        if (!user) {
            console.log('[Verification Debug] User not found for clerk_user_id:', userId)
            return NextResponse.json(
                { success: false, error: 'User not found. Please try logging out and logging back in.' },
                { status: 404 }
            )
        }

        console.log('[Verification Debug] Found user:', { userId, supabaseUserId: user.id })

        // Check if user has a business via business_members table
        // The link is: users.id → business_members.user_id → business_members.business_id → businesses
        const { data: businessMember, error: memberError } = await supabase
            .from('business_members')
            .select(`
                business_id,
                role,
                businesses (
                    id,
                    name,
                    verification_status
                )
            `)
            .eq('user_id', user.id)
            .maybeSingle()

        console.log('[Verification Debug] Business member lookup:', {
            userId: user.id,
            memberError,
            businessMember
        })

        if (memberError) {
            console.error('[Verification Debug] Error fetching business member:', memberError)
            return NextResponse.json(
                { success: false, error: 'Failed to fetch business' },
                { status: 500 }
            )
        }

        const business = businessMember?.businesses as any

        if (!business) {
            console.log('[Verification Debug] No business found for user:', user.id)
            return NextResponse.json(
                { success: false, error: 'Business account required. Please switch to a business account to submit verification.' },
                { status: 403 }
            )
        }

        // IMPORTANT: business_verifications.user_id should ALWAYS reference users.id (UUID)
        // NOT user_profiles.id, to avoid mismatches
        const userIdForVerification = user.id

        // Check if verification already exists
        const { data: existing } = await supabase
            .from('business_verifications')
            .select('id, status, rejection_reason')
            .eq('user_id', userIdForVerification)
            .maybeSingle()

        // Determine status based on submit_for_review flag
        const submitForReview = body.submit_for_review === true
        const newStatus = submitForReview ? 'pending' : 'incomplete'

        // If this is a reverification (was rejected, now pending), preserve the old rejection reason
        const isReverification = existing?.status === 'rejected' && submitForReview
        const previousRejectionReason = isReverification ? existing.rejection_reason : null

        // Prepare verification data - SIMPLIFIED SCHEMA
        const verificationData: any = {
            user_id: userIdForVerification, // Use user_profile UUID or clerk_user_id
            legal_business_name: body.legal_business_name,
            contact_person_name: body.contact_person_name,
            contact_person_phone: body.contact_person_phone,
            gstin: body.gstin || null,
            status: newStatus,
            updated_at: new Date().toISOString()
        }

        // Add previous_rejection_reason if this is a reverification
        if (isReverification) {
            verificationData.previous_rejection_reason = previousRejectionReason
            verificationData.rejection_reason = null // Clear current rejection reason
        }

        let verificationId: string

        if (existing) {
            // Update existing verification
            // Only allow updates if status is incomplete or rejected
            // If submitting for review, allow incomplete/rejected to become pending
            if (submitForReview) {
                // When submitting for review, only incomplete or rejected can be submitted
                if (existing.status !== 'incomplete' && existing.status !== 'rejected') {
                    return NextResponse.json(
                        { success: false, error: 'Verification already submitted and under review' },
                        { status: 400 }
                    )
                }
            } else {
                // When saving draft, allow updates to incomplete or rejected only
                if (existing.status !== 'incomplete' && existing.status !== 'rejected') {
                    return NextResponse.json(
                        { success: false, error: 'Cannot update verification that is under review or approved' },
                        { status: 400 }
                    )
                }
            }

            const { error: updateError } = await supabase
                .from('business_verifications')
                .update(verificationData)
                .eq('id', existing.id)

            if (updateError) throw updateError
            verificationId = existing.id
        } else {
            // Create new verification
            const { data: newVerification, error: insertError } = await supabase
                .from('business_verifications')
                .insert(verificationData)
                .select('id')
                .single()

            if (insertError) throw insertError
            verificationId = newVerification.id
        }

        return NextResponse.json({
            success: true,
            verification_id: verificationId,
            message: 'Verification submitted successfully'
        })
    } catch (error) {
        console.error('Error submitting verification:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to submit verification' },
            { status: 500 }
        )
    }
}
