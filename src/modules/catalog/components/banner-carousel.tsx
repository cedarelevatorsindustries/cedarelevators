"use client"

import { BannerWithSlides, BannerSlide } from "@/lib/types/banners"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination, EffectFade } from "swiper/modules"

// Import Swiper styles
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/effect-fade"

interface BannerCarouselProps {
  banners: BannerWithSlides[]
}

export function BannerCarousel({ banners }: BannerCarouselProps) {
  // Flatten all slides from all banners while preserving banner context
  const allSlides = banners.flatMap(banner =>
    (banner.slides || []).map((slide: BannerSlide) => ({
      ...slide,
      bannerTitle: banner.title,
      bannerSubtitle: banner.subtitle,
      bannerCtaText: banner.cta_text,
      bannerCtaStyle: banner.cta_style,
      bannerTargetType: banner.target_type,
      bannerTargetId: banner.target_id,
      textColor: banner.text_color || 'white'
    }))
  ).sort((a, b) => a.sort_order - b.sort_order)

  if (allSlides.length === 0) return null

  // Helper to generate CTA link
  const getCtaLink = (slide: typeof allSlides[0]) => {
    if (!slide.bannerTargetType || !slide.bannerTargetId) return "/catalog"
    return `/catalog?${slide.bannerTargetType}=${slide.bannerTargetId}`
  }

  return (
    <div className="mb-0 relative w-full overflow-hidden rounded-2xl group">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        effect="fade"
        pagination={{
          clickable: true,
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop={allSlides.length > 1}
        className="w-full h-full aspect-[21/9] md:aspect-[24/7]"
      >
        {allSlides.map((slide) => (
          <SwiperSlide key={slide.id} className="relative w-full h-full">
            {/* Image */}
            <div className="relative w-full h-full">
              <Image
                src={slide.image_url}
                alt={slide.bannerTitle || "Banner"}
                fill
                className="object-cover"
                priority={true}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/30" />

              {/* Content Container */}
              <div className="absolute inset-0 flex items-center px-8 md:px-16">
                <div className="max-w-2xl" style={{ color: slide.textColor }}>
                  <h2 className="text-2xl md:text-5xl font-bold mb-2 md:mb-4 animate-in fade-in slide-in-from-left-4 duration-700">
                    {slide.bannerTitle}
                  </h2>
                  {slide.bannerSubtitle && (
                    <p className="text-sm md:text-xl mb-4 md:mb-8 opacity-90 animate-in fade-in slide-in-from-left-6 duration-700 delay-100">
                      {slide.bannerSubtitle}
                    </p>
                  )}
                  {slide.bannerCtaText && (
                    <div className="animate-in fade-in slide-in-from-left-8 duration-700 delay-200">
                      <Button
                        asChild
                        size="lg"
                        className={`${slide.bannerCtaStyle === 'outline'
                          ? 'bg-transparent border-2 border-white text-white hover:bg-white/10'
                          : 'bg-orange-600 hover:bg-orange-700 text-white border-none'
                          } px-8 h-10 md:h-12 text-sm md:text-base`}
                      >
                        <Link href={getCtaLink(slide)}>
                          {slide.bannerCtaText}
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.5);
          opacity: 1;
        }
        .swiper-pagination-bullet-active {
          width: 24px;
          border-radius: 4px;
          background: #ffffff;
        }
      `}</style>
    </div>
  )
}

