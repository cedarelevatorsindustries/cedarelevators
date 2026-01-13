"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ProductCategory } from "@/lib/types/domain"
import { Search, X, Loader2 } from "lucide-react"
import Image from "next/image"
import { useSearch } from "@/lib/hooks/useSearch"
import { cn } from "@/lib/utils"

type HeroLiteProps = {
  userType: "individual" | "business" | "verified"
  categories?: ProductCategory[]
  popularSearchTerms?: string[]
}

const searchPlaceholders = [
  "Search elevator motors...",
  "Search control panels...",
  "Search door operators...",
  "Search safety sensors...",
  "Search guide rails...",
  "Search ARD systems...",
  "Search limit switches..."
]

export default function HeroLite({ userType, categories = [], popularSearchTerms = [] }: HeroLiteProps) {
  const router = useRouter()
  const { query, setQuery, suggestions, isLoading, clearSuggestions, clearQuery } = useSearch()

  const [activeTab, setActiveTab] = useState<"products" | "categories" | "business-hub">("products")
  const [currentPlaceholder, setCurrentPlaceholder] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [charIndex, setCharIndex] = useState(0)
  const [isFocused, setIsFocused] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Define tabs based on user type (verified treated same as business)
  const tabs = (userType === "business" || userType === "verified")
    ? [
      { id: "products" as const, label: "Products" },
      { id: "categories" as const, label: "Categories" },
      { id: "business-hub" as const, label: "Business Hub" },
    ]
    : [
      { id: "products" as const, label: "Products" },
      { id: "categories" as const, label: "Categories" },
    ]

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

  const handleTabClick = (tabId: "products" | "categories" | "business-hub") => {
    setActiveTab(tabId)
    // Dispatch custom event to notify parent component
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("heroTabChange", { detail: { tab: tabId } }))
    }
  }

  const saveRecentSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const handleSearch = (e?: React.FormEvent, searchQuery?: string) => {
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
          handleSearch()
        }
        break
      case 'Escape':
        setIsFocused(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
    setSelectedIndex(-1)
  }

  const handleClear = () => {
    clearQuery()
    inputRef.current?.focus()
  }

  // Get background color based on active tab
  const getBgColor = () => {
    if (activeTab === "categories") return "from-[#2074bc] via-[#2074bc] to-[#1a5fa0]"
    if (activeTab === "business-hub") return "from-[#0D4A3F] via-[#0D4A3F] to-[#0D4A3F]"
    return "from-orange-500 via-orange-500 to-orange-400"
  }

  const showDropdown = isFocused && (suggestions.length > 0 || (recentSearches.length > 0 && !query))

  return (
    <div className={`relative bg-gradient-to-b ${getBgColor()} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="flex justify-center items-center mb-6 mt-4">
          <div className="inline-flex bg-transparent gap-16">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`px-4 py-2 text-xl font-bold transition-all text-center relative ${activeTab === tab.id
                  ? "text-white"
                  : "text-white/70 hover:text-white/90"
                  }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar with Autocomplete */}
        <div className="max-w-5xl mx-auto mb-5">
          <div ref={containerRef} className="relative bg-white rounded-xl shadow-lg p-2">
            <form onSubmit={handleSearch} className="relative">
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={handleFocus}
                onKeyDown={handleKeyDown}
                placeholder={isFocused || query ? "Search..." : currentPlaceholder}
                className="w-full h-12 px-4 pr-32 text-base bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-0 placeholder:text-gray-500"
                autoComplete="off"
              />

              {/* Clear button */}
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-28 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}

              {/* Loading indicator */}
              {isLoading && (
                <Loader2
                  className="absolute right-28 top-1/2 -translate-y-1/2 text-gray-400 animate-spin"
                  size={18}
                />
              )}

              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Search size={18} />
                <span className="font-medium">Search</span>
              </button>
            </form>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-[400px] overflow-y-auto z-50">
                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="p-2">
                    <p className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Products
                    </p>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={suggestion.id}
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
                        onClick={() => handleSearch()}
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
                          handleSearch(undefined, term)
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
                      onClick={() => handleSearch()}
                      className="mt-2 text-sm text-blue-600 hover:underline"
                    >
                      Search all products
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Frequently Searched - Show only if there are search terms */}
        {popularSearchTerms.length > 0 && (
          <div className="max-w-5xl mx-auto">
            <div className="flex items-start gap-3 flex-wrap">
              <span className="text-white font-normal text-sm whitespace-nowrap">
                Frequently searched:
              </span>
              <div className="flex flex-wrap gap-3">
                {popularSearchTerms.map((item) => (
                  <a
                    key={item}
                    href={`/catalog?q=${encodeURIComponent(item)}`}
                    className="text-white/95 hover:text-white text-sm underline hover:no-underline transition-all"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
