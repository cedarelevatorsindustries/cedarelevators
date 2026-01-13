'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearch } from '@/lib/hooks/useSearch'
import { cn } from '@/lib/utils'

interface SearchAutocompleteProps {
    placeholder?: string
    className?: string
    inputClassName?: string
    variant?: 'navbar' | 'hero' | 'mobile'
    onSearch?: (query: string) => void
    showRecentSearches?: boolean
    animatedPlaceholder?: boolean
}

const animatedPlaceholders = [
    "Search by product...",
    "Search by SKU...",
    "Search control panels...",
    "Search door operators...",
    "Search safety systems...",
    "Search ARD systems...",
    "Search limit switches..."
]

export function SearchAutocomplete({
    placeholder = "Search products...",
    className = "",
    inputClassName = "",
    variant = 'navbar',
    onSearch,
    showRecentSearches = true,
    animatedPlaceholder = true
}: SearchAutocompleteProps) {
    const router = useRouter()
    const { query, setQuery, suggestions, isLoading, clearSuggestions, clearQuery } = useSearch()

    const [isFocused, setIsFocused] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const [recentSearches, setRecentSearches] = useState<string[]>([])

    // Animated placeholder state
    const [currentPlaceholder, setCurrentPlaceholder] = useState("")
    const [placeholderIndex, setPlaceholderIndex] = useState(0)
    const [charIndex, setCharIndex] = useState(0)
    const [isTyping, setIsTyping] = useState(true)

    const inputRef = useRef<HTMLInputElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // Load recent searches from localStorage
    useEffect(() => {
        if (showRecentSearches && typeof window !== 'undefined') {
            const saved = localStorage.getItem('recentSearches')
            if (saved) {
                try {
                    setRecentSearches(JSON.parse(saved).slice(0, 5))
                } catch {
                    setRecentSearches([])
                }
            }
        }
    }, [showRecentSearches])

    // Animated placeholder effect
    useEffect(() => {
        if (!animatedPlaceholder || isFocused || query) return

        const currentText = animatedPlaceholders[placeholderIndex]

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
                    setPlaceholderIndex((placeholderIndex + 1) % animatedPlaceholders.length)
                    setIsTyping(true)
                }, 500)
                return () => clearTimeout(timeout)
            }
        }
    }, [placeholderIndex, charIndex, isTyping, isFocused, query, animatedPlaceholder])

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

    const saveRecentSearch = useCallback((searchQuery: string) => {
        if (!showRecentSearches || !searchQuery.trim()) return

        const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5)
        setRecentSearches(updated)
        localStorage.setItem('recentSearches', JSON.stringify(updated))
    }, [recentSearches, showRecentSearches])

    const handleSubmit = useCallback((e?: React.FormEvent, searchQuery?: string) => {
        e?.preventDefault()
        const finalQuery = searchQuery || query

        if (finalQuery.trim()) {
            saveRecentSearch(finalQuery.trim())
            setIsFocused(false)
            clearSuggestions()

            if (onSearch) {
                onSearch(finalQuery.trim())
            } else {
                router.push(`/catalog?q=${encodeURIComponent(finalQuery.trim())}`)
            }
        }
    }, [query, saveRecentSearch, clearSuggestions, onSearch, router])

    const handleSuggestionClick = useCallback((slug: string, name: string) => {
        saveRecentSearch(name)
        setIsFocused(false)
        clearSuggestions()
        router.push(`/products/${slug}`)
    }, [saveRecentSearch, clearSuggestions, router])

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
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
    }, [suggestions, selectedIndex, handleSuggestionClick, handleSubmit])

    const handleFocus = () => {
        setIsFocused(true)
        setSelectedIndex(-1)
    }

    const handleClear = () => {
        clearQuery()
        inputRef.current?.focus()
    }

    const showDropdown = isFocused && (suggestions.length > 0 || (showRecentSearches && recentSearches.length > 0 && !query))

    const getPlaceholderText = () => {
        if (isFocused || query) return placeholder
        if (animatedPlaceholder) return currentPlaceholder || animatedPlaceholders[0]
        return placeholder
    }

    return (
        <div ref={containerRef} className={cn("relative w-full", className)}>
            <form onSubmit={handleSubmit} className="relative" role="search">
                <label htmlFor="search-autocomplete" className="sr-only">
                    Search products
                </label>

                <input
                    ref={inputRef}
                    id="search-autocomplete"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={handleFocus}
                    onKeyDown={handleKeyDown}
                    placeholder={getPlaceholderText()}
                    className={cn(
                        "w-full bg-white border border-gray-300 rounded-lg transition-all duration-200",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                        "pl-10 pr-10",
                        variant === 'hero' ? "h-12 text-base" : "py-2 text-sm",
                        inputClassName
                    )}
                    autoComplete="off"
                    aria-label="Search products"
                    aria-expanded={showDropdown}
                    aria-haspopup="listbox"
                    aria-controls="search-suggestions"
                />

                {/* Search Icon */}
                <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={18}
                    aria-hidden="true"
                />

                {/* Loading / Clear Button */}
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
                ) : !isFocused && animatedPlaceholder ? (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-pulse pointer-events-none" aria-hidden="true">
                        |
                    </span>
                ) : null}
            </form>

            {/* Dropdown */}
            {showDropdown && (
                <div
                    ref={dropdownRef}
                    id="search-suggestions"
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
                                    {/* Product Image */}
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

                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm text-gray-900 truncate">
                                            {suggestion.name}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {suggestion.sku && <span>SKU: {suggestion.sku} • </span>}
                                            {suggestion.category}
                                        </p>
                                    </div>

                                    {/* Price */}
                                    {suggestion.price && (
                                        <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
                                            ₹{suggestion.price.toLocaleString('en-IN')}
                                        </span>
                                    )}
                                </button>
                            ))}

                            {/* View All Results */}
                            {query && (
                                <button
                                    onClick={() => handleSubmit()}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 mt-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    View all results for "{query}"
                                    <ArrowRight size={16} />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Recent Searches */}
                    {!query && showRecentSearches && recentSearches.length > 0 && (
                        <div className="p-2 border-t border-gray-100">
                            <p className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Recent Searches
                            </p>
                            {recentSearches.map((term, index) => (
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
