/**
 * Cloudinary Service for Image Optimization
 * Handles image uploads, transformations, and optimization
 */

import { v2 as cloudinary } from 'cloudinary'

// Check if Cloudinary is configured
const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET

// Configure Cloudinary
if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })
}

export interface UploadOptions {
  folder?: string
  transformation?: TransformationOptions
  format?: 'jpg' | 'png' | 'webp' | 'avif'
  quality?: number | 'auto'
  tags?: string[]
}

export interface TransformationOptions {
  width?: number
  height?: number
  crop?: 'fill' | 'fit' | 'scale' | 'limit' | 'pad'
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west'
  aspectRatio?: string
}

/**
 * Upload image to Cloudinary
 */
export async function uploadImage(
  file: File | string,
  options: UploadOptions = {}
): Promise<{
  success: boolean
  url?: string
  secureUrl?: string
  publicId?: string
  error?: string
}> {
  if (!isCloudinaryConfigured) {
    console.error('Cloudinary not configured')
    return { success: false, error: 'Cloudinary not configured' }
  }

  try {
    let dataURI: string

    // Convert File to base64 if needed
    if (file instanceof File) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = buffer.toString('base64')
      dataURI = `data:${file.type};base64,${base64}`
    } else {
      dataURI = file
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: options.folder || 'cedar-elevators',
      format: options.format,
      quality: options.quality || 'auto',
      tags: options.tags,
      transformation: options.transformation,
      resource_type: 'auto',
    })

    return {
      success: true,
      url: result.url,
      secureUrl: result.secure_url,
      publicId: result.public_id,
    }
  } catch (error: any) {
    console.error('Cloudinary upload error:', error)
    return {
      success: false,
      error: error.message || 'Upload failed',
    }
  }
}

/**
 * Upload multiple images
 */
export async function uploadMultipleImages(
  files: File[],
  options: UploadOptions = {}
): Promise<Array<{
  success: boolean
  url?: string
  secureUrl?: string
  publicId?: string
  error?: string
}>> {
  return Promise.all(files.map(file => uploadImage(file, options)))
}

/**
 * Delete image from Cloudinary
 */
export async function deleteImage(
  publicId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isCloudinaryConfigured) {
    return { success: false, error: 'Cloudinary not configured' }
  }

  try {
    await cloudinary.uploader.destroy(publicId)
    return { success: true }
  } catch (error: any) {
    console.error('Cloudinary delete error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Delete multiple images
 */
export async function deleteMultipleImages(
  publicIds: string[]
): Promise<{ success: boolean; deletedCount: number; error?: string }> {
  if (!isCloudinaryConfigured) {
    return { success: false, deletedCount: 0, error: 'Cloudinary not configured' }
  }

  try {
    const result = await cloudinary.api.delete_resources(publicIds)
    return {
      success: true,
      deletedCount: Object.keys(result.deleted).length,
    }
  } catch (error: any) {
    console.error('Cloudinary bulk delete error:', error)
    return {
      success: false,
      deletedCount: 0,
      error: error.message,
    }
  }
}

/**
 * Get optimized image URL with transformations
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: TransformationOptions & { format?: string; quality?: number | 'auto' } = {}
): string {
  if (!isCloudinaryConfigured) {
    return ''
  }

  return cloudinary.url(publicId, {
    transformation: [
      {
        width: options.width,
        height: options.height,
        crop: options.crop || 'fill',
        gravity: options.gravity || 'auto',
        quality: options.quality || 'auto',
        fetch_format: options.format || 'auto',
      },
    ],
    secure: true,
  })
}

/**
 * Generate responsive image srcset
 */
export function generateResponsiveSrcSet(
  publicId: string,
  widths: number[] = [320, 640, 768, 1024, 1280, 1536],
  options: Omit<TransformationOptions, 'width'> = {}
): string {
  if (!isCloudinaryConfigured) {
    return ''
  }

  return widths
    .map(width => {
      const url = getOptimizedImageUrl(publicId, {
        ...options,
        width,
      })
      return `${url} ${width}w`
    })
    .join(', ')
}

/**
 * Generate low-quality image placeholder (LQIP) for blur effect
 */
export function generateLQIP(publicId: string): string {
  if (!isCloudinaryConfigured) {
    return ''
  }

  return cloudinary.url(publicId, {
    transformation: [
      {
        width: 20,
        quality: 1,
        fetch_format: 'auto',
        effect: 'blur:1000',
      },
    ],
    secure: true,
  })
}

/**
 * Image transformation presets
 */
export const IMAGE_PRESETS = {
  THUMBNAIL: {
    width: 150,
    height: 150,
    crop: 'fill' as const,
    gravity: 'auto' as const,
  },
  PRODUCT_CARD: {
    width: 400,
    height: 400,
    crop: 'fill' as const,
    gravity: 'auto' as const,
  },
  PRODUCT_DETAIL: {
    width: 800,
    height: 800,
    crop: 'fit' as const,
    gravity: 'auto' as const,
  },
  HERO: {
    width: 1920,
    height: 1080,
    crop: 'fill' as const,
    gravity: 'auto' as const,
  },
  AVATAR: {
    width: 200,
    height: 200,
    crop: 'fill' as const,
    gravity: 'face' as const,
  },
} as const

// Export cloudinary instance for advanced usage
export { cloudinary }

// Helper to check if Cloudinary is available
export const isCloudinaryAvailable = () => isCloudinaryConfigured
