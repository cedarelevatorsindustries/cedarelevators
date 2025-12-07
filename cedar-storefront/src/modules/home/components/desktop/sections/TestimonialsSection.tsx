"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Testimonial {
  name: string
  company: string
  rating: number
  text: string
  image: string
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[]
}

const TestimonialsSection = ({ testimonials }: TestimonialsSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Only show testimonials from product metadata, no defaults
  if (!testimonials || testimonials.length === 0) {
    return null
  }

  const displayTestimonials = testimonials

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || displayTestimonials.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayTestimonials.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying, displayTestimonials.length])

  const goToPrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => 
      prev === 0 ? displayTestimonials.length - 1 : prev - 1
    )
  }

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % displayTestimonials.length)
  }

  const currentTestimonial = displayTestimonials[currentIndex]

  return (
    <section className="bg-orange-50 py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 text-lg">
            Trusted by contractors and building professionals nationwide
          </p>
        </div>

        <div className="relative">
          {/* Main Testimonial Card */}
          <div className="bg-white rounded-2xl shadow-lg p-12 md:p-16 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <img
                  src={currentTestimonial.image || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop"}
                  alt={currentTestimonial.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-orange-100"
                />
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                {/* Name and Company */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {currentTestimonial.name}
                  </h3>
                  <p className="text-gray-600 text-base">
                    {currentTestimonial.company}
                  </p>
                </div>

                {/* Testimonial Text */}
                <div className="relative">
                  <svg
                    className="absolute -top-4 -left-2 w-12 h-12 text-orange-200 opacity-50"
                    fill="currentColor"
                    viewBox="0 0 32 32"
                  >
                    <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm16 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z" />
                  </svg>
                  <p className="text-gray-700 text-lg leading-relaxed relative z-10 italic">
                    "{currentTestimonial.text}"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          {displayTestimonials.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-white hover:bg-orange-50 text-gray-700 rounded-full p-3 shadow-lg transition-all hover:scale-110"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-white hover:bg-orange-50 text-gray-700 rounded-full p-3 shadow-lg transition-all hover:scale-110"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Dots Indicator */}
        {displayTestimonials.length > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {displayTestimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAutoPlaying(false)
                  setCurrentIndex(index)
                }}
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
    </section>
  )
}

export default TestimonialsSection
