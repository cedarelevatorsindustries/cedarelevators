'use server'

import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============================================================================
// Types
// ============================================================================

export type WhyChooseHero = {
    id: string
    title: string
    description: string
    created_at: string
    updated_at: string
}

export type WhyChooseItem = {
    id: string
    section_title: string | null
    icon: string
    title: string
    description: string
    sort_order: number
    status: 'active' | 'inactive'
    created_at: string
    updated_at: string
}

export type WhyChooseStat = {
    id: string
    number: string
    title: string
    subtitle: string
    sort_order: number
    created_at: string
    updated_at: string
}

export type WhyChooseCTA = {
    id: string
    title: string
    description: string
    created_at: string
    updated_at: string
}

export type WhyChooseData = {
    hero: WhyChooseHero | null
    items: WhyChooseItem[]
    stats: WhyChooseStat[]
    cta: WhyChooseCTA | null
}

// ============================================================================
// Fetch All Data
// ============================================================================

export async function getWhyChooseDataAction(): Promise<{ data: WhyChooseData | null; error: string | null }> {
    try {
        const supabase = createServerSupabaseClient()

        if (!supabase) {
            return { data: null, error: 'Failed to create database client' }
        }

        // Fetch hero
        const { data: hero, error: heroError } = await supabase
            .from('why_choose_hero')
            .select('*')
            .single()

        if (heroError && heroError.code !== 'PGRST116') {
            console.error('Error fetching hero:', heroError)
        }

        // Fetch items (all for admin, only active for public)
        const { data: items, error: itemsError } = await supabase
            .from('why_choose_items')
            .select('*')
            .order('sort_order', { ascending: true })

        if (itemsError) {
            console.error('Error fetching items:', itemsError)
        }

        // Fetch stats
        const { data: stats, error: statsError } = await supabase
            .from('why_choose_stats')
            .select('*')
            .order('sort_order', { ascending: true })

        if (statsError) {
            console.error('Error fetching stats:', statsError)
        }

        // Fetch CTA
        const { data: cta, error: ctaError } = await supabase
            .from('why_choose_cta')
            .select('*')
            .single()

        if (ctaError && ctaError.code !== 'PGRST116') {
            console.error('Error fetching CTA:', ctaError)
        }

        return {
            data: {
                hero: hero || null,
                items: items || [],
                stats: stats || [],
                cta: cta || null
            },
            error: null
        }
    } catch (error) {
        console.error('Error in getWhyChooseDataAction:', error)
        return { data: null, error: 'Failed to fetch Why Choose Cedar data' }
    }
}

// ============================================================================
// Fetch Public Data (only active items)
// ============================================================================

export async function getWhyChoosePublicDataAction(): Promise<{ data: WhyChooseData | null; error: string | null }> {
    try {
        const supabase = createServerSupabaseClient()

        if (!supabase) {
            return { data: null, error: 'Failed to create database client' }
        }

        // Fetch hero
        const { data: hero, error: heroError } = await supabase
            .from('why_choose_hero')
            .select('*')
            .single()

        if (heroError && heroError.code !== 'PGRST116') {
            console.error('Error fetching hero:', heroError)
        }

        // Fetch ONLY active items
        const { data: items, error: itemsError } = await supabase
            .from('why_choose_items')
            .select('*')
            .eq('status', 'active')
            .order('sort_order', { ascending: true })

        if (itemsError) {
            console.error('Error fetching items:', itemsError)
        }

        // Fetch stats
        const { data: stats, error: statsError } = await supabase
            .from('why_choose_stats')
            .select('*')
            .order('sort_order', { ascending: true })

        if (statsError) {
            console.error('Error fetching stats:', statsError)
        }

        // Fetch CTA
        const { data: cta, error: ctaError } = await supabase
            .from('why_choose_cta')
            .select('*')
            .single()

        if (ctaError && ctaError.code !== 'PGRST116') {
            console.error('Error fetching CTA:', ctaError)
        }

        return {
            data: {
                hero: hero || null,
                items: items || [],
                stats: stats || [],
                cta: cta || null
            },
            error: null
        }
    } catch (error) {
        console.error('Error in getWhyChoosePublicDataAction:', error)
        return { data: null, error: 'Failed to fetch Why Choose Cedar data' }
    }
}

// ============================================================================
// Hero Actions
// ============================================================================

export async function updateHeroAction(data: { title: string; description: string }): Promise<{ error: string | null }> {
    try {
        console.log('🔵 updateHeroAction called with:', data)
        const supabase = createAdminClient()

        if (!supabase) {
            console.error('❌ Failed to create Supabase client')
            return { error: 'Failed to create database client' }
        }

        // Get the hero ID first
        const { data: heroData, error: fetchError } = await supabase
            .from('why_choose_hero')
            .select('id')
            .single()

        console.log('📝 Fetched hero ID:', heroData?.id)
        if (fetchError) {
            console.error('❌ Error fetching hero ID:', fetchError)
        }

        const { error } = await supabase
            .from('why_choose_hero')
            .update({
                title: data.title,
                description: data.description
            })
            .eq('id', heroData?.id)

        if (error) {
            console.error('❌ Error updating hero:', error)
            throw error
        }

        console.log('✅ Hero updated successfully')
        revalidatePath('/why-choose')
        revalidatePath('/admin/settings/cms/why-choose')

        return { error: null }
    } catch (error) {
        console.error('❌ updateHeroAction error:', error)
        return { error: 'Failed to update hero section' }
    }
}

