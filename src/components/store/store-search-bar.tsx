'use client'

import { useState, useEffect, useRef } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface SearchSuggestions {
    products: Array<{
        id: string
        name: string
        sku: string
        slug: string
        thumbnail?: string
        price?: number
        category?: string
        tags?: string[]
    }>
    categories: Array<{
        id: string
        name: string
        slug: string
    }>
}

export function StoreSearchBar() {
    const [query, setQuery] = useState('')
    const [suggestions, setSuggestions] = useState<SearchSuggestions | null>(null)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const debouncedQuery = useDebounce(query, 300)
    const router = useRouter()
    const searchRef = useRef<HTMLDivElement>(null)

    // Fetch suggestions when debounced query changes
    useEffect(() => {
        if (debouncedQuery.length >= 2) {
            fetchSuggestions(debouncedQuery)
        } else {
            setSuggestions(null)
            setShowSuggestions(false)
        }
    }, [debouncedQuery])

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const fetchSuggestions = async (q: string) => {
        setIsLoading(true)
        try {
            // Use new search API with PostgreSQL full-text search
            const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=8`)
            const data = await res.json()

            if (data.success && data.results) {
                // Transform results to match expected format
                setSuggestions({
                    products: data.results.map((result: any) => ({
                        id: result.id,
                        name: result.name,
                        sku: result.sku || '',
                        slug: result.slug,
                        thumbnail: result.thumbnail_url,
                        price: result.price,
                        category: result.category_name,
                        tags: result.tags || []
                    })),
                    categories: [] // Categories are not included in product search
                })
                setShowSuggestions(true)
            }
        } catch (error) {
            console.error('Failed to fetch suggestions:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            router.push(`/catalog?search=${encodeURIComponent(query.trim())}`)
            setShowSuggestions(false)
        }
    }

    const clearSearch = () => {
        setQuery('')
        setSuggestions(null)
        setShowSuggestions(false)
    }

    const hasSuggestions = suggestions && (suggestions.products.length > 0 || suggestions.categories.length > 0)

    return (
        <div className="relative w-full" ref={searchRef}>
            <form onSubmit={handleSearch}>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        type="search"
                        placeholder="Search products, SKUs, categories..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => hasSuggestions && setShowSuggestions(true)}
                        className="pl-10 pr-10 h-11 bg-white border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && hasSuggestions && (
                <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    {/* Products */}
                    {suggestions.products.length > 0 && (
                        <div className="p-2">
                            <div className="text-xs font-semibold text-gray-500 px-2 mb-2 uppercase tracking-wide">
                                Products
                            </div>
                            {suggestions.products.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/products/${product.slug}`}
                                    className="block px-3 py-2.5 hover:bg-orange-50 rounded-md transition-colors"
                                    onClick={() => setShowSuggestions(false)}
                                >
                                    <div className="flex items-center gap-3">
                                        {product.thumbnail && (
                                            <img
                                                src={product.thumbnail}
                                                alt={product.name}
                                                className="w-10 h-10 object-cover rounded bg-gray-100"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-gray-900 truncate">{product.name}</div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                {product.sku && (
                                                    <span className="text-xs text-gray-500 font-mono">{product.sku}</span>
                                                )}
                                                {product.category && (
                                                    <span className="text-xs text-gray-400">• {product.category}</span>
                                                )}
                                            </div>
                                            {product.tags && product.tags.length > 0 && (
                                                <div className="flex gap-1 mt-1">
                                                    {product.tags.slice(0, 3).map((tag, idx) => (
                                                        <span key={idx} className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {product.price && (
                                            <div className="text-sm font-semibold text-gray-900">
                                                ₹{product.price.toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Categories */}
                    {suggestions.categories.length > 0 && (
                        <div className="p-2 border-t border-gray-100">
                            <div className="text-xs font-semibold text-gray-500 px-2 mb-2 uppercase tracking-wide">
                                Categories
                            </div>
                            {suggestions.categories.map((category) => (
                                <Link
                                    key={category.id}
                                    href={`/categories/${category.slug}`}
                                    className="block px-3 py-2 hover:bg-orange-50 rounded-md transition-colors"
                                    onClick={() => setShowSuggestions(false)}
                                >
                                    <div className="text-sm text-gray-900">{category.name}</div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* View All Results */}
                    <div className="p-2 border-t border-gray-100">
                        <button
                            onClick={handleSearch}
                            className="w-full px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded-md font-medium transition-colors text-left"
                        >
                            View all results for "{query}"
                        </button>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isLoading && showSuggestions && (
                <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
                    <div className="flex items-center justify-center text-gray-500">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500 mr-2"></div>
                        Searching...
                    </div>
                </div>
            )}
        </div>
    )
}

