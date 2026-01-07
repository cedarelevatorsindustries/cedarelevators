"use client"

import { ArrowRight } from "lucide-react"
import Link from "next/link"
import ProductCard from "@/components/ui/product-card"
import type { Product } from "@/lib/types/domain"

interface CollectionSectionProps {
    title: string
    slug: string
    products: Product[]
    variant?: "default" | "mobile"
    category?: string // Optional category filter for View All link
}

export default function CollectionSection({
    title,
    slug,
    products,
    variant = "default",
    category
}: CollectionSectionProps) {
    // Build View All link - navigate to catalog with collection filter
    const viewAllLink = category
        ? `/catalog?collection=${slug}&category=${category}`
        : `/catalog?collection=${slug}`

    if (products.length === 0) {
        return null
    }

    return (
        <div className={variant === "mobile" ? "bg-white py-6 px-4" : "bg-white rounded-lg p-6"}>
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className={variant === "mobile" ? "text-lg font-bold text-gray-900" : "text-xl font-bold text-gray-900"}>
                    {title}
                </h2>
                <Link
                    href={viewAllLink}
                    className="flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                >
                    View All
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            {/* Products Grid */}
            <div className={
                variant === "mobile"
                    ? "grid grid-cols-2 gap-3"
                    : "grid grid-cols-2 md:grid-cols-4 gap-4"
            }>
                {products.slice(0, 4).map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        variant={variant}
                    />
                ))}
            </div>
        </div>
    )
}