// ============================================================================
// Item Actions
// ============================================================================

export async function createItemAction(data: Omit<WhyChooseItem, 'id' | 'created_at' | 'updated_at'>): Promise<{ error: string | null }> {
    try {
        const supabase = createAdminClient()

        if (!supabase) {
            return { error: 'Failed to create database client' }
        }

        const { error } = await supabase
            .from('why_choose_items')
            .insert({
                section_title: data.section_title,
                icon: data.icon,
                title: data.title,
                description: data.description,
                sort_order: data.sort_order,
                status: data.status
            })

        if (error) throw error

        revalidatePath('/why-choose')
        revalidatePath('/admin/settings/cms/why-choose')

        return { error: null }
    } catch (error) {
        console.error('Error creating item:', error)
        return { error: 'Failed to create item' }
    }
}

export async function updateItemAction(id: string, data: Partial<Omit<WhyChooseItem, 'id' | 'created_at' | 'updated_at'>>): Promise<{ error: string | null }> {
    try {
        const supabase = createAdminClient()

        if (!supabase) {
            return { error: 'Failed to create database client' }
        }

        const { error } = await supabase
            .from('why_choose_items')
            .update(data)
            .eq('id', id)

        if (error) throw error

        revalidatePath('/why-choose')
        revalidatePath('/admin/settings/cms/why-choose')

        return { error: null }
    } catch (error) {
        console.error('Error updating item:', error)
        return { error: 'Failed to update item' }
    }
}

export async function deleteItemAction(id: string): Promise<{ error: string | null }> {
    try {
        const supabase = createAdminClient()

        if (!supabase) {
            return { error: 'Failed to create database client' }
        }

        const { error } = await supabase
            .from('why_choose_items')
            .delete()
            .eq('id', id)

        if (error) throw error

        revalidatePath('/why-choose')
        revalidatePath('/admin/settings/cms/why-choose')

        return { error: null }
    } catch (error) {
        console.error('Error deleting item:', error)
        return { error: 'Failed to delete item' }
    }
}

export async function reorderItemsAction(items: { id: string; sort_order: number }[]): Promise<{ error: string | null }> {
    try {
        const supabase = createAdminClient()

        if (!supabase) {
            return { error: 'Failed to create database client' }
        }

        // Update each item's sort_order
        for (const item of items) {
            const { error } = await supabase
                .from('why_choose_items')
                .update({ sort_order: item.sort_order })
                .eq('id', item.id)

            if (error) throw error
        }

        revalidatePath('/why-choose')
        revalidatePath('/admin/settings/cms/why-choose')

        return { error: null }
    } catch (error) {
        console.error('Error reordering items:', error)
        return { error: 'Failed to reorder items' }
    }
}

// ============================================================================
// Stats Actions
// ============================================================================

export async function updateStatAction(id: string, data: any): Promise<{ error: string | null }> {
    try {
        console.log('🔵 updateStatAction called with ID:', id)
        console.log('🔵 updateStatAction data received:', data)

        const supabase = createAdminClient()

        if (!supabase) {
            console.error('❌ Failed to create Supabase client')
            return { error: 'Failed to create database client' }
        }

        // Only update the fields we want, ignore timestamps and id
        const updateData = {
            number: data.number,
            title: data.title,
            subtitle: data.subtitle
        }

        console.log('📝 Updating stat with data:', updateData)

        const { error, data: result } = await supabase
            .from('why_choose_stats')
            .update(updateData)
            .eq('id', id)
            .select()

        if (error) {
            console.error('❌ Supabase error updating stat:', error)
            throw error
        }

        console.log('✅ Stat updated successfully, result:', result)
        revalidatePath('/why-choose')
        revalidatePath('/admin/settings/cms/why-choose')

        return { error: null }
    } catch (error) {
        console.error('❌ updateStatAction error:', error)
        return { error: 'Failed to update stat' }
    }
}

// ============================================================================
// CTA Actions
// ============================================================================

export async function updateCTAAction(data: { title: string; description: string }): Promise<{ error: string | null }> {
    try {
        console.log('🔵 updateCTAAction called with:', data)
        const supabase = createAdminClient()

        if (!supabase) {
            console.error('❌ Failed to create Supabase client')
            return { error: 'Failed to create database client' }
        }

        // Get the CTA ID first
        const { data: ctaData, error: fetchError } = await supabase
            .from('why_choose_cta')
            .select('id')
            .single()

        console.log('📝 Fetched CTA ID:', ctaData?.id)
        if (fetchError) {
            console.error('❌ Error fetching CTA ID:', fetchError)
        }

        const { error } = await supabase
            .from('why_choose_cta')
            .update({
                title: data.title,
                description: data.description
            })
            .eq('id', ctaData?.id)

        if (error) {
            console.error('❌ Error updating CTA:', error)
            throw error
        }

        console.log('✅ CTA updated successfully')
        revalidatePath('/why-choose')
        revalidatePath('/admin/settings/cms/why-choose')

        return { error: null }
    } catch (error) {
        console.error('❌ updateCTAAction error:', error)
        return { error: 'Failed to update CTA section' }
    }
}
