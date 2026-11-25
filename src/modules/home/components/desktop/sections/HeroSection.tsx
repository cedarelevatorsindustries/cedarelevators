"use client"

import { useState, useEffect } from "react"
import { logger } from "@/lib/services/logger"
import { Cpu, DoorOpen, Shield, Wrench, Zap, Settings, Package, ArrowRight } from "lucide-react"
import LocalizedClientLink from "@components/ui/localized-client-link"

const HeroSection = () => {
  const [isLoaded, setIsLoaded] = useState(false)

  // Mobile search animation states
  const [currentPlaceholder, setCurrentPlaceholder] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [charIndex, setCharIndex] = useState(0)
  const [isFocused, setIsFocused] = useState(false)
  const [inputValue, setInputValue] = useState("")

  // Search placeholders for mobile
  const searchPlaceholders = [
    "Search door operators...",
    "Search control panels...",
    "Search safety systems...",
    "Search by SKU...",
    "Search by category...",
    "Search ARD systems...",
    "Search limit switches...",
    "Search motors..."
  ]

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Mobile search typing animation
  useEffect(() => {
    if (isFocused || inputValue) return // Don't animate when focused or has value

    const currentText = searchPlaceholders[currentIndex]

    if (isTyping) {
      if (charIndex < currentText.length) {
        const timeout = setTimeout(() => {
          setCurrentPlaceholder(currentText.slice(0, charIndex + 1))
          setCharIndex(charIndex + 1)
        }, 100) // Typing speed
        return () => clearTimeout(timeout)
      } else {
        // Finished typing, wait then start erasing
        const timeout = setTimeout(() => {
          setIsTyping(false)
        }, 2000) // Wait time before erasing
        return () => clearTimeout(timeout)
      }
    } else {
      if (charIndex > 0) {
        const timeout = setTimeout(() => {
          setCurrentPlaceholder(currentText.slice(0, charIndex - 1))
          setCharIndex(charIndex - 1)
        }, 50) // Erasing speed (faster than typing)
        return () => clearTimeout(timeout)
      } else {
        // Finished erasing, move to next placeholder
        const timeout = setTimeout(() => {
          setCurrentIndex((currentIndex + 1) % searchPlaceholders.length)
          setIsTyping(true)
        }, 500) // Wait time before next text
        return () => clearTimeout(timeout)
      }
    }
  }, [currentIndex, charIndex, isTyping, isFocused, inputValue, searchPlaceholders])

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    setIsFocused(false)
    if (!inputValue) {
      // Reset animation when unfocused and empty
      setCurrentIndex(0)
      setCharIndex(0)
      setIsTyping(true)
      setCurrentPlaceholder("")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      // Handle search submission
      logger.info("Search submitted", { query: inputValue })
    }
  }

  // Quick access categories for mobile
  const quickCategories = [
    { id: "control-panels", name: "Control Panels", icon: Cpu, color: "bg-blue-50 text-blue-600" },
    { id: "door-operators", name: "Door Operators", icon: DoorOpen, color: "bg-green-50 text-green-600" },
    { id: "safety-systems", name: "Safety Systems", icon: Shield, color: "bg-red-50 text-red-600" },
    { id: "guide-shoes", name: "Guide Shoes", icon: Wrench, color: "bg-orange-50 text-orange-600" },
    { id: "ard-systems", name: "ARD Systems", icon: Zap, color: "bg-purple-50 text-purple-600" },
    { id: "maintenance", name: "Maintenance", icon: Settings, color: "bg-gray-50 text-gray-600" },
    { id: "accessories", name: "Accessories", icon: Package, color: "bg-indigo-50 text-indigo-600" },
  ]

  return (
    <>
      {/* Desktop Hero - Full Screen */}
      <div className="relative w-full h-screen overflow-hidden">
        {/* Desktop Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 ease-out"
          style={{
            backgroundImage: 'url("/images/hero/desktop-hero.webp?v=20261121")',
            transform: isLoaded ? 'scale(1)' : 'scale(1.1)'
          }}
          role="img"
          aria-label="Cedar Elevators premium lift components showcase - precision elevator machinery"
        />

        {/* Dark Gradient Overlay for Text Readability - Enhanced for WCAG AA compliance */}
        <div
          className="absolute inset-0 z-5"
          style={{
            background: 'linear-gradient(to right, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.5) 40%, rgba(0, 0, 0, 0.3) 70%, transparent 100%)'
          }}
          aria-hidden="true"
        />

        {/* Dark Gradient Overlay for Navbar Visibility */}
        <div
          className="absolute top-0 left-0 right-0 h-32 z-5"
          style={{
            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.4) 50%, transparent 100%)'
          }}
          aria-hidden="true"
        />

        {/* Desktop Content Container - Center Left Aligned */}
        <div className="relative z-10 flex items-center justify-start h-full px-4 md:px-8">
          <div className="w-full max-w-7xl mx-auto">
            {/* Text Content - Center Left Positioned */}
            <div
              className="max-w-2xl ml-[2%]"
            >
              {/* Desktop Main Headline */}
              <h1
                className={`type-hero text-white mb-3 transition-all duration-800 delay-300 max-w-lg ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                style={{
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)',
                }}
              >
                Premium Lift Components for Every Project
              </h1>

              {/* Desktop Subheadline/Tagline */}
              <p
                className={`type-body-sm text-white/80 mb-6 transition-all duration-800 delay-500 whitespace-nowrap ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                style={{
                  textShadow: '0 1px 6px rgba(0, 0, 0, 0.5)',
                }}
              >
                engineering excellence in vertical transportation
              </p>

              {/* Desktop CTA Buttons */}
              <div className={`flex flex-col sm:flex-row gap-4 transition-all duration-800 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}>
                {/* Primary CTA */}
                <LocalizedClientLink href="/quotes/new">
                  <button
                    className="type-button group relative overflow-hidden bg-orange-500 hover:bg-orange-600 focus:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-300 text-white px-6 py-2.5 rounded-lg transition-all duration-300 transform hover:scale-105 focus:scale-105 shadow-md hover:shadow-xl focus:shadow-xl"
                    style={{
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
                    }}
                    aria-label="Get a quote for premium lift components"
                    type="button"
                  >
                    <span className="relative z-10">Get a Quote</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-500 transform scale-x-0 group-hover:scale-x-100 group-focus:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </button>
                </LocalizedClientLink>

                {/* Secondary CTA */}
                <LocalizedClientLink href="/products">
                  <button
                    className="type-button group relative overflow-hidden bg-transparent border border-white/70 text-white hover:bg-white/15 focus:bg-white/15 focus:outline-none focus:ring-4 focus:ring-white/40 px-6 py-2.5 rounded-lg transition-all duration-300 transform hover:scale-105 focus:scale-105 shadow-md hover:shadow-xl focus:shadow-xl"
                    aria-label="Browse our premium lift components and products catalog"
                    type="button"
                  >
                    <span className="relative z-10">Browse Products</span>
                    <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 group-focus:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </button>
                </LocalizedClientLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default HeroSection

