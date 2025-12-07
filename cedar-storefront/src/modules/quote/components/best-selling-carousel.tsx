"use client"

import { HttpTypes } from "@medusajs/types"
import Link from "next/link"
import Image from "next/image"

interface BestSellingCarouselProps {
    products: HttpTypes.StoreProduct[]
}

export const BestSellingCarousel = ({ products }: BestSellingCarouselProps) => {
    if (!products || products.length === 0) return null

    return (
        <div className="px-4 pb-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Best Selling Products</h2>
            <div className="overflow-x-auto pb-4 scrollbar-hide">
                <div className="flex gap-4">
                    {products.slice(0, 4).map((product) => (
                        <Link
                            key={product.id}
                            href={`/products/${product.handle}`}
                            className="flex-shrink-0 w-40 bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="relative aspect-square bg-gray-50">
                                {product.thumbnail ? (
                                    <Image
                                        src={product.thumbnail}
                                        alt={product.title || "Product"}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xs">
                                        No Image
                                    </div>
                                )}
                            </div>
                            <div className="p-3">
                                <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
                                    {product.title}
                                </h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
