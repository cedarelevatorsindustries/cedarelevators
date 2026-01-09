import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClerkSupabaseClient } from '@/lib/supabase/server'

// GET - Get verification details (admin only)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { id } = await params
        const supabase = await createClerkSupabaseClient()

        // Verify admin access
        const { data: adminProfile } = await supabase
            .from('admin_profiles')
            .select('is_active')
            .eq('user_id', userId)
            .single()

        if (!adminProfile?.is_active) {
            return NextResponse.json(
                { success: false, error: 'Admin access required' },
                { status: 403 }
            )
        }

        // Get verification with documents
        const { data: verification, error } = await supabase
            .from('business_verifications')
            .select(`
        *,
        documents:business_verification_documents(*)
      `)
            .eq('id', id)
            .single()

        if (error) throw error

        return NextResponse.json({
            success: true,
            verification
        })
    } catch (error) {
        console.error('Error fetching verification:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch verification' },
            { status: 500 }
        )
    }
}

// PATCH - Approve or reject verification (admin only)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { id } = await params
        const body = await request.json()
        const { action, rejection_reason, admin_notes } = body

        if (!['approve', 'reject'].includes(action)) {
            return NextResponse.json(
                { success: false, error: 'Invalid action' },
                { status: 400 }
            )
        }

        if (action === 'reject' && !rejection_reason) {
            return NextResponse.json(
                { success: false, error: 'Rejection reason required' },
                { status: 400 }
            )
        }

        const supabase = await createClerkSupabaseClient()

        // Verify admin access and get admin profile ID
        const { data: adminProfile } = await supabase
            .from('admin_profiles')
            .select('id, is_active')
            .eq('user_id', userId)
            .single()

        if (!adminProfile?.is_active) {
            return NextResponse.json(
                { success: false, error: 'Admin access required' },
                { status: 403 }
            )
        }

        // Update verification
        const updateData: any = {
            status: action === 'approve' ? 'approved' : 'rejected',
            reviewed_at: new Date().toISOString(),
            reviewed_by: adminProfile.id,
            updated_at: new Date().toISOString()
        }

        if (action === 'reject') {
            updateData.rejection_reason = rejection_reason
        }

        if (admin_notes) {
            updateData.admin_notes = admin_notes
        }

        const { error } = await supabase
            .from('business_verifications')
            .update(updateData)
            .eq('id', id)

        if (error) throw error

        // The trigger will automatically sync to user_profiles

        return NextResponse.json({
            success: true,
            message: `Verification ${action}d successfully`
        })
    } catch (error) {
        console.error('Error updating verification:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update verification' },
            { status: 500 }
        )
    }
}
