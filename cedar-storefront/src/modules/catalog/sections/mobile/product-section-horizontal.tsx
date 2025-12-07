import { HttpTypes } from "@medusajs/types"
import ProductCard from "@/components/ui/product-card"
import LocalizedClientLink from "@/components/ui/localized-client-link"

interface ProductSectionHorizontalProps {
  title: string
  products: HttpTypes.StoreProduct[]
  viewAllLink?: string
}

export default function ProductSectionHorizontal({ 
  title, 
  products, 
  viewAllLink 
}: ProductSectionHorizontalProps) {
  if (products.length === 0) return null

  return (
    <section className="py-4 bg-white">
      <div className="flex items-center justify-between mb-3 px-4">
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        {viewAllLink && (
          <LocalizedClientLink href={viewAllLink} className="text-blue-600 text-sm font-medium">
            View All →
          </LocalizedClientLink>
        )}
      </div>
      
      <div 
        className="overflow-x-auto overflow-y-hidden [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex gap-3 px-4 pb-2">
          {products.slice(0, 5).map((product) => (
            <div key={product.id} className="w-[160px] flex-shrink-0">
              <ProductCard product={product} variant="mobile" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
