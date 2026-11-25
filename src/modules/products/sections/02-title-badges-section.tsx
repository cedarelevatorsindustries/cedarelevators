"use client"

import { Star, Award, TrendingUp, Zap } from "lucide-react"

interface TitleBadgesSectionProps {
  title: string
  rating?: number
  reviewCount?: number
  badges?: Array<"bestseller" | "new" | "featured" | "verified">
  description?: string
  onClickReviews?: () => void
}

export default function TitleBadgesSection({
  title,
  rating = 0,
  reviewCount = 0,
  badges = [],
  description,
  onClickReviews
}: TitleBadgesSectionProps) {
  const badgeConfig = {
    bestseller: { icon: TrendingUp, label: "BESTSELLER", color: "bg-orange-500 text-white" },
    new: { icon: Zap, label: "NEW", color: "bg-green-500 text-white" },
    featured: { icon: Award, label: "FEATURED", color: "bg-blue-500 text-white" },
    verified: { icon: Award, label: "VERIFIED", color: "bg-green-500 text-white" }
  }

  // Truncate description to 2-3 lines (approximately 150 characters)
  const truncatedDescription = description
    ? description.length > 150
      ? description.substring(0, 150) + "..."
      : description
    : ""

  return (
    <div className="space-y-4">
      {/* Badges */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => {
            const config = badgeConfig[badge]
            const Icon = config.icon
            return (
              <span
                key={badge}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide ${config.color}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {config.label}
              </span>
            )
          })}
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
        {title}
      </h1>

      {/* Short Description (2-3 lines max) */}
      {truncatedDescription && (
        <p className="text-gray-600 leading-relaxed line-clamp-3">
          {truncatedDescription}
        </p>
      )}

      {/* Rating - Only show if reviews exist */}
      {reviewCount > 0 && (
        <button
          onClick={onClickReviews}
          className="flex items-center gap-3 hover:opacity-75 transition-opacity"
        >
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${star <= Math.floor(rating || 0)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                  }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {(rating || 0).toFixed(1)} ({reviewCount} reviews)
          </span>
        </button>
      )}
    </div>
  )
}
