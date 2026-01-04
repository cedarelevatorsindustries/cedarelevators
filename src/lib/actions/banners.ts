'use server'

import { createClerkSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type {
    Banner,
    BannerWithStatus,
    BannerWithSlides,
    BannerFormData,
    BannerFilters,
    BannerStats,
    BannerPlacement,
    BannerStatus
} from '@/lib/types/banners'
import { withStatus, computeBannerStatus } from '@/lib/types/banners'

/**
 * Get all banners with optional filters
 */
export async function getBanners(filters?: BannerFilters): Promise<{
    success: boolean
    banners: BannerWithStatus[]
    stats: BannerStats
    error?: string
}> {
    try {
        const supabase = await createClerkSupabaseClient()

        let query = supabase
            .from('banners')
            .select('*')
            .order('position', { ascending: true })
            .order('created_at', { ascending: false })

        // Apply filters
        if (filters?.placement) {
            query = query.eq('placement', filters.placement)
        }

        if (filters?.target_type) {
            query = query.eq('target_type', filters.target_type)
        }

        if (filters?.search) {
            query = query.or(`title.ilike.%${filters.search}%,internal_name.ilike.%${filters.search}%`)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching banners:', error)
            return { success: false, banners: [], stats: { total: 0, active: 0, scheduled: 0, expired: 0, disabled: 0 }, error: error.message }
        }

        const banners = data as Banner[]
        const bannersWithStatus = withStatus(banners)

        // Filter by status if specified
        let filteredBanners = bannersWithStatus
        if (filters?.status) {
            filteredBanners = bannersWithStatus.filter(b => b.status === filters.status)
        }

        // Calculate stats
        const stats: BannerStats = {
            total: banners.length,
            active: bannersWithStatus.filter(b => b.status === 'active').length,
            scheduled: bannersWithStatus.filter(b => b.status === 'scheduled').length,
            expired: bannersWithStatus.filter(b => b.status === 'expired').length,
            disabled: bannersWithStatus.filter(b => b.status === 'disabled').length
        }

        return { success: true, banners: filteredBanners, stats }
    } catch (error: any) {
        console.error('Error in getBanners:', error)
        return { success: false, banners: [], stats: { total: 0, active: 0, scheduled: 0, expired: 0, disabled: 0 }, error: error.message }
    }
}

/**
 * Get a single banner by ID
 */
export async function getBannerById(id: string): Promise<{
    success: boolean
    banner?: BannerWithStatus
    error?: string
}> {
    try {
        const supabase = await createClerkSupabaseClient()

        const { data, error } = await supabase
            .from('banners')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching banner:', error)
            return { success: false, error: error.message }
        }

        const banner = data as Banner
        const bannerWithStatus: BannerWithStatus = {
            ...banner,
            status: computeBannerStatus(banner)
        }

        return { success: true, banner: bannerWithStatus }
    } catch (error: any) {
        console.error('Error in getBannerById:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Get banners for storefront display by placement
 * RESTRICTED: Only 'hero-carousel' / 'all-products-carousel' placement allowed
 */
export async function getBannersByPlacement(
    placement: BannerPlacement,
    targetId?: string
): Promise<{
    success: boolean
    banners: Banner[]
    error?: string
}> {
    try {
        // VALIDATION: Only allow All Products Carousel
        if (placement !== 'hero-carousel' && placement !== 'all-products-carousel') {
            console.warn(`Invalid placement "${placement}". Only "hero-carousel" or "all-products-carousel" is allowed. Other banners are in entity modules.`)
            return { success: true, banners: [] }
        }

        const supabase = await createClerkSupabaseClient()

        let query = supabase
            .from('banners')
            .select('*')
            .eq('placement', 'hero-carousel') // Always use hero-carousel internally
            .eq('is_active', true)
            .order('position', { ascending: true })

        // Filter by current date (active banners only)
        const now = new Date().toISOString()
        query = query.or(`start_date.is.null,start_date.lte.${now}`)
        query = query.or(`end_date.is.null,end_date.gte.${now}`)

        // targetId filtering removed - carousel shows all active banners
        // They link to their respective entities via target_type/target_id

        const { data, error } = await query

        if (error) {
            console.error('Error fetching banners by placement:', error)
            return { success: false, banners: [], error: error.message }
        }

        return { success: true, banners: data as Banner[] }
    } catch (error: any) {
        console.error('Error in getBannersByPlacement:', error)
        return { success: false, banners: [], error: error.message }
    }
}

/**
 * Create a new banner
 * RESTRICTED: Only 'hero-carousel' / 'all-products-carousel' placement allowed
 */
export async function createBanner(data: BannerFormData): Promise<{
    success: boolean
    banner?: Banner
    error?: string
}> {
    try {
        const supabase = await createClerkSupabaseClient()

        // VALIDATION: Only allow All Products Carousel
        const placement = data.placement || 'hero-carousel'
        if (placement !== 'hero-carousel' && placement !== 'all-products-carousel') {
            return {
                success: false,
                error: 'Invalid placement. Only "hero-carousel" or "all-products-carousel" is allowed. Other banners are managed in their respective entity modules.'
            }
        }

        // VALIDATION: Carousel banners requires CTA text
        // UPDATED: Made optional per user request
        // if (!data.cta_text || data.cta_text.trim() === '') {
        //     return { 
        //         success: false, 
        //         error: 'CTA text is required for carousel banners' 
        //     }
        // }

        // VALIDATION: Carousel banners requires link destination
        // UPDATED: Made optional per user request
        const linkType = data.link_type || data.target_type
        const linkId = data.link_id || data.target_id

        // if (!linkType || !linkId) {
        //     return { 
        //         success: false, 
        //         error: 'Link destination is required. Please select link type (application/category/elevator-type/collection) and link ID.' 
        //     }
        // }

        const { data: banner, error } = await supabase
            .from('banners')
            .insert({
                title: data.title,
                subtitle: data.subtitle,
                internal_name: data.internal_name,
                image_url: data.image_url!,
                image_alt: data.image_alt,
                mobile_image_url: data.mobile_image_url,
                placement: placement,
                target_type: linkType,
                target_id: linkId,
                cta_text: data.cta_text,
                cta_link: data.cta_link,
                cta_style: data.cta_style || 'primary',
                start_date: data.start_date,
                end_date: data.end_date,
                is_active: data.is_active ?? true,
                position: data.position ?? 0,
                background_color: data.background_color,
                text_color: data.text_color || 'white',
                slides: (data as any).slides || [] // Save slides directly
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating banner:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/banners')
        revalidatePath('/', 'layout') // Revalidate storefront

        return { success: true, banner: banner as Banner }
    } catch (error: any) {
        console.error('Error in createBanner:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Update an existing banner
 */
export async function updateBanner(id: string, data: Partial<BannerFormData>): Promise<{
    success: boolean
    banner?: Banner
    error?: string
}> {
    try {
        const supabase = await createClerkSupabaseClient()

        // Prepare update data by mapping form fields to DB columns
        const updateData: any = { ...data }

        // Map link_type -> target_type
        if ('link_type' in data) {
            updateData.target_type = data.link_type
            delete updateData.link_type
        }

        // Map link_id -> target_id
        if ('link_id' in data) {
            updateData.target_id = data.link_id
            delete updateData.link_id
        }

        // Ensure slides are included if present
        if ((data as any).slides) {
            updateData.slides = (data as any).slides
        }

        const { data: banner, error } = await supabase
            .from('banners')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating banner:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/banners')
        revalidatePath(`/admin/banners/${id}`)
        revalidatePath('/', 'layout')

        return { success: true, banner: banner as Banner }
    } catch (error: any) {
        console.error('Error in updateBanner:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Delete a banner
 */
export async function deleteBanner(id: string): Promise<{
    success: boolean
    error?: string
}> {
    try {
        const supabase = await createClerkSupabaseClient()

        const { error } = await supabase
            .from('banners')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting banner:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/banners')
        revalidatePath('/', 'layout')

        return { success: true }
    } catch (error: any) {
        console.error('Error in deleteBanner:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Toggle banner active status
 */
export async function toggleBannerStatus(id: string): Promise<{
    success: boolean
    banner?: Banner
    error?: string
}> {
    try {
        const supabase = await createClerkSupabaseClient()

        // Get current status
        const { data: current, error: fetchError } = await supabase
            .from('banners')
            .select('is_active')
            .eq('id', id)
            .single()

        if (fetchError) {
            return { success: false, error: fetchError.message }
        }

        // Toggle
        const { data: banner, error } = await supabase
            .from('banners')
            .update({ is_active: !current.is_active })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error toggling banner status:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/banners')
        revalidatePath('/', 'layout')

        return { success: true, banner: banner as Banner }
    } catch (error: any) {
        console.error('Error in toggleBannerStatus:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Reorder banners within a placement
 */
export async function reorderBanners(
    placement: BannerPlacement,
    orderedIds: string[]
): Promise<{
    success: boolean
    error?: string
}> {
    try {
        const supabase = await createClerkSupabaseClient()

        // Update position for each banner
        const updates = orderedIds.map((id, index) =>
            supabase
                .from('banners')
                .update({ position: index })
                .eq('id', id)
                .eq('placement', placement)
        )

        await Promise.all(updates)

        revalidatePath('/admin/banners')
        revalidatePath('/', 'layout')

        return { success: true }
    } catch (error: any) {
        console.error('Error in reorderBanners:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Upload banner image to Supabase Storage
 */
export async function uploadBannerImage(file: File): Promise<{
    success: boolean
    url?: string
    error?: string
}> {
    try {
        const supabase = await createClerkSupabaseClient()

        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${fileName}`

        // Upload to storage
        const { data, error } = await supabase.storage
            .from('banners')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            })

        if (error) {
            console.error('Error uploading banner image:', error)
            return { success: false, error: error.message }
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('banners')
            .getPublicUrl(data.path)

        return { success: true, url: publicUrl }
    } catch (error: any) {
        console.error('Error in uploadBannerImage:', error)
        return { success: false, error: error.message }
    }
}

