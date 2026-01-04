'use server'

import { createClerkSupabaseClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { QuoteBasket, QuoteBasketItem } from '@/types/b2b/quote'

/**
 * Get the user's quote basket from Supabase
 */
export async function getQuoteBasket(): Promise<QuoteBasket | null> {
    try {
        const { userId } = await auth()
        if (!userId) return null

        const supabase = await createClerkSupabaseClient()

        const { data, error } = await supabase
            .from('quote_baskets')
            .select('*')
            .eq('clerk_user_id', userId)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                // No basket found, return empty
                return { items: [], updated_at: new Date().toISOString() }
            }
            console.error('Error fetching quote basket:', error)
            return null
        }

        return {
            items: data.items || [],
            updated_at: data.updated_at
        }
    } catch (error) {
        console.error('Error in getQuoteBasket:', error)
        return null
    }
}

/**
 * Update the entire quote basket (upsert)
 */
export async function updateQuoteBasket(basket: QuoteBasket): Promise<{ success: boolean; error?: string }> {
    try {
        const { userId } = await auth()
        if (!userId) {
            return { success: false, error: 'Unauthorized' }
        }

        const supabase = await createClerkSupabaseClient()

        const { error } = await supabase
            .from('quote_baskets')
            .upsert({
                clerk_user_id: userId,
                items: basket.items,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'clerk_user_id'
            })

        if (error) {
            console.error('Error updating quote basket:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error: any) {
        console.error('Error in updateQuoteBasket:', error)
        return { success: false, error: error.message || 'Failed to update basket' }
    }
}

/**
 * Add an item to the quote basket
 */
export async function addToQuoteBasket(item: QuoteBasketItem): Promise<{ success: boolean; error?: string }> {
    try {
        const { userId } = await auth()
        if (!userId) {
            return { success: false, error: 'Unauthorized' }
        }

        const supabase = await createClerkSupabaseClient()

        // Get current basket
        const { data: existingBasket } = await supabase
            .from('quote_baskets')
            .select('items')
            .eq('clerk_user_id', userId)
            .single()

        const currentItems: QuoteBasketItem[] = existingBasket?.items || []

        // Check if product already exists
        const existingIndex = currentItems.findIndex(
            i => i.product_id === item.product_id && i.variant_id === item.variant_id
        )

        let newItems: QuoteBasketItem[]
        if (existingIndex >= 0) {
            // Update quantity
            newItems = [...currentItems]
            newItems[existingIndex] = {
                ...newItems[existingIndex],
                quantity: newItems[existingIndex].quantity + item.quantity
            }
        } else {
            // Add new item
            newItems = [...currentItems, item]
        }

        const { error } = await supabase
            .from('quote_baskets')
            .upsert({
                clerk_user_id: userId,
                items: newItems,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'clerk_user_id'
            })

        if (error) {
            console.error('Error adding to quote basket:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error: any) {
        console.error('Error in addToQuoteBasket:', error)
        return { success: false, error: error.message || 'Failed to add item' }
    }
}

/**
 * Remove an item from the quote basket
 */
export async function removeFromQuoteBasket(itemId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const { userId } = await auth()
        if (!userId) {
            return { success: false, error: 'Unauthorized' }
        }

        const supabase = await createClerkSupabaseClient()

        // Get current basket
        const { data: existingBasket } = await supabase
            .from('quote_baskets')
            .select('items')
            .eq('clerk_user_id', userId)
            .single()

        if (!existingBasket) {
            return { success: true } // Nothing to remove
        }

        const newItems = (existingBasket.items as QuoteBasketItem[]).filter(i => i.id !== itemId)

        const { error } = await supabase
            .from('quote_baskets')
            .update({
                items: newItems,
                updated_at: new Date().toISOString()
            })
            .eq('clerk_user_id', userId)

        if (error) {
            console.error('Error removing from quote basket:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error: any) {
        console.error('Error in removeFromQuoteBasket:', error)
        return { success: false, error: error.message || 'Failed to remove item' }
    }
}

/**
 * Clear the entire quote basket
 */
export async function clearQuoteBasket(): Promise<{ success: boolean; error?: string }> {
    try {
        const { userId } = await auth()
        if (!userId) {
            return { success: false, error: 'Unauthorized' }
        }

        const supabase = await createClerkSupabaseClient()

        const { error } = await supabase
            .from('quote_baskets')
            .update({
                items: [],
                updated_at: new Date().toISOString()
            })
            .eq('clerk_user_id', userId)

        if (error) {
            console.error('Error clearing quote basket:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error: any) {
        console.error('Error in clearQuoteBasket:', error)
        return { success: false, error: error.message || 'Failed to clear basket' }
    }
}

