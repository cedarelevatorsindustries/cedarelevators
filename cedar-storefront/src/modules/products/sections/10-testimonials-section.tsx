"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react"

interface Testimonial {
  id: string
  name: string
  role: string
  company: string
  rating: number
  comment: string
  date: string
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[]
}

export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (testimonials.length === 0) return null

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const current = testimonials[currentIndex]

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 md:p-6 lg:p-8">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Customer Testimonials</h2>
      
      <div className="relative">
        {/* Testimonial Card */}
        <div className="bg-white rounded-xl p-4 md:p-6 lg:p-8 shadow-sm">
          <Quote className="w-8 h-8 md:w-10 md:h-10 text-blue-600 mb-3 md:mb-4" />
          
          {/* Rating */}
          <div className="flex items-center gap-1 mb-3 md:mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 md:w-5 md:h-5 ${
                  star <= current.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>

          {/* Comment */}
          <p className="text-gray-700 text-sm md:text-lg leading-relaxed mb-4 md:mb-6 italic">
            "{current.comment}"
          </p>

          {/* Author - Desktop Layout */}
          <div className="hidden md:block">
            <p className="font-semibold text-gray-900">{current.name || "Anonymous"}</p>
            <p className="text-sm text-gray-600">
              {current.role || "Customer"} at {current.company || "N/A"}
            </p>
            <p className="text-xs text-gray-500 mt-1">{current.date || ""}</p>
          </div>

          {/* Author - Mobile Layout (Compact with Avatar) */}
          <div className="md:hidden flex items-center gap-3">
            {/* Avatar Placeholder */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {current.name?.charAt(0) || "?"}
            </div>
            
            {/* Name and Company */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{current.name || "Anonymous"}</p>
              <p className="text-xs text-gray-600 truncate">{current.company || "N/A"}</p>
              <p className="text-xs text-gray-500 mt-0.5">{current.date || ""}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        {testimonials.length > 1 && (
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center hover:border-blue-600 hover:bg-blue-50 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? "bg-blue-600 w-8"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-10 h-10 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center hover:border-blue-600 hover:bg-blue-50 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
