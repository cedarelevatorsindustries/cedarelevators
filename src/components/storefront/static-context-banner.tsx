"use client"

interface StaticContextBannerProps {
  imageUrl?: string | null
  title: string
  description?: string | null
  overlayStyle?: 'dark' | 'light' | 'gradient'
  textPosition?: 'left' | 'center' | 'right'
  height?: 'sm' | 'md' | 'lg'
}

export function StaticContextBanner({
  imageUrl,
  title,
  description,
  overlayStyle = 'gradient',
  textPosition = 'left',
  height = 'md'
}: StaticContextBannerProps) {
  // If no banner image, show simple header
  if (!imageUrl) {
    return (
      <div className="bg-gradient-to-r from-gray-100 to-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
            {title}
          </h1>
          {description && (
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl">
              {description}
            </p>
          )}
        </div>
      </div>
    )
  }

  // Height classes
  const heightClasses = {
    sm: 'h-48 md:h-56',
    md: 'h-64 md:h-80',
    lg: 'h-80 md:h-96'
  }

  // Overlay classes
  const overlayClasses = {
    dark: 'bg-black/60',
    light: 'bg-white/60',
    gradient: 'bg-gradient-to-r from-black/70 via-black/40 to-transparent'
  }

  // Text position classes
  const positionClasses = {
    left: 'justify-start text-left',
    center: 'justify-center text-center',
    right: 'justify-end text-right'
  }

  // Text color based on overlay
  const textColorClasses = {
    dark: 'text-white',
    light: 'text-gray-900',
    gradient: 'text-white'
  }

  return (
    <div className={`relative w-full overflow-hidden ${heightClasses[height]}`}>
      {/* Background Image */}
      <img
        src={imageUrl}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Overlay */}
      <div className={`absolute inset-0 ${overlayClasses[overlayStyle]}`} />

      {/* Content */}
      <div className={`relative h-full flex items-center ${positionClasses[textPosition]}`}>
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl">
            <h1
              className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-3 ${textColorClasses[overlayStyle]}`}
            >
              {title}
            </h1>
            {description && (
              <p
                className={`text-lg md:text-xl max-w-2xl ${textColorClasses[overlayStyle]} opacity-90`}
              >
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
