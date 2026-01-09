import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createServerSupabase()
        const { data: { user } } = await supabase.auth.getUser()

        const itemId = params.id

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

        // Delete the item (RLS will ensure user owns it)
        const { error } = await supabase
            .from('wishlist_items')
            .delete()
            .eq('id', itemId)

        if (error) {
            console.error('Error deleting item:', error)
            throw error
        }

        // Get updated count
        const wishlistQuery = user
            ? supabase.from('wishlists').select('id').eq('user_id', user.id).eq('is_default', true).single()
            : supabase.from('wishlists').select('id').eq('session_id', sessionId).eq('is_default', true).single()

        const { data: wishlist, error: wishlistError } = await wishlistQuery

        // If wishlist isn't found (shouldn't happen if we just deleted items from it, but safely handle it)
        if (wishlistError || !wishlist) {
            console.warn('Could not fetch wishlist to get count:', wishlistError)
        }

        let count = 0
        if (wishlist) {
            const { count: itemCount, error: countError } = await supabase
                .from('wishlist_items')
                .select('*', { count: 'exact', head: true })
                .eq('wishlist_id', wishlist.id)

            if (countError) {
                console.error('Error getting count:', countError)
            } else {
                count = itemCount || 0
            }
        }

        return NextResponse.json({
            success: true,
            count
        })

    } catch (error) {
        console.error('Fatal error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to remove item from wishlist' },
            { status: 500 }
        )
    }
}
