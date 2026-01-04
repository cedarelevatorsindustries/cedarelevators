import { CatalogType } from "@/types/catalog"

/**
 * Generate catalog URL with type parameter
 */
export function getCatalogUrl(type: CatalogType, params?: Record<string, string>): string {
  const searchParams = new URLSearchParams({ type, ...params })
  return `/catalog?${searchParams.toString()}`
}

/**
 * Navigation links for all catalog types
 */
export const CATALOG_NAVIGATION = {
  browseAll: getCatalogUrl("browse-all"),
  search: (query: string) => getCatalogUrl("search", { search: query }),
  category: (categoryId: string) => getCatalogUrl("category", { category: categoryId }),
  application: (appId: string) => getCatalogUrl("application", { application: appId }),
  recentlyViewed: getCatalogUrl("recently-viewed"),
  recommended: getCatalogUrl("recommended"),
  topChoice: getCatalogUrl("top-choice"),
  newArrival: getCatalogUrl("new-arrival"),
  trendingCollections: getCatalogUrl("trending-collections"),
  topApplications: getCatalogUrl("top-applications"),
  exclusiveBusiness: getCatalogUrl("exclusive-business"),
}

