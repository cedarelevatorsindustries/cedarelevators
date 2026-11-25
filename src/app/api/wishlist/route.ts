import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, createAdminClient } from '@/lib/supabase/server'
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

        const rawItems = items || []
        let enrichedItems = rawItems

        if (rawItems.length > 0) {
            try {
                const adminSupabase = createAdminClient()
                const productIds = Array.from(new Set(rawItems.map((i: any) => i.product_id).filter(Boolean)))
                const variantIds = Array.from(
                    new Set(rawItems.map((i: any) => i.variant_id).filter((v: any) => Boolean(v) && !productIds.includes(v)))
                )

                const [{ data: products }, { data: variants }] = await Promise.all([
                    productIds.length > 0
                        ? adminSupabase.from('products').select('id, name, slug, sku, thumbnail_url').in('id', productIds)
                        : Promise.resolve({ data: [] }),
                    variantIds.length > 0
                        ? adminSupabase.from('product_variants').select('id, name, sku, variant_title, options').in('id', variantIds)
                        : Promise.resolve({ data: [] }),
                ])

                const prodMap = new Map((products || []).map((p: any) => [p.id, p]))
                const varMap = new Map((variants || []).map((v: any) => [v.id, v]))

                enrichedItems = rawItems.map((item: any) => {
                    const prod = prodMap.get(item.product_id)
                    const variant = varMap.get(item.variant_id)
                    const variantTitle =
                        item.variant_title ||
                        variant?.variant_title ||
                        (variant?.options && typeof variant.options === 'object'
                            ? Object.values(variant.options).filter(Boolean).join(' / ')
                            : null) ||
                        variant?.name ||
                        null

                    return {
                        ...item,
                        product_title: prod?.name || item.product_title || '',
                        product_thumbnail: prod?.thumbnail_url || item.product_thumbnail || null,
                        product_handle: prod?.slug || item.product_handle || '',
                        product_sku: variant?.sku || prod?.sku || null,
                        variant_title: variantTitle,
                    }
                })
            } catch (enrichErr) {
                console.warn('Could not enrich wishlist items:', enrichErr)
            }
        }

        return NextResponse.json({
            success: true,
            wishlist,
            items: enrichedItems,
            count: enrichedItems.length
        })

    } catch (error) {
        console.error('Fatal error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch wishlist' },
            { status: 500 }
        )
    }
}
