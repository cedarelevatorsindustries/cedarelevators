"use client"

import { Star, Award, TrendingUp, Zap } from "lucide-react"

interface TitleBadgesSectionProps {
  title: string
  rating?: number
  reviewCount?: number
  badges?: Array<"bestseller" | "new" | "featured" | "verified">
}

export default function TitleBadgesSection({ 
  title, 
  rating = 4.0, 
  reviewCount = 120,
  badges = []
}: TitleBadgesSectionProps) {
  const badgeConfig = {
    bestseller: { icon: TrendingUp, label: "Bestseller", color: "bg-orange-100 text-orange-700" },
    new: { icon: Zap, label: "New Arrival", color: "bg-green-100 text-green-700" },
    featured: { icon: Award, label: "Featured", color: "bg-blue-100 text-blue-700" },
    verified: { icon: Award, label: "Verified", color: "bg-purple-100 text-purple-700" }
  }

  return (
    <div className="space-y-3">
      {/* Badges */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => {
            const config = badgeConfig[badge]
            const Icon = config.icon
            return (
              <span
                key={badge}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
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

      {/* Rating */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-5 h-5 ${
                star <= Math.floor(rating) 
                  ? "fill-yellow-400 text-yellow-400" 
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600">
          {rating.toFixed(1)} ({reviewCount} reviews)
        </span>
      </div>
    </div>
  )
}
