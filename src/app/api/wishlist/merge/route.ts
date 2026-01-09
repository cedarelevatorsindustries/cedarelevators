import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabase()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Must be authenticated to merge wishlist' },
                { status: 401 }
            )
        }

        // Get guest session ID
        const cookieStore = await cookies()
        const sessionId = cookieStore.get('guest_session_id')?.value

        if (!sessionId) {
            return NextResponse.json({
                success: true,
                message: 'No guest wishlist to merge'
            })
        }

        // Find guest wishlist
        const { data: guestWishlist } = await supabase
            .from('wishlists')
            .select('id')
            .eq('session_id', sessionId)
            .eq('is_default', true)
            .single()

        if (!guestWishlist) {
            return NextResponse.json({
                success: true,
                message: 'No guest wishlist found'
            })
        }

        // Find or create user wishlist
        let userWishlist
        const { data: existingWishlist } = await supabase
            .from('wishlists')
            .select('id')
            .eq('user_id', user.id)
            .eq('is_default', true)
            .single()

        if (existingWishlist) {
            userWishlist = existingWishlist
        } else {
            const { data: newWishlist, error } = await supabase
                .from('wishlists')
                .insert({
                    user_id: user.id,
                    name: 'My Wishlist',
                    is_default: true
                })
                .select()
                .single()

            if (error) throw error
            userWishlist = newWishlist
        }

        // Get guest wishlist items
        const { data: guestItems } = await supabase
            .from('wishlist_items')
            .select('product_id, variant_id, quantity, notes')
            .eq('wishlist_id', guestWishlist.id)

        if (guestItems && guestItems.length > 0) {
            // Get existing user wishlist items to avoid duplicates
            const { data: existingItems } = await supabase
                .from('wishlist_items')
                .select('variant_id')
                .eq('wishlist_id', userWishlist.id)

            const existingVariantIds = new Set(existingItems?.map(item => item.variant_id) || [])

            // Filter out items that already exist in user wishlist
            const itemsToAdd = guestItems
                .filter(item => !existingVariantIds.has(item.variant_id))
                .map(item => ({
                    ...item,
                    wishlist_id: userWishlist.id
                }))

            if (itemsToAdd.length > 0) {
                const { error: insertError } = await supabase
                    .from('wishlist_items')
                    .insert(itemsToAdd)

                if (insertError) {
                    console.error('Error inserting items:', insertError)
                    throw insertError
                }
            }
        }

        // Delete guest wishlist
        const { error: deleteError } = await supabase
            .from('wishlists')
            .delete()
            .eq('id', guestWishlist.id)

        if (deleteError) {
            console.error('Error deleting guest wishlist:', deleteError)
        }

        // Clear guest session cookie
        cookieStore.delete('guest_session_id')

        // Get final count
        const { count } = await supabase
            .from('wishlist_items')
            .select('*', { count: 'exact', head: true })
            .eq('wishlist_id', userWishlist.id)

        return NextResponse.json({
            success: true,
            message: 'Wishlist merged successfully',
            count: count || 0
        })

    } catch (error) {
        console.error('Fatal error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to merge wishlist' },
            { status: 500 }
        )
    }
}
