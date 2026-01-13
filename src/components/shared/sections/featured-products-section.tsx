import DynamicCollectionSection from "@/components/common/DynamicCollectionSection"
import { Product } from "@/lib/types/domain"

interface FeaturedProductsSectionProps {
    variant?: 'desktop' | 'mobile'
    products: Product[]
}

/**
 * Featured Products Section - Shows random products from catalog
 * Refreshes random products on each page load
 * Includes View All button to catalog page
 */
export function FeaturedProductsSection({
    variant = 'desktop',
    products = []
}: FeaturedProductsSectionProps) {
    const isMobile = variant === 'mobile'

    // Take first 5-8 products (no random shuffle to avoid hydration mismatch)
    // Random shuffling causes SSR/client mismatch because Math.random() differs
    const randomCount = isMobile ? 5 : 8
    const randomProducts = products.slice(0, randomCount).map((product: any) => ({
        id: product.id,
        title: product.title || product.name,
        name: product.name,
        slug: product.slug || product.handle,
        handle: product.handle || product.slug,
        thumbnail: product.thumbnail,
        price: product.price,
        variants: product.variants || [],
        metadata: product.metadata || {}
    }))

    // Don't show if no products
    if (randomProducts.length === 0) return null

    const featuredCollection = {
        id: 'featured-products',
        title: 'Featured Products',
        description: 'Discover our handpicked selection of premium elevator components',
        slug: 'featured-products',
        displayLocation: [],
        layout: isMobile ? 'horizontal-scroll' as const : 'grid-5' as const,
        icon: 'none' as const,
        viewAllLink: '/catalog',
        products: randomProducts,
        isActive: true,
        sortOrder: 0,
        showViewAll: true,
        metadata: {},
        emptyStateMessage: ''
    }

    if (isMobile) {
        return (
            <div className="bg-gray-50">
                <DynamicCollectionSection
                    collection={featuredCollection}
                    variant="mobile"
                />
            </div>
        )
    }

    return (
        <section className="px-12">
            <DynamicCollectionSection collection={featuredCollection} />
        </section>
    )
}

export default FeaturedProductsSection
