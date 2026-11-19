import { requireAdmin } from '@/lib/auth/require-admin'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// GET - List all verifications (admin only)
export async function GET(request: NextRequest) {
    try {
        const adminCheck = await requireAdmin()
        if (!adminCheck.authorized) {
            return NextResponse.json(
                { success: false, error: adminCheck.error },
                { status: adminCheck.status }
            )
        }

        const supabase = createAdminClient()

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
