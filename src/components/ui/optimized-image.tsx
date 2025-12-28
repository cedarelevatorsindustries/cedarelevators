/**
 * Optimized Image Component
 * Wrapper around Next.js Image with Cloudinary integration
 */

'use client'

import Image, { ImageProps } from 'next/image'
import { useState } from 'react'
import {
  getOptimizedImageUrl,
  generateResponsiveSrcSet,
  generateLQIP,
  IMAGE_PRESETS,
} from '@/lib/services/cloudinary'

export interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string
  alt: string
  preset?: keyof typeof IMAGE_PRESETS
  cloudinaryId?: string
  showBlurPlaceholder?: boolean
  fallbackSrc?: string
}

export function OptimizedImage({
  src,
  alt,
  preset,
  cloudinaryId,
  showBlurPlaceholder = true,
  fallbackSrc = '/images/placeholder.png',
  className,
  ...props
}: OptimizedImageProps) {
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // If cloudinaryId is provided, use Cloudinary optimization
  const imageSrc = cloudinaryId
    ? getOptimizedImageUrl(
        cloudinaryId,
        preset ? IMAGE_PRESETS[preset] : {}
      )
    : src

  // Generate blur placeholder if using Cloudinary
  const blurDataURL =
    showBlurPlaceholder && cloudinaryId
      ? generateLQIP(cloudinaryId)
      : undefined

  return (
    <div className={`relative ${isLoading ? 'animate-pulse bg-gray-200' : ''}`}>
      <Image
        src={error ? fallbackSrc : imageSrc}
        alt={alt}
        className={className}
        placeholder={blurDataURL ? 'blur' : 'empty'}
        blurDataURL={blurDataURL}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError(true)
          setIsLoading(false)
        }}
        {...props}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-orange-500" />
        </div>
      )}
    </div>
  )
}

/**
 * Product Image Component with optimized loading
 */
export function ProductImage({
  src,
  alt,
  cloudinaryId,
  size = 'card',
  ...props
}: OptimizedImageProps & { size?: 'thumbnail' | 'card' | 'detail' }) {
  const presetMap = {
    thumbnail: 'THUMBNAIL' as const,
    card: 'PRODUCT_CARD' as const,
    detail: 'PRODUCT_DETAIL' as const,
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      cloudinaryId={cloudinaryId}
      preset={presetMap[size]}
      showBlurPlaceholder
      {...props}
    />
  )
}

/**
 * Avatar Image Component
 */
export function AvatarImage({
  src,
  alt,
  cloudinaryId,
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      cloudinaryId={cloudinaryId}
      preset="AVATAR"
      showBlurPlaceholder
      fallbackSrc="/images/avatar-placeholder.png"
      {...props}
    />
  )
}

/**
 * Hero Image Component
 */
export function HeroImage({
  src,
  alt,
  cloudinaryId,
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      cloudinaryId={cloudinaryId}
      preset="HERO"
      showBlurPlaceholder
      priority
      {...props}
    />
  )
}
