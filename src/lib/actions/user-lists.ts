'use server'

import { createClerkSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// =============================================
// FAVORITES
// =============================================

export async function toggleFavorite(productId: string) {
    try {
        const supabase = await createClerkSupabaseClient()

        // Check auth
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, error: 'Unauthorized' }
        }

        // Check availability
        const { data: existing } = await supabase
            .from('user_favourites')
            .select('*')
            .eq('user_id', user.id)
            .eq('product_id', productId)
            .single()

        let isFavorite = false

        if (existing) {
            // Remove
            const { error } = await supabase
                .from('user_favourites')
                .delete()
                .eq('user_id', user.id)
                .eq('product_id', productId)

            if (error) throw error
            isFavorite = false
        } else {
            // Add
            const { error } = await supabase
                .from('user_favourites')
                .insert({
                    user_id: user.id,
                    product_id: productId
                })

            if (error) throw error
            isFavorite = true
        }

        revalidatePath('/favorites')
        revalidatePath(`/products/${productId}`) // approximate path, might be by slug

        return { success: true, isFavorite }

    } catch (error: any) {
        console.error('Error toggling favorite:', error)
        return { success: false, error: error.message }
    }
}

export async function getFavorites() {
    try {
        const supabase = await createClerkSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return { success: true, products: [] }

        const { data, error } = await supabase
            .from('user_favourites')
            .select(`
                product_id,
                created_at,
                product:products (
                    id,
                    name,
                    slug,
                    thumbnail,
                    price,
                    status,
                    description,
                    created_at
                )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) throw error

        const products = (data || []).map(item => {
            // @ts-ignore
            return item.product
        }).filter(Boolean)

        return { success: true, products }

    } catch (error: any) {
        console.error('Error fetching favorites:', error)
        return { success: false, error: error.message }
    }
}

export async function checkIsFavorite(productId: string) {
    try {
        const supabase = await createClerkSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return { isFavorite: false }

        const { data, error } = await supabase
            .from('user_favourites')
            .select('product_id')
            .eq('user_id', user.id)
            .eq('product_id', productId)
            .single()

        if (error && error.code !== 'PGRST116') return { isFavorite: false } // PGRST116 is "No rows found"

        return { isFavorite: !!data }

    } catch (error) {
        return { isFavorite: false }
    }
}

// =============================================
// RECENTLY VIEWED
// =============================================

export async function addToRecentlyViewed(productId: string) {
    try {
        const supabase = await createClerkSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return { success: false, error: 'Unauthorized' }

        // Upsert
        const { error } = await supabase
            .from('recently_viewed')
            .upsert({
                user_id: user.id,
                product_id: productId,
                viewed_at: new Date().toISOString()
            }, {
                onConflict: 'user_id, product_id'
            })

        if (error) throw error

        return { success: true }

    } catch (error: any) {
        console.error('Error tracking view:', error)
        return { success: false, error: error.message }
    }
}

export async function getRecentlyViewed() {
    try {
        const supabase = await createClerkSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return { success: true, products: [] }

        const { data, error } = await supabase
            .from('recently_viewed')
            .select(`
                product_id,
                viewed_at,
                product:products (
                    id,
                    name,
                    slug,
                    thumbnail,
                    price,
                    status,
                    description,
                    created_at
                )
            `)
            .eq('user_id', user.id)
            .order('viewed_at', { ascending: false })
            .limit(20)

        if (error) throw error

        const products = (data || []).map(item => {
            // @ts-ignore
            return item.product
        }).filter(Boolean)

        return { success: true, products }

    } catch (error: any) {
        console.error('Error fetching recently viewed:', error)
        return { success: false, error: error.message }
    }
}
