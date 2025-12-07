import { HttpTypes } from "@medusajs/types"
import ProductCard from "@/components/ui/product-card"
import LocalizedClientLink from "@components/ui/localized-client-link"

interface FeaturedProductsSectionProps {
  products: HttpTypes.StoreProduct[]
}

const FeaturedProductsSection = ({ products }: FeaturedProductsSectionProps) => {
  // Don't render if no products
  if (!products || products.length === 0) {
    return null
  }

  // Take first 5 products as featured
  const featuredProducts = products.slice(0, 5)

  return (
    <section className="px-12 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Top Selling Components
        </h2>
        <LocalizedClientLink
          href="/catalog?sort=best-selling&from=top-selling"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View All →
        </LocalizedClientLink>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

export default FeaturedProductsSection
