"use client"

import { useEffect, useState } from 'react'
import { getCategoryCollections } from '@/lib/actions/collections-context'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import ProductCard from '@/components/ui/product-card'

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
    compare_at_price?: number
    variants?: any[]
}

interface Collection {
    id: string
    title: string
    slug: string
    description?: string
    products: Product[]
    product_count: number
}

interface CategoryCollectionsProps {
    categoryId: string
}

export function CategoryCollections({ categoryId }: CategoryCollectionsProps) {
    const [collections, setCollections] = useState<Collection[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadCollections = async () => {
            try {
                const result = await getCategoryCollections(categoryId, 5)
                if (result.success && result.collections) {
                    setCollections(result.collections)
                }
            } catch (error) {
                console.error('Error loading category collections:', error)
            } finally {
                setLoading(false)
            }
        }
        loadCollections()
    }, [categoryId])

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
        return null
    }

    return (
        <div className="py-8 space-y-12">
            {collections.map((collection) => (
                <div key={collection.id} className="space-y-6">
                    {/* Collection Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                                {collection.title}
                            </h2>
                            {collection.description && (
                                <p className="text-gray-600 mt-1">{collection.description}</p>
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
                            <ProductCard
                                key={product.id}
                                product={product as any}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

