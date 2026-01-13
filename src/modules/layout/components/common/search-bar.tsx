"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, X, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useSearch } from "@/lib/hooks/useSearch"
import { cn } from "@/lib/utils"

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
  const { query, setQuery, suggestions, isLoading, clearSuggestions, clearQuery } = useSearch()

  const [currentPlaceholder, setCurrentPlaceholder] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [charIndex, setCharIndex] = useState(0)
  const [isFocused, setIsFocused] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load recent searches
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recentSearches')
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved).slice(0, 5))
        } catch {
          setRecentSearches([])
        }
      }
    }
  }, [])

  // Animated placeholder effect
  useEffect(() => {
    if (isFocused || query) return

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
  }, [currentIndex, charIndex, isTyping, isFocused, query])

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const saveRecentSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const handleFocus = () => {
    setIsFocused(true)
    setSelectedIndex(-1)
  }

  const handleBlur = () => {
    // Don't blur immediately to allow clicking dropdown items
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setIsFocused(false)
      }
    }, 150)
  }

  const handleSubmit = (e?: React.FormEvent, searchQuery?: string) => {
    e?.preventDefault()
    const finalQuery = searchQuery || query
    if (finalQuery.trim()) {
      saveRecentSearch(finalQuery.trim())
      setIsFocused(false)
      clearSuggestions()
      router.push(`/catalog?q=${encodeURIComponent(finalQuery.trim())}`)
    }
  }

  const handleSuggestionClick = (slug: string, name: string) => {
    saveRecentSearch(name)
    setIsFocused(false)
    clearSuggestions()
    router.push(`/products/${slug}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const itemCount = suggestions.length

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev < itemCount - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : itemCount - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex].slug, suggestions[selectedIndex].name)
        } else {
          handleSubmit()
        }
        break
      case 'Escape':
        setIsFocused(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleClear = () => {
    clearQuery()
    inputRef.current?.focus()
  }

  const showDropdown = isFocused && (suggestions.length > 0 || (recentSearches.length > 0 && !query))

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative" role="search">
        <label htmlFor="search-input" className="sr-only">
          Search for products, SKUs, or categories
        </label>
        <input
          ref={inputRef}
          id="search-input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={isFocused || query ? "Search..." : currentPlaceholder}
          className={`w-full px-4 py-2 pl-10 pr-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all duration-200 shadow-sm ${className}`}
          aria-label="Search for products, SKUs, or categories"
          autoComplete="off"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
        />
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
          size={18}
          aria-hidden="true"
        />

        {isLoading ? (
          <Loader2
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin"
            size={18}
            aria-hidden="true"
          />
        ) : query ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        ) : !isFocused && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-pulse pointer-events-none" aria-hidden="true">
            |
          </span>
        )}
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div
          role="listbox"
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-[400px] overflow-y-auto"
        >
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <p className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Products
              </p>
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  role="option"
                  aria-selected={selectedIndex === index}
                  onClick={() => handleSuggestionClick(suggestion.slug, suggestion.name)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                    selectedIndex === index ? "bg-blue-50" : "hover:bg-gray-50"
                  )}
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {suggestion.thumbnail_url ? (
                      <Image
                        src={suggestion.thumbnail_url}
                        alt={suggestion.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Search size={16} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {suggestion.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {suggestion.sku && <span>SKU: {suggestion.sku} • </span>}
                      {suggestion.category}
                    </p>
                  </div>
                </button>
              ))}

              {query && (
                <button
                  onClick={() => handleSubmit()}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 mt-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  View all results for "{query}"
                </button>
              )}
            </div>
          )}

          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <p className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Recent Searches
              </p>
              {recentSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setQuery(term)
                    handleSubmit(undefined, term)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-50 transition-colors"
                >
                  <Search size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-700">{term}</span>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {query && suggestions.length === 0 && !isLoading && (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500">No products found for "{query}"</p>
              <button
                onClick={() => handleSubmit()}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                Search all products
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
