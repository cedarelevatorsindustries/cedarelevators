import { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { listCategories } from "@/lib/data/categories"

export const metadata: Metadata = {
  title: "All Categories | Cedar Elevators",
  description: "Browse all elevator component categories by functional family at Cedar Elevators.",
}

export default async function CategoriesPage() {
  const categories = await listCategories()

  return (
    <div className="min-h-screen bg-white pt-[70px]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-10 sm:py-14">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 border-b border-zinc-200 pb-6">
          <div>
            <h1 className="type-section text-zinc-900">
              Product Categories
            </h1>
            <p className="type-body-sm text-zinc-600 mt-2">
              Explore precision engineering components organized by functional family.
            </p>
          </div>
          <Link
            href="/products"
            className="type-nav inline-flex items-center gap-1.5 text-orange-600 hover:text-orange-700 transition-colors whitespace-nowrap"
          >
            <span>Browse All Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {categories.length === 0 ? (
          <div className="py-16 text-center text-zinc-500">
            <p className="type-body">No categories available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const name = cat.name || (cat as any).title || "Category"
              const slug = cat.handle || cat.slug || cat.id
              const image =
                (cat as any).thumbnail ||
                (cat as any).thumbnail_image ||
                (cat as any).image_url ||
                null
              const firstLetter = name.trim().charAt(0).toUpperCase()

              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${slug}`}
                  className="group flex items-start gap-4 p-5 rounded-xl border border-zinc-200 bg-white hover:border-orange-300 transition-colors"
                >
                  <div className="w-16 h-16 rounded-lg border border-zinc-200 bg-zinc-50 flex-shrink-0 overflow-hidden flex items-center justify-center p-2">
                    {image ? (
                      <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-xl font-light text-zinc-400">
                        {firstLetter}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="type-product text-zinc-900 group-hover:text-orange-600 transition-colors truncate">
                        {name}
                      </h2>
                      <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-orange-600 flex-shrink-0 transition-colors" />
                    </div>
                    {cat.description && (
                      <p className="type-body-sm text-zinc-600 mt-1.5 line-clamp-2">
                        {cat.description}
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
