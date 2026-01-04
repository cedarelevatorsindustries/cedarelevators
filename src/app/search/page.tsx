'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { StoreSearchBar } from '@/components/store/store-search-bar'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

interface SearchResult {
    id: string
    name: string
    slug: string
    sku: string
    thumbnail?: string
    price?: number
    short_description?: string
}

export default function SearchPage() {
    const searchParams = useSearchParams()
    const query = searchParams.get('q') || ''
    const [results, setResults] = useState<SearchResult[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)

    useEffect(() => {
        if (query) {
            performSearch(query, page)
        }
    }, [query, page])

    const performSearch = async (q: string, p: number) => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/store/search?q=${encodeURIComponent(q)}&page=${p}`)
            const data = await res.json()

            if (data.success) {
                setResults(data.products || [])
                setTotal(data.total || 0)
            }
        } catch (error) {
            console.error('Search error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Search Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="max-w-2xl mx-auto">
                        <StoreSearchBar />
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {query && (
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Search Results for "{query}"
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {isLoading ? 'Searching...' : `${total} products found`}
                        </p>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                    </div>
                ) : results.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {results.map((product) => (
                            <Link
                                key={product.id}
                                href={`/products/${product.slug}`}
                                className="bg-white rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-md transition-all overflow-hidden group"
                            >
                                {product.thumbnail && (
                                    <div className="aspect-square bg-gray-100 overflow-hidden">
                                        <img
                                            src={product.thumbnail}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                )}
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors">
                                        {product.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 font-mono mt-1">{product.sku}</p>
                                    {product.short_description && (
                                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                            {product.short_description}
                                        </p>
                                    )}
                                    {product.price && (
                                        <p className="text-lg font-bold text-orange-600 mt-3">
                                            ₹{product.price.toLocaleString('en-IN')}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : query ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No products found for "{query}"</p>
                        <p className="text-gray-400 mt-2">Try different keywords or check your spelling</p>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">Enter a search query to find products</p>
                    </div>
                )}
            </div>
        </div>
    )
}

