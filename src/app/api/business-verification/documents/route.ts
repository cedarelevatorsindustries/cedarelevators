import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClerkSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const formData = await request.formData()
        const file = formData.get('file') as File
        const documentType = formData.get('document_type') as string
        const verificationId = formData.get('verification_id') as string

        if (!file || !documentType || !verificationId) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, error: 'File size must be less than 5MB' },
                { status: 400 }
            )
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { success: false, error: 'Invalid file type. Only PDF, JPG, and PNG are allowed' },
                { status: 400 }
            )
        }

        const supabase = await createClerkSupabaseClient()

        // Verify ownership of verification
        const { data: verification, error: verifyError } = await supabase
            .from('business_verifications')
            .select('id, clerk_user_id, status')
            .eq('id', verificationId)
            .eq('clerk_user_id', userId)
            .single()

        if (verifyError || !verification) {
            return NextResponse.json(
                { success: false, error: 'Verification not found' },
                { status: 404 }
            )
        }

        // Check if verification allows document upload
        if (!['incomplete', 'rejected', 'pending'].includes(verification.status)) {
            return NextResponse.json(
                { success: false, error: 'Cannot upload documents for approved verification' },
                { status: 400 }
            )
        }

        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop()
        const fileName = `${verificationId}/${documentType}_${Date.now()}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('business-documents')
            .upload(fileName, file, {
                contentType: file.type,
                upsert: false
            })

        if (uploadError) {
            console.error('Storage upload error:', uploadError)
            return NextResponse.json(
                { success: false, error: 'Failed to upload document' },
                { status: 500 }
            )
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('business-documents')
            .getPublicUrl(fileName)

        // Save document record
        const { error: dbError } = await supabase
            .from('business_verification_documents')
            .insert({
                verification_id: verificationId,
                document_type: documentType,
                document_url: publicUrl,
                file_name: file.name,
                file_size: file.size
            })

        if (dbError) {
            // Cleanup uploaded file if DB insert fails
            await supabase.storage.from('business-documents').remove([fileName])
            throw dbError
        }

        return NextResponse.json({
            success: true,
            document_url: publicUrl,
            message: 'Document uploaded successfully'
        })
    } catch (error) {
        console.error('Error uploading document:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to upload document' },
            { status: 500 }
        )
    }
}

// DELETE - Remove a document
export async function DELETE(request: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const documentId = searchParams.get('id')

        if (!documentId) {
            return NextResponse.json(
                { success: false, error: 'Document ID required' },
                { status: 400 }
            )
        }

        const supabase = await createClerkSupabaseClient()

        // Get document and verify ownership
        const { data: document, error: fetchError } = await supabase
            .from('business_verification_documents')
            .select(`
        *,
        verification:business_verifications!inner(clerk_user_id, status)
      `)
            .eq('id', documentId)
            .single()

        if (fetchError || !document) {
            return NextResponse.json(
                { success: false, error: 'Document not found' },
                { status: 404 }
            )
        }

        // Verify ownership
        if (document.verification.clerk_user_id !== userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            )
        }

        // Check if deletion is allowed
        if (!['incomplete', 'rejected', 'pending'].includes(document.verification.status)) {
            return NextResponse.json(
                { success: false, error: 'Cannot delete documents for approved verification' },
                { status: 400 }
            )
        }

        // Extract file path from URL
        const urlParts = document.document_url.split('/business-documents/')
        const filePath = urlParts[1]

        // Delete from storage
        await supabase.storage.from('business-documents').remove([filePath])

        // Delete from database
        const { error: deleteError } = await supabase
            .from('business_verification_documents')
            .delete()
            .eq('id', documentId)

        if (deleteError) throw deleteError

        return NextResponse.json({
            success: true,
            message: 'Document deleted successfully'
        })
    } catch (error) {
        console.error('Error deleting document:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete document' },
            { status: 500 }
        )
    }
}
