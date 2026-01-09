import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabase()
        const { data: { user } } = await supabase.auth.getUser()

        // Get session ID from cookie for guest users
        const cookieStore = await cookies()
        const sessionId = cookieStore.get('guest_session_id')?.value

        if (!user && !sessionId) {
            return NextResponse.json({
                success: true,
                wishlist: null,
                items: []
            })
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

        // Find or create wishlist
        let wishlist
        if (user) {
            const { data, error } = await supabase
                .from('wishlists')
                .select('*')
                .eq('user_id', user.id)
                .eq('is_default', true)
                .single()

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching user wishlist:', error)
                throw error
            }

            if (!data) {
                const { data: newWishlist, error: createError } = await supabase
                    .from('wishlists')
                    .insert({
                        user_id: user.id,
                        name: 'My Wishlist',
                        is_default: true
                    })
                    .select()
                    .single()

                if (createError) throw createError
                wishlist = newWishlist
            } else {
                wishlist = data
            }
        } else {
            const { data, error } = await supabase
                .from('wishlists')
                .select('*')
                .eq('session_id', sessionId)
                .eq('is_default', true)
                .single()

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching guest wishlist:', error)
                throw error
            }

            if (!data) {
                const { data: newWishlist, error: createError } = await supabase
                    .from('wishlists')
                    .insert({
                        session_id: sessionId,
                        name: 'My Wishlist',
                        is_default: true
                    })
                    .select()
                    .single()

                if (createError) throw createError
                wishlist = newWishlist
            } else {
                wishlist = data
            }
        }

        // Fetch wishlist items (no joins since product_id and variant_id are just text fields)
        const { data: items, error: itemsError } = await supabase
            .from('wishlist_items')
            .select('*')
            .eq('wishlist_id', wishlist.id)
            .order('created_at', { ascending: false })

        if (itemsError) {
            console.error('Error fetching items:', itemsError)
            throw itemsError
        }

        return NextResponse.json({
            success: true,
            wishlist,
            items: items || [],
            count: items?.length || 0
        })

    } catch (error) {
        console.error('Fatal error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch wishlist' },
            { status: 500 }
        )
    }
}
