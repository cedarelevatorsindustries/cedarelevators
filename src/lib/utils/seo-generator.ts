/**
 * SEO Metadata Generation Utility
 * Generates SEO-friendly metadata for products
 */

/**
 * Generates a URL-friendly slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100) // Limit length
}

/**
 * Generates meta title with brand suffix
 * Format: {product_title} | Cedar Elevator Components
 * Max length: 60 characters
 */
export function generateMetaTitle(productTitle: string): string {
  const suffix = ' | Cedar Elevator Components'
  const maxLength = 60
  const availableLength = maxLength - suffix.length
  
  let title = productTitle
  if (title.length > availableLength) {
    title = title.substring(0, availableLength - 3) + '...'
  }
  
  return title + suffix
}

/**
 * Generates meta description
 * Format: Buy {product_title} for {application}. Suitable for {elevator_types}.
 * Max length: 160 characters
 */
export function generateMetaDescription(
  productTitle: string,
  applicationName?: string,
  elevatorTypes?: string[]
): string {
  const maxLength = 160
  
  let description = `Buy ${productTitle}`
  
  if (applicationName) {
    description += ` for ${applicationName}`
  }
  
  if (elevatorTypes && elevatorTypes.length > 0) {
    const types = elevatorTypes.slice(0, 3).join(', ')
    description += `. Suitable for ${types}`
  }
  
  description += ' elevators. High-quality elevator components from Cedar Elevator Industries.'
  
  if (description.length > maxLength) {
    description = description.substring(0, maxLength - 3) + '...'
  }
  
  return description
}

/**
 * Generates Open Graph image URL
 * Uses primary product image if available, otherwise placeholder
 */
export function generateOGImage(primaryImageUrl?: string): string {
  return primaryImageUrl || '/images/product-placeholder.png'
}
