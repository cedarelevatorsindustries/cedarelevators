import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClerkSupabaseClient } from '@/lib/supabase/server'

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

        const supabase = await createClerkSupabaseClient()

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

        // Get user_profile using user_id
        const { data: userProfile, error: profileError } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('user_id', user.id)
            .eq('profile_type', 'business')
            .maybeSingle()

        if (profileError || !userProfile) {
            // No business profile found
            return NextResponse.json({
                success: true,
                verification: null
            })
        }

        // Get verification with documents using the user_profile ID
        const { data: verification, error } = await supabase
            .from('business_verifications')
            .select(`
        *,
        documents:business_verification_documents(*)
      `)
            .eq('user_id', userProfile.id)
            .single()

        if (error && error.code !== 'PGRST116') {
            throw error
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
            return NextResponse.json(
                { success: false, error: 'User not found. Please try logging out and logging back in.' },
                { status: 404 }
            )
        }

        // Check for business account - verify user is associated with a business
        // Get user profile first
        const { data: userProfile, error: profileError } = await supabase
            .from('user_profiles')
            .select('id, clerk_user_id')
            .eq('clerk_user_id', userId)
            .maybeSingle()

        if (profileError) {
            console.error('Error fetching user profile:', profileError)
            return NextResponse.json(
                { success: false, error: 'Failed to fetch user profile' },
                { status: 500 }
            )
        }

        if (!userProfile) {
            return NextResponse.json(
                { success: false, error: 'User profile not found' },
                { status: 404 }
            )
        }

        // Check if user has a business record in the businesses table
        const { data: business, error: businessError } = await supabase
            .from('businesses')
            .select('id, name, verification_status')
            .eq('owner_clerk_user_id', userId)
            .maybeSingle()

        if (!business) {
            return NextResponse.json(
                { success: false, error: 'Business account required. Please switch to a business account to submit verification.' },
                { status: 403 }
            )
        }

        // Check if verification already exists
        const { data: existing } = await supabase
            .from('business_verifications')
            .select('id, status')
            .eq('user_id', userProfile.id)
            .single()

        // Prepare verification data - SIMPLIFIED SCHEMA
        const verificationData = {
            user_id: userProfile.id, // Use the user_profile UUID
            legal_business_name: body.legal_business_name,
            contact_person_name: body.contact_person_name,
            contact_person_phone: body.contact_person_phone,
            gstin: body.gstin || null,
            status: 'pending',
            updated_at: new Date().toISOString()
        }

        let verificationId: string

        if (existing) {
            // Update existing verification (only if incomplete or rejected)
            if (existing.status !== 'incomplete' && existing.status !== 'rejected') {
                return NextResponse.json(
                    { success: false, error: 'Verification already submitted and under review' },
                    { status: 400 }
                )
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
