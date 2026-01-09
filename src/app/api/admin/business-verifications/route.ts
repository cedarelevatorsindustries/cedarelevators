import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClerkSupabaseClient } from '@/lib/supabase/server'

// GET - List all verifications (admin only)
export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

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

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status') || 'all'

        let query = supabase
            .from('business_verifications')
            .select(`
        *,
        documents:business_verification_documents(count)
      `)
            .order('submitted_at', { ascending: false, nullsFirst: false })
            .order('created_at', { ascending: false })

        if (status !== 'all') {
            query = query.eq('status', status)
        }

        const { data: verifications, error } = await query

        if (error) throw error

        return NextResponse.json({
            success: true,
            verifications: verifications || []
        })
    } catch (error) {
        console.error('Error fetching verifications:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch verifications' },
            { status: 500 }
        )
    }
}
