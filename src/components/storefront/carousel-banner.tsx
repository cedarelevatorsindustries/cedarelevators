"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Banner } from "@/lib/types/banners"

interface CarouselBannerProps {
  banners: Banner[]
  autoPlayInterval?: number // milliseconds
  showControls?: boolean
  showIndicators?: boolean
}

export function CarouselBanner({
  banners,
  autoPlayInterval = 5000,
  showControls = true,
  showIndicators = true
}: CarouselBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [isAutoPlaying, banners.length, autoPlayInterval])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false) // Pause auto-play when manually navigating
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
    setIsAutoPlaying(false)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
    setIsAutoPlaying(false)
  }

  // Build link URL from banner target
  const getLinkUrl = (banner: Banner): string => {
    const linkType = banner.link_type || banner.target_type
    const linkId = banner.link_id || banner.target_id

    if (!linkType || !linkId) return banner.cta_link || '#'

    // Map link types to routes
    const routeMap: Record<string, string> = {
      'application': `/catalog?application=${linkId}`,
      'category': `/catalog?category=${linkId}`,
      'elevator-type': `/catalog?type=${linkId}`,
      'collection': `/collections/${linkId}`
    }

    return routeMap[linkType] || '#'
  }

  if (banners.length === 0) {
    return null
  }

  const currentBanner = banners[currentIndex]

  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-gray-100">
      {/* Banner Slides */}
      <div className="relative aspect-[16/9] md:aspect-[21/9]">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Banner Image */}
            <img
              src={banner.image_url}
              alt={banner.image_alt || banner.title}
              className="h-full w-full object-cover"
            />

            {/* Overlay Content */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center"
              style={{
                backgroundColor: banner.background_color
                  ? `${banner.background_color}cc`
                  : undefined
              }}
            >
              <div className="container mx-auto px-4 md:px-8">
                <div className="max-w-2xl">
                  {/* Title */}
                  <h2
                    className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4"
                    style={{ color: banner.text_color || 'white' }}
                  >
                    {banner.title}
                  </h2>

                  {/* Subtitle */}
                  {banner.subtitle && (
                    <p
                      className="text-lg md:text-xl lg:text-2xl mb-6 max-w-xl"
                      style={{ color: banner.text_color || 'white' }}
                    >
                      {banner.subtitle}
                    </p>
                  )}

                  {/* CTA Button */}
                  {banner.cta_text && (
                    <Button
                      asChild
                      size="lg"
                      className={`
                        ${banner.cta_style === 'primary' ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}
                        ${banner.cta_style === 'secondary' ? 'bg-white hover:bg-gray-100 text-gray-900' : ''}
                        ${banner.cta_style === 'outline' ? 'bg-transparent border-2 border-white hover:bg-white/10 text-white' : ''}
                      `}
                    >
                      <Link href={getLinkUrl(banner)}>
                        {banner.cta_text}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      {showControls && banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 rounded-full p-2 shadow-lg transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 rounded-full p-2 shadow-lg transition-all"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
