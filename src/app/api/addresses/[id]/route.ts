import { NextRequest, NextResponse } from 'next/server'
import { createClerkSupabaseClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const addressId = params.id
        const body = await request.json()
        const supabase = await createClerkSupabaseClient()

        // Prepare update data
        const updateData: any = {}

        if (body.address_type !== undefined) updateData.address_type = body.address_type
        if (body.type !== undefined) updateData.address_type = body.type
        if (body.label !== undefined) updateData.label = body.label
        if (body.first_name !== undefined) updateData.first_name = body.first_name
        if (body.last_name !== undefined) updateData.last_name = body.last_name
        if (body.company !== undefined) updateData.company = body.company
        if (body.phone !== undefined) updateData.phone = body.phone
        if (body.alternative_phone !== undefined) updateData.alternative_phone = body.alternative_phone
        if (body.address_line_1 !== undefined) updateData.address_line_1 = body.address_line_1
        if (body.address_line_2 !== undefined) updateData.address_line_2 = body.address_line_2
        if (body.city !== undefined) updateData.city = body.city
        if (body.state !== undefined) updateData.state = body.state
        if (body.postal_code !== undefined) updateData.postal_code = body.postal_code
        if (body.country !== undefined) updateData.country = body.country
        if (body.gst_number !== undefined) updateData.gst_number = body.gst_number
        if (body.is_default !== undefined) updateData.is_default = body.is_default

        const { data: address, error } = await supabase
            .from('user_addresses')
            .update(updateData)
            .eq('id', addressId)
            .eq('clerk_user_id', userId)
            .select()
            .single()

        if (error) {
            console.error('Error updating address:', error)
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
            { success: false, error: 'Failed to update address' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const addressId = params.id
        const supabase = await createClerkSupabaseClient()

        // Soft delete by setting is_active to false
        const { error } = await supabase
            .from('user_addresses')
            .update({ is_active: false })
            .eq('id', addressId)
            .eq('clerk_user_id', userId)

        if (error) {
            console.error('Error deleting address:', error)
            throw error
        }

        return NextResponse.json({
            success: true
        })

    } catch (error) {
        console.error('Fatal error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete address' },
            { status: 500 }
        )
    }
}
