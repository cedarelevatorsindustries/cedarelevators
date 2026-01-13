// Catalog type definitions
export type CatalogType =
  | "browse-all"
  | "search"
  | "category"
  | "application"
  | "collection"
  | "recently-viewed"
  | "recommended"
  | "top-choice"
  | "new-arrival"
  | "trending-collections"
  | "top-applications"
  | "exclusive-business"

export type CatalogVariantType = 'browse' | 'category' | 'application' | 'search'

export interface CatalogConfig {
  type: CatalogType
  title: string
  showBanner: boolean
  bannerVariant?: "full" | "simple"
  showHeroLite: boolean
  heroLiteType?: "category" | "application"
  showFilters: boolean
  filterPrimaryProducts: boolean
  fallbackToAll: boolean
}

export interface CatalogVariantConfig extends CatalogConfig {
  variantType: CatalogVariantType
  contextData?: {
    category?: string
    application?: string
    searchQuery?: string
  }
  heroLite?: {
    show: boolean
    height: number
    backgroundType: string
    backgroundImage?: string
    title: string
    subtitle: string
    quickFilters: any[]
  }
  carousel?: {
    show: boolean
    type: string
    height: number
    promoCount: number
  }
  navigation?: {
    breadcrumb: Array<{ label: string; href: string }>
    showCategoryBar: boolean
    showRelatedSearches: boolean
    relatedKeywords: string[]
  }
  filters?: {
    sidebarType: string
    showSecondaryBar: boolean
    preAppliedFilters: Record<string, any>
    availableFilters: string[]
  }
  content?: Record<string, any>
  [key: string]: any // Allow additional properties
}

export const CATALOG_CONFIGS: Record<CatalogType, CatalogConfig> = {
  "browse-all": {
    type: "browse-all",
    title: "All Products",
    showBanner: true,
    bannerVariant: "simple",
    showHeroLite: false,
    showFilters: true,
    filterPrimaryProducts: false,
    fallbackToAll: false,
  },
  "search": {
    type: "search",
    title: "Search Results",
    showBanner: false,
    showHeroLite: false,
    showFilters: true,
    filterPrimaryProducts: false,
    fallbackToAll: false,
  },
  "category": {
    type: "category",
    title: "Category",
    showBanner: true,
    bannerVariant: "full",
    showHeroLite: false,
    showFilters: false,
    filterPrimaryProducts: false,
    fallbackToAll: false,
  },
  "application": {
    type: "application",
    title: "Application",
    showBanner: true,
    bannerVariant: "full",
    showHeroLite: false,
    showFilters: false,
    filterPrimaryProducts: false,
    fallbackToAll: false,
  },
  "collection": {
    type: "collection",
    title: "Collection Products",
    showBanner: true,
    showHeroLite: false,
    showFilters: true,
    filterPrimaryProducts: true,
    fallbackToAll: true,
  },
  "recently-viewed": {
    type: "recently-viewed",
    title: "Recently Viewed",
    showBanner: false,
    showHeroLite: false,
    showFilters: true,
    filterPrimaryProducts: true,
    fallbackToAll: true,
  },
  "recommended": {
    type: "recommended",
    title: "Recommended For You",
    showBanner: false,
    showHeroLite: false,
    showFilters: true,
    filterPrimaryProducts: true,
    fallbackToAll: true,
  },
  "top-choice": {
    type: "top-choice",
    title: "Top Choice This Month",
    showBanner: false,
    showHeroLite: false,
    showFilters: true,
    filterPrimaryProducts: true,
    fallbackToAll: true,
  },
  "new-arrival": {
    type: "new-arrival",
    title: "New Arrivals",
    showBanner: false,
    showHeroLite: false,
    showFilters: true,
    filterPrimaryProducts: true,
    fallbackToAll: true,
  },
  "trending-collections": {
    type: "trending-collections",
    title: "Trending Collections",
    showBanner: false,
    showHeroLite: false,
    showFilters: true,
    filterPrimaryProducts: true,
    fallbackToAll: true,
  },
  "top-applications": {
    type: "top-applications",
    title: "Top Applications",
    showBanner: false,
    showHeroLite: false,
    showFilters: true,
    filterPrimaryProducts: true,
    fallbackToAll: true,
  },
  "exclusive-business": {
    type: "exclusive-business",
    title: "Exclusive to Business",
    showBanner: false,
    showHeroLite: false,
    showFilters: true,
    filterPrimaryProducts: true,
    fallbackToAll: true,
  },
}

