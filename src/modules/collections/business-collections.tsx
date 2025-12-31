"use client"

import { useEffect, useState } from 'react'
import { getBusinessCollections } from '@/lib/actions/collections-context'
import Link from 'next/link'
import { ChevronRight, Package, Briefcase } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface Product {
    id: string
    title: string
    name: string
    slug: string
    handle: string
    thumbnail?: string
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
    products: Product[]
    product_count: number
}

export function BusinessCollections() {
    const [collections, setCollections] = useState<Collection[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadCollections = async () => {
            try {
                const result = await getBusinessCollections(5)
                if (result.success && result.collections) {
                    setCollections(result.collections)
                }
            } catch (error) {
                console.error('Error loading business collections:', error)
            } finally {
                setLoading(false)
            }
        }
        loadCollections()
    }, [])

    if (loading) {
        return (
            <div className="py-8">
                <div className="animate-pulse space-y-8">
                    {[1].map((i) => (
                        <div key={i} className="space-y-4">
                            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {[1, 2, 3, 4, 5].map((j) => (
                                    <div key={j} className="h-64 bg-gray-200 rounded"></div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (collections.length === 0) {
        return (
            <div className="py-12 text-center">
                <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Business Collections</h3>
                <p className="text-gray-600">Check back later for exclusive business deals and packages.</p>
            </div>
        )
    }

    return (
        <div className="py-8 space-y-12">
            {collections.map((collection) => (
                <div key={collection.id} className="space-y-6">
                    {/* Collection Header with Business Badge */}
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                                    {collection.title}
                                </h2>
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                                    <Briefcase className="h-4 w-4" />
                                    Business
                                </span>
                            </div>
                            {collection.description && (
                                <p className="text-gray-600">{collection.description}</p>
                            )}
                        </div>
                        <Link
                            href={`/catalog?collection=${collection.slug}`}
                            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
                        >
                            View All
                            <ChevronRight className="h-5 w-5" />
                        </Link>
                    </div>

                    {/* Products Grid (5 products) */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {collection.products.map((product) => (
                            <Link
                                key={product.id}
                                href={`/products/${product.handle || product.slug}`}
                                className="group"
                            >
                                <Card className="overflow-hidden hover:shadow-lg transition-shadow border-blue-200">
                                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                                        {product.thumbnail ? (
                                            <img
                                                src={product.thumbnail}
                                                alt={product.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="h-12 w-12 text-gray-300" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors">
                                            {product.title}
                                        </h3>
                                        {product.price && (
                                            <p className="text-orange-600 font-semibold mt-2">
                                                ₹{product.price.amount.toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
