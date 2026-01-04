'use server'

import { createServerSupabase } from '@/lib/supabase/server'

/**
 * Upload entity banner image to Supabase Storage
 * Uses the 'banners' bucket (same as carousel banners)
 * 
 * @param file - The image file to upload
 * @param entityType - Type of entity (category, elevator-type, collection, application)
 * @returns Object with success status and URL or error message
 */
export async function uploadEntityBannerImage(
    file: File,
    entityType: 'category' | 'elevator-type' | 'collection' | 'application'
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        const supabase = await createServerSupabase()

        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${entityType}-${Date.now()}.${fileExt}`
        const filePath = `entity-banners/${fileName}`

        // Convert File to ArrayBuffer for upload
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Upload to storage
        const { data, error } = await supabase.storage
            .from('banners')
            .upload(filePath, buffer, {
                contentType: file.type,
                cacheControl: '3600',
                upsert: false
            })

        if (error) {
            console.error('Error uploading entity banner:', error)
            return { success: false, error: error.message }
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('banners')
            .getPublicUrl(filePath)

        return { success: true, url: publicUrl }
    } catch (error) {
        console.error('Error uploading entity banner:', error)
        return { success: false, error: String(error) }
    }
}

/**
 * Delete entity banner image from Supabase Storage
 * 
 * @param imageUrl - The full URL of the image to delete
 * @returns Object with success status and error message if failed
 */
export async function deleteEntityBannerImage(
    imageUrl: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createServerSupabase()

        // Extract file path from URL
        // URL format: https://{project}.supabase.co/storage/v1/object/public/banners/{filePath}
        const urlParts = imageUrl.split('/banners/')
        if (urlParts.length !== 2) {
            return { success: false, error: 'Invalid image URL format' }
        }

        const filePath = urlParts[1]

        // Delete from storage
        const { error } = await supabase.storage
            .from('banners')
            .remove([filePath])

        if (error) {
            console.error('Error deleting entity banner:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error) {
        console.error('Error deleting entity banner:', error)
        return { success: false, error: String(error) }
    }
}

