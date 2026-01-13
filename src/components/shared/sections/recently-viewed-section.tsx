"use client"

import { useEffect, useState } from "react"
import DynamicCollectionSection from "@/components/common/DynamicCollectionSection"
import { Product } from "@/lib/types/domain"

interface RecentlyViewedSectionProps {
    currentProductId?: string
}

/**
 * Recently Viewed Section
 * Shows products from localStorage that user has recently viewed
 * Excludes current product if on PDP
 */
export default function RecentlyViewedSection({ currentProductId }: RecentlyViewedSectionProps) {
    const [recentProducts, setRecentProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadRecentlyViewed = async () => {
            try {
                const recentStr = localStorage.getItem('recentlyViewed')
                if (!recentStr) {
                    setIsLoading(false)
                    return
                }

                const recentIds = JSON.parse(recentStr) as string[]

                // Filter out current product if on PDP
                const filteredIds = currentProductId
                    ? recentIds.filter(id => id !== currentProductId)
                    : recentIds

                if (filteredIds.length === 0) {
                    setIsLoading(false)
                    return
                }

                // TODO: Fetch actual product data from API
                // For now, this will show empty until proper product fetch is implemented
                // You should call an API like: await fetch(`/api/products?ids=${filteredIds.join(',')}`)

                setIsLoading(false)
            } catch (error) {
                console.error('Error loading recently viewed:', error)
                setIsLoading(false)
            }
        }

        loadRecentlyViewed()
    }, [currentProductId])

    // Don't show if loading or no products
    if (isLoading || recentProducts.length === 0) {
        return null
    }

    const collection = {
        id: 'recently-viewed',
        title: 'Recently Viewed',
        description: 'Continue browsing from where you left off',
        slug: 'recently-viewed',
        displayLocation: [],
        layout: 'grid-5' as const,
        icon: 'none' as const,
        viewAllLink: '',
        products: recentProducts.slice(0, 5),
        isActive: true,
        sortOrder: 0,
        showViewAll: false,
        metadata: {},
        emptyStateMessage: ''
    }

    return (
        <section className="px-12 py-8">
            <DynamicCollectionSection collection={collection} />
        </section>
    )
}
