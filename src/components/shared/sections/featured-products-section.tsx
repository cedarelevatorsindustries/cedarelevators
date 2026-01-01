import DynamicCollectionSection from "@/components/common/DynamicCollectionSection"
import { getCollectionBySlug } from "@/lib/actions/collections"

interface FeaturedProductsSectionProps {
    variant?: 'desktop' | 'mobile'
}

/**
 * Unified Featured Products Section
 * Responsive component that handles both mobile and desktop layouts
 * Uses the dynamic collection system with the "top-selling" collection from database
 */
export async function FeaturedProductsSection({
    variant = 'desktop'
}: FeaturedProductsSectionProps) {
    const isMobile = variant === 'mobile'

    // Get the top-selling collection from database
    const { collection: dbCollection } = await getCollectionBySlug("top-selling")

    // Transform to DisplayCollection format if exists
    const featuredCollection = dbCollection ? {
        id: dbCollection.id,
        title: dbCollection.title,
        description: dbCollection.description,
        slug: dbCollection.slug,
        displayLocation: [],
        layout: isMobile ? 'horizontal-scroll' : 'grid-5',
        icon: 'star',
        viewAllLink: '/catalog?type=top-choice&sort=best-selling',
        products: (dbCollection.products || []).map((pc: any) => {
            const product = pc.product
            return {
                id: product.id,
                title: product.name,
                name: product.name,
                slug: product.slug,
                handle: product.slug,
                thumbnail: product.thumbnail,
                price: product.price ? { amount: product.price, currency_code: 'INR' } : undefined,
                variants: []
            }
        }),
        isActive: dbCollection.is_active,
        sortOrder: dbCollection.sort_order,
        showViewAll: true,
        ...(isMobile ? {} : { metadata: { priority: 'high' } })
    } : null

    // If collection doesn't exist or is inactive, don't render
    if (!featuredCollection) return null

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
