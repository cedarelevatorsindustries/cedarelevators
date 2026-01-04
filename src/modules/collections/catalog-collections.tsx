"use client"

import { useEffect, useState } from 'react'
import { getCatalogCollections } from '@/lib/actions/collections-context'
import Link from 'next/link'
import { Package, Grid3x3 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Product {
    id: string
    title: string
    name: string
    slug: string
    handle: string
    thumbnail?: string
    description?: string
    price?: {
        amount: number
        currency_code: string
    }
}

interface Collection {
    id: string
    title: string
    slug: string
    description?: string
    collection_type: 'general' | 'category_specific' | 'business_specific'
    products: Product[]
    product_count: number
}

export function CatalogCollections() {
    const [collections, setCollections] = useState<Collection[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set())

    useEffect(() => {
        const loadCollections = async () => {
            try {
                const result = await getCatalogCollections()
                if (result.success && result.collections) {
                    setCollections(result.collections)
                }
            } catch (error) {
                console.error('Error loading catalog collections:', error)
            } finally {
                setLoading(false)
            }
        }
        loadCollections()
    }, [])

    const toggleCollection = (collectionId: string) => {
        setExpandedCollections(prev => {
            const newSet = new Set(prev)
            if (newSet.has(collectionId)) {
                newSet.delete(collectionId)
            } else {
                newSet.add(collectionId)
            }
            return newSet
        })
    }

    const getCollectionTypeLabel = (type: string) => {
        switch (type) {
            case 'general':
                return { label: 'General', color: 'bg-green-100 text-green-700' }
            case 'category_specific':
                return { label: 'Category', color: 'bg-purple-100 text-purple-700' }
            case 'business_specific':
                return { label: 'Business', color: 'bg-blue-100 text-blue-700' }
            default:
                return { label: 'Collection', color: 'bg-gray-100 text-gray-700' }
        }
    }

    if (loading) {
        return (
            <div className="py-12">
                <div className="container mx-auto px-4">
                    <div className="animate-pulse space-y-12">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="space-y-4">
                                <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
                                        <div key={j} className="h-80 bg-gray-200 rounded"></div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (collections.length === 0) {
        return (
            <div className="py-20 text-center">
                <Grid3x3 className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No Collections Available</h3>
                <p className="text-gray-600">Check back later for curated product collections.</p>
            </div>
        )
    }

    return (
        <div className="py-12 bg-gray-50">
            <div className="container mx-auto px-4 space-y-16">
                {collections.map((collection) => {
                    const isExpanded = expandedCollections.has(collection.id)
                    const displayProducts = isExpanded ? collection.products : collection.products.slice(0, 8)
                    const typeInfo = getCollectionTypeLabel(collection.collection_type)

                    return (
                        <div key={collection.id} className="space-y-6">
                            {/* Collection Header */}
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                                            {collection.title}
                                        </h2>
                                        <Badge className={typeInfo.color}>
                                            {typeInfo.label}
                                        </Badge>
                                    </div>
                                    {collection.description && (
                                        <p className="text-gray-600 text-lg">{collection.description}</p>
                                    )}
                                    <p className="text-sm text-gray-500 mt-2">
                                        {collection.product_count} {collection.product_count === 1 ? 'product' : 'products'}
                                    </p>
                                </div>
                            </div>

                            {/* Products Grid - ALL PRODUCTS in catalog */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {displayProducts.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/products/${product.handle || product.slug}`}
                                        className="group"
                                    >
                                        <Card className="overflow-hidden hover:shadow-xl transition-all duration-200">
                                            <div className="aspect-square bg-gray-100 relative overflow-hidden">
                                                {product.thumbnail ? (
                                                    <img
                                                        src={product.thumbnail}
                                                        alt={product.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="h-16 w-16 text-gray-300" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors mb-2">
                                                    {product.title}
                                                </h3>
                                                {product.description && (
                                                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                                        {product.description}
                                                    </p>
                                                )}
                                                {product.price && (
                                                    <p className="text-orange-600 font-bold text-lg">
                                                        ₹{product.price.amount.toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>

                            {/* View More/Less Button */}
                            {collection.products.length > 8 && (
                                <div className="text-center">
                                    <button
                                        onClick={() => toggleCollection(collection.id)}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-orange-600 text-orange-600 font-semibold rounded-lg hover:bg-orange-600 hover:text-white transition-colors"
                                    >
                                        {isExpanded ? (
                                            <>Show Less</>
                                        ) : (
                                            <>View All {collection.product_count} Products</>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

