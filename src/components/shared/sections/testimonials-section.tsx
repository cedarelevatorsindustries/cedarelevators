"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Testimonial {
    name: string
    company: string
    rating: number
    text: string
    image?: string
}

interface TestimonialsSectionProps {
    testimonials: Testimonial[]
    variant?: 'desktop' | 'mobile'
}

/**
 * Unified Testimonials Section
 * Responsive component that handles both mobile and desktop layouts
 */
export function TestimonialsSection({
    testimonials,
    variant = 'desktop'
}: TestimonialsSectionProps) {
    const isMobile = variant === 'mobile'
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)

    // Don't render if no testimonials
    if (!testimonials || testimonials.length === 0) {
        return null
    }

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
        <section className={cn(
            "bg-orange-50",
            isMobile ? "py-8" : "py-20"
        )}>
            <div className={cn(
                "mx-auto",
                isMobile ? "px-4" : "max-w-6xl px-6"
            )}>
                {/* Header */}
                <div className={cn("text-center", isMobile ? "mb-6" : "mb-12")}>
                    <h2 className={cn(
                        "font-bold text-gray-900",
                        isMobile ? "text-xl mb-2" : "text-3xl mb-3"
                    )}>
                        What Our Customers Say
                    </h2>
                    <p className={cn(
                        "text-gray-600",
                        isMobile ? "text-sm" : "text-lg"
                    )}>
                        Trusted by contractors and building professionals{!isMobile && ' nationwide'}
                    </p>
                </div>

                {/* Testimonial Card */}
                <div className="relative">
                    {isMobile ? (
                        <MobileTestimonialCard testimonial={currentTestimonial} />
                    ) : (
                        <DesktopTestimonialCard testimonial={currentTestimonial} />
                    )}

                    {/* Navigation Arrows */}
                    {testimonials.length > 1 && (
                        <>
                            <button
                                onClick={goToPrevious}
                                className={cn(
                                    "absolute top-1/2 -translate-y-1/2 bg-white hover:bg-orange-50 text-gray-700 rounded-full shadow-lg transition-all hover:scale-110",
                                    isMobile
                                        ? "left-0 -translate-x-2 p-2"
                                        : "left-0 -translate-x-4 md:-translate-x-12 p-3"
                                )}
                                aria-label="Previous testimonial"
                            >
                                <ChevronLeft className={isMobile ? "w-5 h-5" : "w-6 h-6"} />
                            </button>
                            <button
                                onClick={() => {
                                    setIsAutoPlaying(false)
                                    goToNext()
                                }}
                                className={cn(
                                    "absolute top-1/2 -translate-y-1/2 bg-white hover:bg-orange-50 text-gray-700 rounded-full shadow-lg transition-all hover:scale-110",
                                    isMobile
                                        ? "right-0 translate-x-2 p-2"
                                        : "right-0 translate-x-4 md:translate-x-12 p-3"
                                )}
                                aria-label="Next testimonial"
                            >
                                <ChevronRight className={isMobile ? "w-5 h-5" : "w-6 h-6"} />
                            </button>
                        </>
                    )}
                </div>

                {/* Dots Indicator */}
                {testimonials.length > 1 && (
                    <div className={cn("flex justify-center gap-2", isMobile ? "mt-6" : "mt-8")}>
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`h-2 rounded-full transition-all ${index === currentIndex
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

/** Desktop Testimonial Card */
function DesktopTestimonialCard({ testimonial }: { testimonial: Testimonial }) {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-12 md:p-16 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                    <img
                        src={testimonial.image || "/images/image.png"}
                        alt={testimonial.name}
                        className="w-32 h-32 rounded-full object-cover border-4 border-orange-100"
                    />
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">
                            {testimonial.name}
                        </h3>
                        <p className="text-gray-600 text-base">
                            {testimonial.company}
                        </p>
                    </div>

                    <div className="relative">
                        <QuoteIcon className="absolute -top-4 -left-2 w-12 h-12 text-orange-200 opacity-50" />
                        <p className="text-gray-700 text-lg leading-relaxed relative z-10 italic">
                            "{testimonial.text}"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

/** Mobile Testimonial Card */
function MobileTestimonialCard({ testimonial }: { testimonial: Testimonial }) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-4 max-w-md mx-auto">
            {/* Testimonial Text First */}
            <div className="relative mb-4">
                <QuoteIcon className="absolute -top-2 left-0 w-6 h-6 text-orange-200 opacity-50" />
                <p className="text-gray-700 text-sm leading-relaxed relative z-10 italic">
                    "{testimonial.text}"
                </p>
            </div>

            {/* Profile Section */}
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <img
                    src={testimonial.image || "/images/image.png"}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-orange-100 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate">
                        {testimonial.name}
                    </h4>
                    <p className="text-gray-600 text-xs truncate">
                        {testimonial.company}
                    </p>
                </div>
            </div>
        </div>
    )
}

/** Quote SVG Icon */
function QuoteIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="currentColor"
            viewBox="0 0 32 32"
        >
            <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm16 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z" />
        </svg>
    )
}

export default TestimonialsSection

