import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary/upload'

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

        const supabase = createAdminClient()

        // Get the user from users table using clerk_user_id
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_user_id', userId)
            .maybeSingle()

        if (userError || !user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            )
        }


        // Verify ownership of verification using users.id (not user_profiles.id)
        const { data: verification, error: verifyError } = await supabase
            .from('business_verifications')
            .select('id, user_id, status')
            .eq('id', verificationId)
            .eq('user_id', user.id)
            .single()

        if (verifyError || !verification) {
            console.error('[Document Upload] Verification not found:', {
                verificationId,
                userId: user.id,
                error: verifyError
            })
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

        // Upload to Cloudinary
        const uploadResult = await uploadToCloudinary(file, 'business-verification')

        if (!uploadResult || !uploadResult.secure_url) {
            return NextResponse.json(
                { success: false, error: 'Failed to upload document to Cloudinary' },
                { status: 500 }
            )
        }

        // Save document record with Cloudinary URL and public_id
        const { data: documentData, error: dbError } = await supabase
            .from('business_verification_documents')
            .insert({
                verification_id: verificationId,
                document_type: documentType,
                document_url: uploadResult.secure_url,
                file_name: file.name,
                cloudinary_public_id: uploadResult.public_id
            })
            .select()
            .single()

        if (dbError) {
            // Cleanup uploaded file from Cloudinary if DB insert fails
            if (uploadResult.public_id) {
                await deleteFromCloudinary(uploadResult.public_id)
            }
            throw dbError
        }

        return NextResponse.json({
            success: true,
            document_url: uploadResult.secure_url,
            document_id: documentData.id,
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


        const supabase = createAdminClient()

        // Get the user from users table using clerk_user_id
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_user_id', userId)
            .maybeSingle()

        if (userError || !user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            )
        }

        // Get document and verify ownership
        const { data: document, error: fetchError } = await supabase
            .from('business_verification_documents')
            .select(`
        *,
        verification:business_verifications!inner(user_id, status)
      `)
            .eq('id', documentId)
            .single()

        if (fetchError || !document) {
            return NextResponse.json(
                { success: false, error: 'Document not found' },
                { status: 404 }
            )
        }

        // Verify ownership - compare user.id (UUID) with verification.user_id (UUID)
        if (document.verification.user_id !== user.id) {
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

        // Delete from Cloudinary if public_id exists
        if (document.cloudinary_public_id) {
            await deleteFromCloudinary(document.cloudinary_public_id)
        }

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
