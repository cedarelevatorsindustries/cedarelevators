import { NextRequest, NextResponse } from 'next/server'
import { createClerkSupabaseClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'

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

        const { data: addresses, error } = await supabase
            .from('user_addresses')
            .select('*')
            .eq('clerk_user_id', userId)
            .eq('is_active', true)
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching addresses:', error)
            throw error
        }

        return NextResponse.json({
            success: true,
            addresses: addresses || []
        })

    } catch (error) {
        console.error('Fatal error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch addresses' },
            { status: 500 }
        )
    }
}

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
        const supabase = await createClerkSupabaseClient()

        // Prepare address data
        const addressData = {
            clerk_user_id: userId,
            address_type: body.address_type || body.type || 'home',
            label: body.label,
            first_name: body.first_name,
            last_name: body.last_name,
            company: body.company,
            phone: body.phone,
            alternative_phone: body.alternative_phone,
            address_line_1: body.address_line_1,
            address_line_2: body.address_line_2,
            city: body.city,
            state: body.state,
            postal_code: body.postal_code,
            country: body.country || 'India',
            gst_number: body.gst_number,
            is_default: body.is_default || false,
            is_active: true
        }

        const { data: address, error } = await supabase
            .from('user_addresses')
            .insert(addressData)
            .select()
            .single()

        if (error) {
            console.error('Error adding address:', error)
            throw error
        }

        return NextResponse.json({
            success: true,
            address
        })

    } catch (error) {
        console.error('Fatal error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to add address' },
            { status: 500 }
        )
    }
}
