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

// =====================================================
// QUOTE ATTACHMENTS
// =====================================================

const QUOTE_ATTACHMENTS_BUCKET = 'quote-attachments'
const QUOTE_ALLOWED_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]

export interface QuoteAttachmentUploadResult {
    success: boolean
    file_name?: string
    file_url?: string
    file_size?: number
    mime_type?: string
    error?: string
}

/**
 * Upload quote attachment to Supabase Storage
 * Converts File to base64 on client and sends to server
 */
export async function uploadQuoteAttachment(
    fileData: {
        base64: string
        fileName: string
        fileType: string
        fileSize: number
    },
    quoteNumber?: string
): Promise<QuoteAttachmentUploadResult> {
    try {
        // Validate file size
        if (fileData.fileSize > MAX_FILE_SIZE) {
            return { success: false, error: 'File size exceeds 5MB limit' }
        }

        // Validate file type
        if (!QUOTE_ALLOWED_TYPES.includes(fileData.fileType)) {
            return {
                success: false,
                error: 'Invalid file type. Only PDF, DOC, CSV, and images are allowed'
            }
        }

        const supabase = createAdminClient()

        // Generate unique file path
        const fileExt = fileData.fileName.split('.').pop()
        const timestamp = Date.now()
        const randomId = Math.random().toString(36).substring(2, 8)
        const folder = quoteNumber || 'pending'
        const fileName = `${folder}/${timestamp}_${randomId}.${fileExt}`

        // Convert base64 to buffer
        const base64Data = fileData.base64.split(',')[1] || fileData.base64
        const buffer = Buffer.from(base64Data, 'base64')

        // Ensure bucket exists (create if needed)
        const { data: buckets } = await supabase.storage.listBuckets()
        const bucketExists = buckets?.some(b => b.name === QUOTE_ATTACHMENTS_BUCKET)

        if (!bucketExists) {
            await supabase.storage.createBucket(QUOTE_ATTACHMENTS_BUCKET, {
                public: false,
                fileSizeLimit: MAX_FILE_SIZE
            })
        }

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(QUOTE_ATTACHMENTS_BUCKET)
            .upload(fileName, buffer, {
                contentType: fileData.fileType,
                upsert: true
            })

        if (error) {
            console.error('Quote attachment upload error:', error)
            return { success: false, error: 'Failed to upload attachment' }
        }

        // Get public URL (or signed URL for private access)
        const { data: urlData } = await supabase.storage
            .from(QUOTE_ATTACHMENTS_BUCKET)
            .createSignedUrl(fileName, 60 * 60 * 24 * 7) // 7 days

        return {
            success: true,
            file_name: fileData.fileName,
            file_url: urlData?.signedUrl || '',
            file_size: fileData.fileSize,
            mime_type: fileData.fileType
        }
    } catch (error: any) {
        console.error('Error in uploadQuoteAttachment:', error)
        return { success: false, error: error.message || 'Failed to upload attachment' }
    }
}

/**
 * Upload multiple quote attachments
 */
export async function uploadQuoteAttachments(
    files: Array<{
        base64: string
        fileName: string
        fileType: string
        fileSize: number
    }>,
    quoteNumber?: string
): Promise<{
    success: boolean
    attachments?: QuoteAttachmentUploadResult[]
    error?: string
}> {
    try {
        const results = await Promise.all(
            files.map(file => uploadQuoteAttachment(file, quoteNumber))
        )

        const failed = results.filter(r => !r.success)
        if (failed.length > 0) {
            return {
                success: false,
                error: `Failed to upload ${failed.length} file(s): ${failed[0].error}`
            }
        }

        return {
            success: true,
            attachments: results
        }
    } catch (error: any) {
        console.error('Error in uploadQuoteAttachments:', error)
        return { success: false, error: error.message || 'Failed to upload attachments' }
    }
}

