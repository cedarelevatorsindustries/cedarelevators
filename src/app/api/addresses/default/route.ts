import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = createAdminClient()

        // Try user_addresses first (for individual users)
        const { data: userAddress } = await supabase
            .from('user_addresses')
            .select('*')
            .eq('clerk_user_id', userId)
            .eq('is_default', true)
            .single()

        if (userAddress) {
            return NextResponse.json({ address: userAddress })
        }

        // Fall back to business_addresses (for business users)
        const { data: businessAddress, error } = await supabase
            .from('business_addresses')
            .select('*')
            .eq('clerk_user_id', userId)
            .eq('is_default', true)
            .single()

        if (error && error.code !== 'PGRST116') {
            throw error
        }

        return NextResponse.json({ address: businessAddress || null })
    } catch (error: any) {
        console.error('Error fetching default address:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch address' },
            { status: 500 }
        )
    }
}
