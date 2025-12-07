import { CatalogVariantConfig, CatalogVariantType } from "@/types/catalog"

/**
 * Get catalog page configuration based on variant type and context
 */
export function getCatalogVariantConfig(
  variantType: CatalogVariantType,
  contextData: {
    category?: string
    application?: string
    searchQuery?: string
  }
): CatalogVariantConfig {
  switch (variantType) {
    case 'browse':
      return getBrowseAllConfig()
    
    case 'category':
      return getCategoryConfig(contextData.category || '')
    
    case 'application':
      return getApplicationConfig(contextData.application || '')
    
    case 'search':
      return getSearchConfig(contextData.searchQuery || '')
    
    default:
      return getBrowseAllConfig()
  }
}

/**
 * Variant A: Browse All Products
 */
function getBrowseAllConfig(): CatalogVariantConfig {
  return {
    type: 'browse-all',
    title: 'All Products',
    showBanner: true,
    showHeroLite: false,
    filterPrimaryProducts: false,
    fallbackToAll: false,
    variantType: 'browse',
    contextData: {},
    
    heroLite: {
      show: false,
      height: 0,
      backgroundType: 'none',
      title: '',
      subtitle: '',
      quickFilters: [],
    },
    
    carousel: {
      show: true,
      type: 'general',
      height: 400,
      promoCount: 3,
    },
    
    navigation: {
      breadcrumb: [
        { label: 'Home', href: '/' },
        { label: 'All Products', href: '/catalog' },
      ],
      showCategoryBar: true,
      showRelatedSearches: false,
      relatedKeywords: [],
    },
    
    filters: {
      sidebarType: 'full',
      showSecondaryBar: true,
      preAppliedFilters: {},
      availableFilters: [
        'category',
        'price',
        'grade',
        'dimensions',
        'availability',
        'rating',
        'special-offers',
      ],
    },
    
    content: {
      showBuyingGuide: false,
      showCategoryDescription: false,
      showApplicationTips: false,
      showSearchSuggestions: false,
    },
    
    ctas: {
      showRequestQuote: true,
      quoteType: 'floating',
      showBulkOrder: true,
    },
    
    products: {
      source: 'all',
      defaultSort: 'best-sellers',
      resultsPerPage: 24,
    },
  }
}

/**
 * Variant B: Category Products (Alibaba Hero-Lite Style)
 */
function getCategoryConfig(category: string): CatalogVariantConfig {
  const categoryData = getCategoryMetadata(category)
  
  return {
    type: 'category',
    title: categoryData.displayName,
    showBanner: false,
    showHeroLite: true,
    heroLiteType: 'category',
    filterPrimaryProducts: false,
    fallbackToAll: false,
    variantType: 'category',
    contextData: { category },
    
    heroLite: {
      show: true,
      height: 150,
      backgroundType: 'image',
      backgroundImage: categoryData.heroImage,
      title: categoryData.displayName,
      subtitle: '',
      quickFilters: ['Clear Grade', '12ft Length', 'In Stock'],
    },
    
    carousel: {
      show: true,
      type: 'category-specific',
      height: 350,
      promoCount: 3,
    },
    
    navigation: {
      breadcrumb: [
        { label: 'Home', href: '/' },
        { label: 'Cedar Products', href: '/catalog' },
        { label: categoryData.displayName, href: `/catalog?category=${category}` },
      ],
      showCategoryBar: false,
      showRelatedSearches: false,
      relatedKeywords: [],
    },
    
    filters: {
      sidebarType: 'category-specific',
      showSecondaryBar: true,
      preAppliedFilters: { category: [category] },
      availableFilters: [
        'grade',
        'length',
        'width',
        'surface',
        'price',
        'availability',
      ],
    },
    
    content: {
      showBuyingGuide: false,
      showCategoryDescription: true,
      showApplicationTips: false,
      showSearchSuggestions: false,
    },
    
    ctas: {
      showRequestQuote: true,
      quoteType: 'both',
      showBulkOrder: true,
    },
    
    products: {
      source: 'category-filtered',
      defaultSort: 'best-sellers',
      resultsPerPage: 24,
      inlineQuoteFrequency: 12,
    },
  }
}

/**
 * Variant C: Application Products (Hero-Lite Style)
 */
