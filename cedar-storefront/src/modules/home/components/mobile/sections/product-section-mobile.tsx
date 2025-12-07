import { HttpTypes } from "@medusajs/types"
import ProductCard from "@/components/ui/product-card"
import LocalizedClientLink from "@components/ui/localized-client-link"

interface ProductSectionMobileProps {
  title: string
  products: HttpTypes.StoreProduct[]
  viewAllLink?: string
}

export default function ProductSectionMobile({ 
  title, 
  products, 
  viewAllLink = "/products" 
}: ProductSectionMobileProps) {
  if (products.length === 0) return null

  // Take first 5 products for horizontal scroll (same as guest view)
  const displayProducts = products.slice(0, 5)

  return (
    <section className="pt-4 bg-white">
      <div className="flex items-center justify-between mb-4 px-4">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <LocalizedClientLink href={viewAllLink} className="text-blue-600 text-sm font-medium">
          View All →
        </LocalizedClientLink>
      </div>
      
      {/* Horizontal Scrollable Product Cards */}
      <div 
        className="overflow-x-auto overflow-y-hidden [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex gap-3 px-4 pb-2">
          {displayProducts.map((product) => (
            <div key={product.id} className="w-[160px] flex-shrink-0">
              <ProductCard product={product} variant="mobile" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
