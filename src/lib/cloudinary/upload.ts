import { cloudinary } from './config'

/**
 * Upload an image to Cloudinary
 * @param file - File object or base64 string
 * @param folder - Cloudinary folder path (e.g., 'products', 'banners')
 * @param publicId - Optional custom public ID
 * @returns Cloudinary upload result with secure URL
 */
export async function uploadToCloudinary(
    file: File | string,
    folder: string = 'uploads',
    publicId?: string
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        let uploadData: string

        // Convert File to base64 if needed
        if (file instanceof File) {
            const arrayBuffer = await file.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)
            uploadData = `data:${file.type};base64,${buffer.toString('base64')}`
        } else {
            uploadData = file
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(uploadData, {
            folder,
            public_id: publicId,
            resource_type: 'auto',
            transformation: [
                { quality: 'auto:good' },
                { fetch_format: 'auto' }
            ]
        })

        return {
            success: true,
            url: result.secure_url
        }
    } catch (error: any) {
        console.error('Cloudinary upload error:', error)
        return {
            success: false,
            error: error.message || 'Failed to upload image'
        }
    }
}

/**
 * Delete an image from Cloudinary
 * @param publicId - The public ID of the image to delete
 * @returns Success status
 */
export async function deleteFromCloudinary(
    publicId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await cloudinary.uploader.destroy(publicId)
        return { success: true }
    } catch (error: any) {
        console.error('Cloudinary delete error:', error)
        return {
            success: false,
            error: error.message || 'Failed to delete image'
        }
    }
}

/**
 * Extract public ID from Cloudinary URL
 * @param url - Cloudinary URL
 * @returns Public ID
 */
export async function getPublicIdFromUrl(url: string): Promise<string> {
    const parts = url.split('/')
    const filename = parts[parts.length - 1]
    return filename.split('.')[0]
}

