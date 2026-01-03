/**
 * SEO utilities for catalog pages with filtering
 * Handles canonical URLs, meta tags, and structured data
 */

import { Product } from '@/lib/types/domain'
import { FilterParams } from '@/lib/services/filterService'

export interface CatalogSEOConfig {
  title: string
  description: string
  canonicalUrl: string
  noindex?: boolean
  nofollow?: boolean
  ogImage?: string
}

/**
 * Generate SEO config for catalog pages
 * Controls indexing based on filter complexity
 */
export function generateCatalogSEO(
  baseUrl: string,
  filters: FilterParams,
  totalProducts: number,
  categoryName?: string
): CatalogSEOConfig {
  const hasFilters = Object.keys(filters).length > 0
  const filterCount = countActiveFilters(filters)
  
  // Base configuration
  let config: CatalogSEOConfig = {
    title: categoryName 
      ? `${categoryName} - Cedar Elevator Components`
      : 'Browse All Products - Cedar Elevators',
    description: categoryName
      ? `Explore ${totalProducts} premium ${categoryName} from Cedar Elevators. ISO certified quality with pan-India delivery.`
      : `Browse ${totalProducts} premium elevator components. ISO certified quality, competitive prices, and reliable delivery.`,
    canonicalUrl: baseUrl,
  }

  // Handle filtered pages
  if (hasFilters) {
    // Single simple filter: Allow indexing with rel=canonical to base
    if (filterCount === 1 && (filters.category || filters.application)) {
      config.canonicalUrl = baseUrl
      config.title = `${config.title} - Filtered Results`
    }
    // Multiple or complex filters: Noindex to avoid duplicate content
    else if (filterCount > 1) {
      config.noindex = true
      config.nofollow = true
      config.title = `${config.title} - ${filterCount} Filters Applied`
    }
    // Price/stock only filters: Noindex
    else if (filters.price_min || filters.price_max || filters.in_stock) {
      config.noindex = true
      config.canonicalUrl = baseUrl
    }
  }

  return config
}

/**
 * Count active filters (excluding pagination and sort)
 */
function countActiveFilters(filters: FilterParams): number {
  let count = 0
  
  if (filters.category) count += Array.isArray(filters.category) ? filters.category.length : 1
  if (filters.application) count += Array.isArray(filters.application) ? filters.application.length : 1
  if (filters.price_min || filters.price_max) count++
  if (filters.in_stock || filters.out_of_stock) count++
  if (filters.voltage) count += Array.isArray(filters.voltage) ? filters.voltage.length : 1
  if (filters.load_capacity_min || filters.load_capacity_max) count++
  if (filters.speed_min || filters.speed_max) count++
  if (filters.rating_min) count++
  
  return count
}

/**
 * Generate structured data (JSON-LD) for product listings
 */
export function generateProductListStructuredData(
  products: Product[],
  categoryName?: string,
  baseUrl?: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: categoryName || 'Products',
    numberOfItems: products.length,
    url: baseUrl,
    itemListElement: products.slice(0, 10).map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        '@id': `${baseUrl}/products/${product.handle || product.id}`,
        name: product.title,
        description: product.description,
        image: product.thumbnail,
        offers: {
          '@type': 'Offer',
          price: product.price?.amount || product.variants?.[0]?.price || 0,
          priceCurrency: 'INR',
          availability: product.status === 'active' 
            ? 'https://schema.org/InStock' 
            : 'https://schema.org/OutOfStock',
        },
      },
    })),
  }
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(
  breadcrumbs: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  }
}

/**
 * Clean URL for canonical tag (remove pagination, sort, etc.)
 */
export function getCanonicalUrl(url: string, preserveFilters: string[] = []): string {
  const urlObj = new URL(url)
  const params = new URLSearchParams(urlObj.search)
  
  // Remove pagination and sort parameters
  params.delete('page')
  params.delete('sort')
  params.delete('limit')
  params.delete('include_facets')
  
  // Remove non-preserved filters
  if (!preserveFilters.includes('price')) {
    params.delete('price_min')
    params.delete('price_max')
  }
  if (!preserveFilters.includes('stock')) {
    params.delete('in_stock')
    params.delete('out_of_stock')
  }
  
  const queryString = params.toString()
  return `${urlObj.origin}${urlObj.pathname}${queryString ? `?${queryString}` : ''}`
}
