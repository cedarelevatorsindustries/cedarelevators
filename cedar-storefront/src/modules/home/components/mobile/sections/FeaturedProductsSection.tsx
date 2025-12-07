import { HttpTypes } from "@medusajs/types"
import ProductCard from "@/components/ui/product-card"
import LocalizedClientLink from "@components/ui/localized-client-link"

interface FeaturedProductsSectionProps {
  products: HttpTypes.StoreProduct[]
}

export default function FeaturedProductsSection({ products }: FeaturedProductsSectionProps) {
  // Don't render if no products
  if (!products || products.length === 0) {
    return null
  }

  // Take first 5 products for mobile (same as desktop)
  const featuredProducts = products.slice(0, 5)

  return (
    <div className="pt-4 bg-gray-50">
      <div className="flex items-center justify-between mb-4 px-4">
        <h3 className="text-gray-900 text-lg font-bold leading-tight tracking-[-0.015em]">
          Featured Products
        </h3>
        <LocalizedClientLink
          href="/catalog?sort=best-selling&from=featured"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View All →
        </LocalizedClientLink>
      </div>
      
      {/* Product Cards - Horizontal Scrollable */}
      <div 
        className="overflow-x-auto overflow-y-hidden [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex gap-3 px-4 pb-2">
          {featuredProducts.map((product) => (
            <div key={product.id} className="w-[160px] flex-shrink-0">
              <ProductCard product={product} variant="mobile" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
