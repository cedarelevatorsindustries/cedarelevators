'use server'

import { createClerkSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { BannerSlide } from '@/lib/types/banners'

/**
 * Get all slides for a banner
 */
export async function getBannerSlides(bannerId: string): Promise<{
    success: boolean
    slides: BannerSlide[]
    error?: string
}> {
    try {
        const supabase = await createClerkSupabaseClient()

        const { data, error } = await supabase
            .from('banner_slides')
            .select('*')
            .eq('banner_id', bannerId)
            .order('sort_order', { ascending: true })

        if (error) {
            console.error('Error fetching banner slides:', error)
            return { success: false, slides: [], error: error.message }
        }

        return { success: true, slides: data as BannerSlide[] }
    } catch (error: any) {
        console.error('Error in getBannerSlides:', error)
        return { success: false, slides: [], error: error.message }
    }
}

/**
 * Create a new banner slide
 */
export async function createBannerSlide(
    bannerId: string,
    slideData: {
        image_url: string
        mobile_image_url?: string
        image_alt?: string
        sort_order: number
    }
): Promise<{
    success: boolean
    slide?: BannerSlide
    error?: string
}> {
    try {
        const supabase = await createClerkSupabaseClient()

        const { data, error } = await supabase
            .from('banner_slides')
            .insert([{
                banner_id: bannerId,
                ...slideData
            }])
            .select()
            .single()

        if (error) {
            console.error('Error creating banner slide:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/banners')
        return { success: true, slide: data as BannerSlide }
    } catch (error: any) {
        console.error('Error in createBannerSlide:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Update a banner slide
 */
export async function updateBannerSlide(
    slideId: string,
    updates: Partial<BannerSlide>
): Promise<{
    success: boolean
    error?: string
}> {
    try {
        const supabase = await createClerkSupabaseClient()

        const { error } = await supabase
            .from('banner_slides')
            .update(updates)
            .eq('id', slideId)

        if (error) {
            console.error('Error updating banner slide:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/banners')
        return { success: true }
    } catch (error: any) {
        console.error('Error in updateBannerSlide:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Delete a banner slide
 */
export async function deleteBannerSlide(slideId: string): Promise<{
    success: boolean
    error?: string
}> {
    try {
        const supabase = await createClerkSupabaseClient()

        const { error } = await supabase
            .from('banner_slides')
            .delete()
            .eq('id', slideId)

        if (error) {
            console.error('Error deleting banner slide:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/banners')
        return { success: true }
    } catch (error: any) {
        console.error('Error in deleteBannerSlide:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Reorder banner slides
 */
export async function reorderBannerSlides(
    bannerId: string,
    slideIds: string[]
): Promise<{
    success: boolean
    error?: string
}> {
    try {
        const supabase = await createClerkSupabaseClient()

        // Update each slide's sort_order
        const updates = slideIds.map((id, index) =>
            supabase
                .from('banner_slides')
                .update({ sort_order: index })
                .eq('id', id)
                .eq('banner_id', bannerId)
        )

        const results = await Promise.all(updates)
        const hasError = results.some(result => result.error)

        if (hasError) {
            return { success: false, error: 'Failed to reorder some slides' }
        }

        revalidatePath('/admin/banners')
        return { success: true }
    } catch (error: any) {
        console.error('Error in reorderBannerSlides:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Upload slide image
 */
export async function uploadSlideImage(file: File): Promise<{
    success: boolean
    url?: string
    error?: string
}> {
    try {
        const supabase = await createClerkSupabaseClient()

        const fileExt = file.name.split('.').pop()
        const fileName = `slide-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('banners')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
            .from('banners')
            .getPublicUrl(filePath)

        return { success: true, url: publicUrl }
    } catch (error: any) {
        console.error('Error uploading slide image:', error)
        return { success: false, error: error.message }
    }
}

