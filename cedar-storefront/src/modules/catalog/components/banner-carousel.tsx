"use client"

import { useState, useEffect } from "react"

interface Banner {
  id: string
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  bgGradient: string
}

const DEFAULT_BANNERS: Banner[] = [
  {
    id: "1",
    title: "Premium Elevator Components",
    subtitle: "ISO Certified Quality | Pan-India Delivery",
    ctaText: "Request Quote",
    ctaLink: "/contact",
    bgGradient: "from-orange-600 to-orange-800",
  },
  {
    id: "2",
    title: "New Arrivals This Month",
    subtitle: "Latest Technology | Best Prices",
    ctaText: "Explore Now",
    ctaLink: "/catalog?type=new-arrival",
    bgGradient: "from-blue-600 to-blue-800",
  },
  {
    id: "3",
    title: "Exclusive Business Deals",
    subtitle: "Special Pricing for B2B Customers",
    ctaText: "View Offers",
    ctaLink: "/catalog?type=exclusive-business",
    bgGradient: "from-purple-600 to-purple-800",
  },
]

export function BannerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % DEFAULT_BANNERS.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  const currentBanner = DEFAULT_BANNERS[currentIndex]

  return (
    <div className="mb-8 relative">
      <div className={`bg-gradient-to-r ${currentBanner.bgGradient} rounded-xl overflow-hidden transition-all duration-500`}>
        <div className="relative h-64 flex items-center justify-center">
          <div className="text-center text-white px-8">
            <h2 className="text-4xl font-bold mb-4">{currentBanner.title}</h2>
            <p className="text-xl mb-6">{currentBanner.subtitle}</p>
            <a
              href={currentBanner.ctaLink}
              className="inline-block bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              {currentBanner.ctaText}
            </a>
          </div>
        </div>
      </div>

      {/* Carousel Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {DEFAULT_BANNERS.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? "bg-white w-8" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
