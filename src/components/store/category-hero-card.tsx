'use client'

import Link from "next/link"
import { Plus } from "lucide-react"

interface Product {
    id: string
    name: string
    image_url?: string
    price: number
    mrp?: number
}

interface Category {
    id: string
    name: string
    slug: string
    icon?: string
    image_url?: string
    products?: Product[]
}

interface CategoryHeroCardProps {
    category: Category
    gradientFrom?: string
    gradientTo?: string
}

export function CategoryHeroCard({
    category,
    gradientFrom = "purple-100",
    gradientTo = "pink-100"
}: CategoryHeroCardProps) {
    const featuredProducts = category.products?.slice(0, 3) || []

    return (
        <div className={`rounded-2xl p-4 bg-gradient-to-br from-${gradientFrom} to-${gradientTo} shadow-sm`}>
            {/* Header with Category Icon + Name */}
            <div className="flex items-center gap-2 mb-3">
                {category.icon ? (
                    <img src={category.icon} alt={category.name} className="w-8 h-8 object-contain" />
                ) : category.image_url ? (
                    <img src={category.image_url} alt={category.name} className="w-8 h-8 object-cover rounded" />
                ) : (
                    <div className="w-8 h-8 bg-white/50 rounded flex items-center justify-center">
                        <span className="text-lg">📦</span>
                    </div>
                )}
                <h3 className="font-semibold text-sm flex-1 line-clamp-1">{category.name}</h3>
                <Link href={`/products?category=${category.slug}`}>
                    <button className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center hover:bg-blue-600 transition-colors">
                        <Plus className="w-4 h-4 text-white" />
                    </button>
                </Link>
            </div>

            {/* Featured Products */}
            <div className="space-y-2">
                {featuredProducts.length > 0 ? (
                    featuredProducts.map((product) => (
                        <Link
                            key={product.id}
                            href={`/products/${product.id}`}
                            className="block bg-white/80 rounded-lg p-2 hover:bg-white transition-colors"
                        >
                            <div className="flex gap-2">
                                {/* Product Image */}
                                <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                                    {product.image_url ? (
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <span className="text-2xl">📦</span>
                                        </div>
                                    )}
                                </div>

                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-medium line-clamp-2 mb-1">{product.name}</h4>
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm font-bold">₹{product.price.toLocaleString()}</span>
                                        {product.mrp && product.mrp > product.price && (
                                            <>
                                                <span className="text-xs text-gray-500 line-through">₹{product.mrp}</span>
                                                <span className="text-xs text-green-600 font-semibold">
                                                    {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="text-center py-4 text-gray-500 text-xs">
                        No products yet
                    </div>
                )}
            </div>
        </div>
    )
}

