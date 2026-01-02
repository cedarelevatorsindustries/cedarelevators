'use server'

import { createAdminClient } from '@/lib/supabase/server'

const BUCKET_NAME = 'business-verification-documents'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']

export interface UploadResult {
    success: boolean
    url?: string
    path?: string
    error?: string
}

/**
 * Upload verification document to Supabase Storage
 */
export async function uploadVerificationDocument(
    file: File,
    businessId: string,
    documentType: 'gst_certificate' | 'company_registration' | 'pan_card'
): Promise<UploadResult> {
    try {
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return { success: false, error: 'File size exceeds 5MB limit' }
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return { success: false, error: 'Invalid file type. Only PDF, JPG, and PNG are allowed' }
        }

        const supabase = createAdminClient()

        // Generate unique file path
        const fileExt = file.name.split('.').pop()
        const fileName = `${businessId}/${documentType}_${Date.now()}.${fileExt}`

        // Convert File to ArrayBuffer for upload
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: true
            })

        if (error) {
            console.error('Storage upload error:', error)
            return { success: false, error: 'Failed to upload file' }
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(fileName)

        return {
            success: true,
            url: publicUrl,
            path: fileName
        }
    } catch (error: any) {
        console.error('Error in uploadVerificationDocument:', error)
        return { success: false, error: error.message || 'Failed to upload document' }
    }
}

/**
 * Delete verification document from storage
 */
export async function deleteVerificationDocument(
    filePath: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createAdminClient()

        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([filePath])

        if (error) {
            console.error('Storage delete error:', error)
            return { success: false, error: 'Failed to delete file' }
        }

        return { success: true }
    } catch (error: any) {
        console.error('Error in deleteVerificationDocument:', error)
        return { success: false, error: error.message || 'Failed to delete document' }
    }
}

/**
 * Get signed URL for private document access
 */
export async function getDocumentSignedUrl(
    filePath: string,
    expiresIn: number = 3600 // 1 hour default
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        const supabase = createAdminClient()

        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(filePath, expiresIn)

        if (error) {
            console.error('Signed URL error:', error)
            return { success: false, error: 'Failed to generate signed URL' }
        }

        return { success: true, url: data.signedUrl }
    } catch (error: any) {
        console.error('Error in getDocumentSignedUrl:', error)
        return { success: false, error: error.message || 'Failed to generate signed URL' }
    }
}
