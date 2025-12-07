"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, Loader2 } from "lucide-react"
import Image from "next/image"
import LocalizedClientLink from "@components/ui/localized-client-link"

const searchPlaceholders = [
  "Search by product...",
  "Search by SKU...",
  "Search by category...",
  "Search control panels...",
  "Search door operators...",
  "Search safety systems...",
  "Search ARD systems...",
  "Search limit switches..."
]

interface SearchBarProps {
  className?: string
}

export function SearchBar({ className = "" }: SearchBarProps) {
  const router = useRouter()
  const [currentPlaceholder, setCurrentPlaceholder] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [charIndex, setCharIndex] = useState(0)
  const [isFocused, setIsFocused] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Animated placeholder effect
  useEffect(() => {
    if (isFocused || inputValue) return

    const currentText = searchPlaceholders[currentIndex]
    
    if (isTyping) {
      if (charIndex < currentText.length) {
        const timeout = setTimeout(() => {
          setCurrentPlaceholder(currentText.slice(0, charIndex + 1))
          setCharIndex(charIndex + 1)
        }, 100)
        return () => clearTimeout(timeout)
      } else {
        const timeout = setTimeout(() => {
          setIsTyping(false)
        }, 2000)
        return () => clearTimeout(timeout)
      }
    } else {
      if (charIndex > 0) {
        const timeout = setTimeout(() => {
          setCurrentPlaceholder(currentText.slice(0, charIndex - 1))
          setCharIndex(charIndex - 1)
        }, 50)
        return () => clearTimeout(timeout)
      } else {
        const timeout = setTimeout(() => {
          setCurrentIndex((currentIndex + 1) % searchPlaceholders.length)
          setIsTyping(true)
        }, 500)
        return () => clearTimeout(timeout)
      }
    }
  }, [currentIndex, charIndex, isTyping, isFocused, inputValue])

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    setIsFocused(false)
    if (!inputValue) {
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
      router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative" role="search">
      <label htmlFor="search-input" className="sr-only">
        Search for products, SKUs, or categories
      </label>
      <input
        ref={inputRef}
        id="search-input"
        type="search"
        value={inputValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={isFocused || inputValue ? "Search..." : currentPlaceholder}
        className={`w-full px-4 py-2 pl-10 pr-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all duration-200 shadow-sm ${className}`}
        aria-label="Search for products, SKUs, or categories"
        autoComplete="off"
      />
      <Search 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" 
        size={18} 
        aria-hidden="true" 
      />
      
      {isLoading && (
        <Loader2 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" 
          size={18} 
          aria-hidden="true" 
        />
      )}
      
      {!isFocused && !inputValue && !isLoading && (
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-pulse pointer-events-none" aria-hidden="true">
          |
        </span>
      )}
    </form>
  )
}
