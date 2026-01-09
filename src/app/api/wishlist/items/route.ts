import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabase()
        const { data: { user } } = await supabase.auth.getUser()

        const body = await request.json()
        const {
            product_id,
            variant_id,
            quantity = 1,
            notes,
            // Product snapshot data
            product_title,
            product_thumbnail,
            product_handle,
            variant_title,
            price
        } = body

        if (!product_id || !variant_id) {
            return NextResponse.json(
                { success: false, error: 'Product ID and Variant ID are required' },
                { status: 400 }
            )
        }

        // Get or create session ID for guest users
        const cookieStore = await cookies()
        let sessionId = cookieStore.get('guest_session_id')?.value

        if (!user && !sessionId) {
            // Generate new session ID for guest
            sessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`
            cookieStore.set('guest_session_id', sessionId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 365 // 1 year
            })
        }

        // Session ID is now used directly in RLS policies, no need for set_config

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

        // Check if item already exists
        const { data: existingItem } = await supabase
            .from('wishlist_items')
            .select('*')
            .eq('wishlist_id', wishlist.id)
            .eq('variant_id', variant_id)
            .single()

        if (existingItem) {
            return NextResponse.json({
                success: true,
                message: 'Item already in wishlist',
                item: existingItem
            })
        }

        // Add item to wishlist with product snapshot
        const { data: newItem, error: insertError } = await supabase
            .from('wishlist_items')
            .insert({
                wishlist_id: wishlist.id,
                product_id,
                variant_id,
                quantity,
                notes,
                // Product snapshot for display
                product_title,
                product_thumbnail,
                product_handle,
                variant_title,
                price
            })
            .select()
            .single()

        if (insertError) throw insertError

        // Get updated count
        const { count } = await supabase
            .from('wishlist_items')
            .select('*', { count: 'exact', head: true })
            .eq('wishlist_id', wishlist.id)

        return NextResponse.json({
            success: true,
            item: newItem,
            count: count || 0
        })

    } catch (error) {
        console.error('Fatal error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to add item to wishlist' },
            { status: 500 }
        )
    }
}
