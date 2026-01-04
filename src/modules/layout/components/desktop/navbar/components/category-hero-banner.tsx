"use client"

import Image from "next/image"

interface CategoryHeroBannerProps {
  isVisible: boolean
  category?: {
    name: string
    description?: string
    image?: string
  }
}

export function CategoryHeroBanner({ isVisible, category }: CategoryHeroBannerProps) {
  if (!isVisible || !category) return null

  return (
    <div 
      className="relative w-full bg-gradient-to-r from-blue-600 to-blue-800 overflow-hidden transition-all duration-300"
      style={{ 
        height: '150px',
        marginTop: '80px' // Account for absolute navbar
      }}
    >
      {/* Background Image */}
      {category.image && (
        <div className="absolute inset-0 opacity-20">
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="relative max-w-[1440px] mx-auto px-6 h-full flex flex-col justify-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-blue-100 text-sm max-w-2xl">
            {category.description}
          </p>
        )}
      </div>
    </div>
  )
}

