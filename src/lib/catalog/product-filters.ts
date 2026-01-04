import { Product } from "@/lib/types/domain"
import { CatalogType } from "@/types/catalog"

interface FilterContext {
  type: CatalogType
  category?: string
  application?: string
  search?: string
  recentlyViewedIds?: string[]
}

/**
 * Filter products based on catalog type and context
 */
export function filterProductsByType(
  products: Product[],
  context: FilterContext
): { primary: Product[]; fallback: Product[] } {
  const { type, category, application, search, recentlyViewedIds = [] } = context

  let primary: Product[] = []
  let fallback: Product[] = []

  switch (type) {
    case "browse-all":
      primary = products
      break

    case "search":
      if (search?.trim()) {
        const query = search.toLowerCase()
        primary = products.filter(
          (p) =>
            p.title?.toLowerCase().includes(query) ||
            p.description?.toLowerCase().includes(query) ||
            p.categories?.some((cat) => cat.name?.toLowerCase().includes(query))
        )
      }
      break

    case "category":
      // Server-side already filters by category, so we just pass through
      primary = products
      break

    case "application":
      if (application) {
        primary = products.filter((p) => p.metadata?.application === application)
      }
      break

    case "recently-viewed":
      primary = products.filter((p) => recentlyViewedIds.includes(p.id))
      fallback = products.filter((p) => !recentlyViewedIds.includes(p.id))
      break

    case "recommended":
      primary = products.filter((p) => p.metadata?.recommended === true)
      fallback = products.filter((p) => p.metadata?.recommended !== true)
      break

    case "top-choice":
      primary = products.filter((p) => p.metadata?.topChoice === true)
      fallback = products.filter((p) => p.metadata?.topChoice !== true)
      break

    case "new-arrival":
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      primary = products.filter(
        (p) => new Date(p.created_at || 0) > thirtyDaysAgo
      )
      fallback = products.filter(
        (p) => new Date(p.created_at || 0) <= thirtyDaysAgo
      )
      break

    case "trending-collections":
      primary = products.filter((p) => p.metadata?.trending === true)
      fallback = products.filter((p) => p.metadata?.trending !== true)
      break

    case "top-applications":
      primary = products.filter((p) => p.metadata?.topApplication === true)
      fallback = products.filter((p) => p.metadata?.topApplication !== true)
      break

    case "exclusive-business":
      primary = products.filter((p) => p.metadata?.exclusiveBusiness === true)
      fallback = products.filter((p) => p.metadata?.exclusiveBusiness !== true)
      break

    default:
      primary = products
  }

  return { primary, fallback }
}

/**
 * Get product tag for display (used in trending-collections and top-applications)
 */
export function getProductTag(
  product: Product,
  type: CatalogType
): string | null {
  if (type === "trending-collections" && product.categories?.[0]) {
    return product.categories[0].name || null
  }

  if (type === "top-applications" && product.metadata?.application) {
    return product.metadata.application as string
  }

  return null
}

/**
 * Get related search keywords for search type
 */
export function getRelatedKeywords(
  search: string,
  products: Product[]
): string[] {
  if (!search?.trim()) return []

  const keywords = new Set<string>()
  const query = search.toLowerCase()

  products.forEach((product) => {
    // Add matching category names
    product.categories?.forEach((cat) => {
      if (cat.name?.toLowerCase().includes(query)) {
        keywords.add(cat.name)
      }
    })

    // Add matching tags from metadata
    if (product.metadata?.tags && Array.isArray(product.metadata.tags)) {
      product.metadata.tags.forEach((tag: unknown) => {
        const tagStr = String(tag)
        if (tagStr.toLowerCase().includes(query)) {
          keywords.add(tagStr)
        }
      })
    }
  })

  return Array.from(keywords).slice(0, 5)
}

