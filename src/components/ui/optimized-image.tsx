/**
 * Optimized Image Component
 * Uses Cloudinary for optimization with Next.js Image
 */

'use client'

import Image, { ImageProps } from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string
  alt: string
  blurhash?: string
  fallbackSrc?: string
  aspectRatio?: string
}

export function OptimizedImage({
  src,
  alt,
  className,
  blurhash,
  fallbackSrc = '/images/placeholder.png',
  aspectRatio,
  ...props
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)

  const handleError = () => {
    setImageSrc(fallbackSrc)
  }

  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <Image
        src={imageSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onError={handleError}
        onLoad={handleLoadingComplete}
        {...props}
      />
    </div>
  )
}

/**
 * Responsive optimized image with srcset
 */
interface ResponsiveImageProps extends OptimizedImageProps {
  sizes?: string
}

export function ResponsiveImage({
  src,
  alt,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  ...props
}: ResponsiveImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      sizes={sizes}
      {...props}
    />
  )
}
