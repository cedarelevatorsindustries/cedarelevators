'use server'

import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from '@/lib/cloudinary/upload'

/**
 * Upload entity banner image to Cloudinary
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
        const folder = `cedar/entity-banners/${entityType}`
        const result = await uploadToCloudinary(file, folder)

        if (!result.success || !result.url) {
            throw new Error(result.error || 'Failed to upload image')
        }

        return { success: true, url: result.url }
    } catch (error) {
        console.error('Error uploading entity banner:', error)
        return { success: false, error: String(error) }
    }
}

/**
 * Delete entity banner image from Cloudinary
 * 
 * @param imageUrl - The full URL of the image to delete
 * @returns Object with success status and error message if failed
 */
export async function deleteEntityBannerImage(
    imageUrl: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Only delete from Cloudinary if it's a Cloudinary URL
        if (!imageUrl.includes('cloudinary.com') && !imageUrl.includes('res.cloudinary.com')) {
            // Not a Cloudinary URL, skip deletion (might be old Supabase URL)
            return { success: true }
        }

        const publicId = await getPublicIdFromUrl(imageUrl)
        const result = await deleteFromCloudinary(publicId)

        if (!result.success) {
            console.error('Error deleting entity banner:', result.error)
            return { success: false, error: result.error }
        }

        return { success: true }
    } catch (error) {
        console.error('Error deleting entity banner:', error)
        return { success: false, error: String(error) }
    }
}
