/**
 * Cloudinary Upload API Route
 * Handles image uploads to Cloudinary
 */

import { NextRequest, NextResponse } from 'next/server'
import { uploadImage, uploadMultipleImages } from '@/lib/services/cloudinary'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const folder = formData.get('folder') as string | null
    const tags = formData.get('tags') as string | null

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    const uploadOptions = {
      folder: folder || 'cedar-elevators',
      tags: tags ? tags.split(',') : [],
      format: 'webp' as const,
      quality: 'auto' as const,
    }

    // Single file upload
    if (files.length === 1) {
      const result = await uploadImage(files[0], uploadOptions)
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        url: result.secureUrl,
        publicId: result.publicId,
      })
    }

    // Multiple files upload
    const results = await uploadMultipleImages(files, uploadOptions)
    const successfulUploads = results.filter(r => r.success)
    const failedUploads = results.filter(r => !r.success)

    return NextResponse.json({
      success: failedUploads.length === 0,
      uploads: successfulUploads.map(r => ({
        url: r.secureUrl,
        publicId: r.publicId,
      })),
      failed: failedUploads.length,
      errors: failedUploads.map(r => r.error),
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed', details: error.message },
      { status: 500 }
    )
  }
}

