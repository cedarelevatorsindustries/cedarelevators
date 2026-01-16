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

        // Get default address for this user
        const { data: address, error } = await supabase
            .from('business_addresses')
            .select('*')
            .eq('clerk_user_id', userId)
            .eq('is_default', true)
            .single()

        if (error) {
            // If no default address found, return null
            if (error.code === 'PGRST116') {
                return NextResponse.json({ address: null })
            }
            throw error
        }

        return NextResponse.json({ address })
    } catch (error: any) {
        console.error('Error fetching default address:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch address' },
            { status: 500 }
        )
    }
}
