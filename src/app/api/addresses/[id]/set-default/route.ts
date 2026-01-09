import { NextRequest, NextResponse } from 'next/server'
import { createClerkSupabaseClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'

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

        const { id: addressId } = await params
        const supabase = await createClerkSupabaseClient()

        // Set this address as default (trigger will unset others)
        const { data: address, error } = await supabase
            .from('user_addresses')
            .update({ is_default: true })
            .eq('id', addressId)
            .eq('clerk_user_id', userId)
            .select()
            .single()

        if (error) {
            console.error('Error setting default address:', error)
            throw error
        }

        if (!address) {
            return NextResponse.json(
                { success: false, error: 'Address not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            address
        })

    } catch (error) {
        console.error('Fatal error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to set default address' },
            { status: 500 }
        )
    }
}
