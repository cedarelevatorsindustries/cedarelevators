import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createServerSupabase()
        const { data: { user } } = await supabase.auth.getUser()

        // Get session ID for guest users
        const cookieStore = await cookies()
        const sessionId = cookieStore.get('guest_session_id')?.value

        if (!user && !sessionId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Set session_id for RLS if guest user
        if (!user && sessionId) {
            try {
                await supabase.rpc('set_config', {
                    setting: 'app.session_id',
                    value: sessionId
                })
            } catch (rpcError) {
                console.error('RPC set_config failed:', rpcError)
            }
        }

        // Find wishlist
        const wishlistQuery = user
            ? supabase.from('wishlists').select('id').eq('user_id', user.id).eq('is_default', true).single()
            : supabase.from('wishlists').select('id').eq('session_id', sessionId).eq('is_default', true).single()

        const { data: wishlist, error: wishlistError } = await wishlistQuery

        if (wishlistError || !wishlist) {
            return NextResponse.json({
                success: true,
                message: 'No wishlist to clear'
            })
        }

        // Delete all items from wishlist
        const { error } = await supabase
            .from('wishlist_items')
            .delete()
            .eq('wishlist_id', wishlist.id)

        if (error) {
            console.error('Error deleting items:', error)
            throw error
        }

        return NextResponse.json({
            success: true,
            count: 0
        })

    } catch (error) {
        console.error('Fatal error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to clear wishlist' },
            { status: 500 }
        )
    }
}
