"use client"

import { useState, useEffect } from "react"
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
      console.log("Searching for:", inputValue)
    }
  }

  return (
    <div className="relative w-full h-[60vh] overflow-hidden">
      {/* Mobile Background Image - Same as desktop but cropped/zoomed for 9:16 */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 ease-out"
        style={{
          backgroundImage: 'url("/images/hero/desktop hero.png")',
          backgroundPosition: 'center 30%', // Adjust crop position for mobile
          transform: isLoaded ? 'scale(1.1)' : 'scale(1.2)' // Zoom for 9:16 mobile ratio
        }}
        role="img"
        aria-label="Cedar Elevators premium lift components showcase - mobile view"
      />

      {/* Mobile Dark Gradient Overlay */}
      <div
        className="absolute inset-0 z-5"
        style={{
          background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0.7) 100%)'
        }}
        aria-hidden="true"
      />

      {/* Mobile Navbar Visibility Gradient Overlay */}
      <div
        className="absolute top-0 left-0 right-0 h-32 z-5"
        style={{
          background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.4) 50%, transparent 100%)'
        }}
        aria-hidden="true"
      />

      {/* Mobile Floating Search Bar with Typing Animation */}
      <div className="absolute top-20 sm:top-24 left-4 right-4 z-20">
        <div className={`relative transition-all duration-800 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="search"
              value={inputValue}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={isFocused || inputValue ? "Search..." : currentPlaceholder}
              className="w-full px-4 py-3 sm:py-4 pl-12 bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 shadow-xl text-gray-800 placeholder-gray-500 text-sm"
              autoComplete="off"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Typing cursor effect */}
            {!isFocused && !inputValue && (
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 animate-pulse pointer-events-none">
                |
              </span>
            )}
          </form>
        </div>
      </div>

      {/* Mobile Content - Centered with safe spacing from search bar */}
      <div className="relative z-10 flex flex-col justify-center h-full px-4 pt-32 pb-8">
        {/* Mobile Primary Text */}
        <div className="mb-3 sm:mb-4">
          <h1
            className={`font-space-grotesk text-white text-xl sm:text-2xl font-black leading-tight uppercase transition-all duration-800 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            style={{
              textShadow: '2px 4px 12px rgba(0, 0, 0, 0.8)',
              letterSpacing: '0.05em',
              fontOpticalSizing: 'auto'
            }}
          >
            Premium Lift Components for Every Project
          </h1>
        </div>

        {/* Mobile Secondary Text */}
        <div className="mb-6 sm:mb-8">
          <p
            className={`font-space-grotesk text-white/90 text-xs sm:text-sm font-light transition-all duration-800 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            style={{
              textShadow: '1px 2px 8px rgba(0, 0, 0, 0.7)',
              letterSpacing: '0.1em',
              fontOpticalSizing: 'auto'
            }}
          >
            engineering excellence in vertical transportation
          </p>
        </div>

        {/* Mobile CTA Buttons */}
        <div className={`flex flex-col gap-3 transition-all duration-800 delay-900 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <LocalizedClientLink href="/quotes/new">
            <button
              className="w-full bg-orange-500 hover:bg-orange-600 focus:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-300 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg font-space-grotesk"
              aria-label="Get a quote for premium lift components"
            >
              Get a Quote
            </button>
          </LocalizedClientLink>

          <LocalizedClientLink href="/catalog">
            <button
              className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 focus:bg-white/30 focus:outline-none focus:ring-4 focus:ring-white/50 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg font-space-grotesk"
              aria-label="Browse our premium lift components catalog"
            >
              Browse Products
            </button>
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}

export default HeroSection