function getApplicationConfig(application: string): CatalogVariantConfig {
  const appData = getApplicationMetadata(application)
  
  return {
    type: 'application',
    title: appData.displayName,
    showBanner: false,
    showHeroLite: true,
    heroLiteType: 'application',
    filterPrimaryProducts: false,
    fallbackToAll: false,
    variantType: 'application',
    contextData: { application },
    
    heroLite: {
      show: true,
      height: 150,
      backgroundType: 'image',
      backgroundImage: appData.heroImage,
      title: `Shop Cedar for ${appData.displayName}`,
      subtitle: appData.subtitle,
      quickFilters: ['Budget-Friendly', 'Professional Grade'],
    },
    
    carousel: {
      show: true,
      type: 'application-specific',
      height: 350,
      promoCount: 3,
    },
    
    navigation: {
      breadcrumb: [
        { label: 'Home', href: '/' },
        { label: 'Shop by Application', href: '/catalog' },
        { label: appData.displayName, href: `/catalog?application=${application}` },
      ],
      showCategoryBar: false,
      showRelatedSearches: false,
      relatedKeywords: [],
    },
    
    filters: {
      sidebarType: 'cross-category',
      showSecondaryBar: true,
      preAppliedFilters: { application: [application] },
      availableFilters: [
        'product-type',
        'budget-range',
        'project-size',
        'difficulty-level',
        'grade',
        'availability',
      ],
    },
    
    content: {
      showBuyingGuide: true,
      showCategoryDescription: false,
      showApplicationTips: true,
      showSearchSuggestions: false,
    },
    
    ctas: {
      showRequestQuote: true,
      quoteType: 'both',
      showBulkOrder: true,
    },
    
    products: {
      source: 'application-filtered',
      defaultSort: 'relevance',
      resultsPerPage: 24,
      inlineQuoteFrequency: 12,
    },
  }
}

/**
 * Variant D: Search Results
 */
function getSearchConfig(searchQuery: string): CatalogVariantConfig {
  return {
    type: 'search',
    title: 'Search Results',
    showBanner: false,
    showHeroLite: false,
    filterPrimaryProducts: false,
    fallbackToAll: false,
    variantType: 'search',
    contextData: { searchQuery },
    
    heroLite: {
      show: false,
      height: 0,
      backgroundType: 'none',
      title: '',
      subtitle: '',
      quickFilters: [],
    },
    
    carousel: {
      show: true,
      type: 'general',
      height: 300,
      promoCount: 3,
    },
    
    navigation: {
      breadcrumb: [
        { label: 'Home', href: '/' },
        { label: 'Search Results', href: `/catalog?search=${searchQuery}` },
      ],
      showCategoryBar: false,
      showRelatedSearches: true,
      relatedKeywords: generateRelatedSearches(searchQuery),
    },
    
    filters: {
      sidebarType: 'full',
      showSecondaryBar: true,
      preAppliedFilters: {},
      availableFilters: [
        'category',
        'price',
        'grade',
        'dimensions',
        'availability',
        'rating',
        'match-type',
      ],
    },
    
    content: {
      showBuyingGuide: false,
      showCategoryDescription: false,
      showApplicationTips: false,
      showSearchSuggestions: true,
    },
    
    ctas: {
      showRequestQuote: true,
      quoteType: 'both',
      showBulkOrder: true,
    },
    
    products: {
      source: 'search-results',
      defaultSort: 'relevance',
      resultsPerPage: 24,
      inlineQuoteFrequency: 8,
    },
  }
}

/**
 * Helper: Get category metadata
 */
function getCategoryMetadata(category: string) {
  const categories: Record<string, any> = {
    'decking': {
      displayName: 'Cedar Decking',
      heroImage: 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=1400&h=300&fit=crop',
    },
    'siding': {
      displayName: 'Cedar Siding',
      heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&h=300&fit=crop',
    },
    'fencing': {
      displayName: 'Cedar Fencing',
      heroImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&h=300&fit=crop',
    },
  }
  
  return categories[category] || {
    displayName: category.charAt(0).toUpperCase() + category.slice(1),
    heroImage: 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=1400&h=300&fit=crop',
  }
}

/**
 * Helper: Get application metadata
 */
function getApplicationMetadata(application: string) {
  const applications: Record<string, any> = {
    'deck-building': {
      displayName: 'Deck Building',
      subtitle: 'Everything you need for your perfect outdoor deck',
      heroImage: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1400&h=300&fit=crop',
    },
    'home-siding': {
      displayName: 'Home Siding',
      subtitle: 'Transform your home exterior with premium cedar',
      heroImage: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1400&h=300&fit=crop',
    },
    'pergola': {
      displayName: 'Pergola Construction',
      subtitle: 'Create stunning outdoor living spaces',
      heroImage: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1400&h=300&fit=crop',
    },
  }
  
  return applications[application] || {
    displayName: application.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    subtitle: 'Quality cedar products for your project',
    heroImage: 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=1400&h=300&fit=crop',
  }
}

/**
 * Helper: Generate related searches
 */
function generateRelatedSearches(query: string): string[] {
  // Simple related search generation - can be enhanced with ML/AI
  const baseTerms = query.toLowerCase().split(' ')
  
  return [
    `${query} premium`,
    `${query} bulk`,
    `${query} wholesale`,
    `best ${query}`,
    `${query} near me`,
  ].slice(0, 5)
}
