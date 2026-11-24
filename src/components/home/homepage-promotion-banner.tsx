"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Sparkles } from "lucide-react"
import { HomepagePromotion } from "@/lib/types/settings"

interface HomepagePromotionBannerProps {
  promotion?: HomepagePromotion | null
}

export function HomepagePromotionBanner({ promotion }: HomepagePromotionBannerProps) {
  const [imageError, setImageError] = useState(false)

  // 1. Check if promotion is enabled and has valid content
  if (!promotion || !promotion.enabled) {
    return null
  }

  const title = promotion.title?.trim()
  if (!title) {
    return null
  }

  // 2. Validate active date window if dates are specified
  const now = new Date()
  if (promotion.start_date) {
    const startDate = new Date(promotion.start_date)
    if (!isNaN(startDate.getTime()) && now < startDate) {
      return null
    }
  }

  if (promotion.end_date) {
    const endDate = new Date(promotion.end_date)
    if (!isNaN(endDate.getTime()) && now > endDate) {
      return null
    }
  }

  const ctaLabel = promotion.cta_label?.trim() || "Explore Products →"
  const ctaUrl = promotion.cta_url?.trim() || "/products"
  const hasValidImage = Boolean(promotion.image_url?.trim()) && !imageError

  return (
    <section 
      aria-label="Promotional Announcement"
      className="w-full bg-white px-4 sm:px-6 md:px-8 lg:px-12 py-4 sm:py-6"
    >
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-xl border border-orange-200/90 bg-gradient-to-r from-orange-50/90 via-amber-50/50 to-white p-5 sm:p-6 md:p-8 shadow-sm">
          {/* Subtle Decorative Accent */}
          <div 
            className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 bg-orange-200/30 blur-2xl rounded-full"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Left Content Area */}
            <div className="flex-1 max-w-3xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-100 border border-orange-200 text-orange-800 text-[11px] font-semibold uppercase tracking-wider mb-2.5">
                <Sparkles className="w-3 h-3 text-orange-600" />
                <span>Special Update</span>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-2.5xl font-bold text-gray-900 tracking-tight leading-snug">
                {title}
              </h2>

              {promotion.description?.trim() && (
                <p className="mt-2 text-sm sm:text-base text-gray-600 leading-relaxed font-normal">
                  {promotion.description.trim()}
                </p>
              )}

              {/* Action Button for mobile & text-layout */}
              <div className="mt-4 md:mt-5">
                <Link
                  href={ctaUrl}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all duration-150"
                >
                  <span>{ctaLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Optional Promotional Image */}
            {hasValidImage && (
              <div className="w-full md:w-auto flex-shrink-0">
                <div className="relative w-full sm:w-72 md:w-80 h-40 sm:h-44 rounded-lg overflow-hidden border border-orange-100 bg-white shadow-xs">
                  <Image
                    src={promotion.image_url!}
                    alt={title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 288px, 320px"
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    onError={() => setImageError(true)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HomepagePromotionBanner
