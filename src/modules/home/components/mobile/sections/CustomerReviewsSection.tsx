"use client"

import { useEffect, useState, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Testimonial {
  name: string
  company: string
  rating: number
  text: string
  image?: string
}

interface CustomerReviewsSectionProps {
  testimonials: Testimonial[]
}

export default function CustomerReviewsSection({ testimonials }: CustomerReviewsSectionProps) {
  // Don't render if no testimonials
  if (!testimonials || testimonials.length === 0) {
    return null
  }

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }, [testimonials.length])

  const goToPrevious = useCallback(() => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => 
      prev === 0 ? testimonials.length - 1 : prev - 1
    )
  }, [testimonials.length])

  const goToSlide = useCallback((index: number) => {
    setIsAutoPlaying(false)
    setCurrentIndex(index)
  }, [])

  // Auto-play carousel
  useEffect(() => {
    if (testimonials.length <= 1 || !isAutoPlaying) return

    const interval = setInterval(goToNext, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, testimonials.length, goToNext])

  const currentTestimonial = testimonials[currentIndex]

  return (
    <div className="py-8 bg-orange-50">
      <div className="px-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            What Our Customers Say
          </h3>
          <p className="text-gray-600 text-sm">
            Trusted by contractors and building professionals
          </p>
        </div>
        
        {/* Testimonial Card - Compact Mobile Style */}
        <div className="relative">
          <div className="bg-white rounded-xl shadow-lg p-4 max-w-md mx-auto">
            {/* Testimonial Text First */}
            <div className="relative mb-4">
              <svg
                className="absolute -top-2 left-0 w-6 h-6 text-orange-200 opacity-50"
                fill="currentColor"
                viewBox="0 0 32 32"
              >
                <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm16 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z" />
              </svg>
              <p className="text-gray-700 text-sm leading-relaxed relative z-10 italic">
                "{currentTestimonial.text}"
              </p>
            </div>

            {/* Profile Section - Horizontal Layout */}
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
              {/* Profile Image */}
              <img
                src={currentTestimonial.image || "/images/image.png"}
                alt={currentTestimonial.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-orange-100 flex-shrink-0"
              />
              
              {/* Name and Company */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-gray-900 truncate">
                  {currentTestimonial.name}
                </h4>
                <p className="text-gray-600 text-xs truncate">
                  {currentTestimonial.company}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          {testimonials.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 bg-white hover:bg-orange-50 text-gray-700 rounded-full p-2 shadow-lg transition-all hover:scale-110"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 bg-white hover:bg-orange-50 text-gray-700 rounded-full p-2 shadow-lg transition-all hover:scale-110"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Dots Indicator */}
        {testimonials.length > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-orange-600'
                    : 'w-2 bg-orange-300 hover:bg-orange-400'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
