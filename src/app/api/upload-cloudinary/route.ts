/**
 * Cloudinary Upload API Route
 * Handles image uploads to Cloudinary
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { uploadImage, uploadMultipleImages } from '@/lib/services/cloudinary'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const folder = formData.get('folder') as string || 'cedar-elevators'
    const tags = formData.get('tags')
      ? JSON.parse(formData.get('tags') as string)
      : []

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const invalidFiles = files.filter(file => !validTypes.includes(file.type))

    if (invalidFiles.length > 0) {
      return NextResponse.json(
        {
          error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed',
        },
        { status: 400 }
      )
    }

    // Validate file sizes (max 5MB per file)
    const maxSize = 5 * 1024 * 1024 // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize)

    if (oversizedFiles.length > 0) {
      return NextResponse.json(
        {
          error: 'File size too large. Maximum size is 5MB per file',
        },
        { status: 400 }
      )
    }

    // Upload single or multiple files
    let result

    if (files.length === 1) {
      result = await uploadImage(files[0], {
        folder,
        tags,
        format: 'webp',
        quality: 'auto',
      })

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        image: {
          url: result.url,
          secureUrl: result.secureUrl,
          publicId: result.publicId,
        },
      })
    } else {
      result = await uploadMultipleImages(files, {
        folder,
        tags,
        format: 'webp',
        quality: 'auto',
      })

      const successfulUploads = result.filter(r => r.success)
      const failedUploads = result.filter(r => !r.success)

      return NextResponse.json({
        success: true,
        images: successfulUploads.map(r => ({
          url: r.url,
          secureUrl: r.secureUrl,
          publicId: r.publicId,
        })),
        failed: failedUploads.length,
        total: files.length,
      })
    }
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    )
  }
}
