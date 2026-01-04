/**
 * Structured Data (JSON-LD) Generators
 * Creates schema.org structured data for SEO
 */

import { Organization, Product, BreadcrumbList, LocalBusiness, WebSite } from 'schema-dts'

const SITE_NAME = 'Cedar Elevators'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cedarelevators.com'

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema(): Organization {
  return {
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo/logo.png`,
    description: "India's leading B2B marketplace for premium elevator components",
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
      addressLocality: 'Mumbai',
      addressRegion: 'Maharashtra',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-XXXXXXXXXX',
      contactType: 'customer service',
      email: 'support@cedarelevators.com',
    },
    sameAs: [
      'https://www.facebook.com/cedarelevators',
      'https://www.linkedin.com/company/cedarelevators',
      'https://twitter.com/cedarelevators',
    ],
  }
}

/**
 * Generate WebSite schema with search action
 */
export function generateWebSiteSchema(): WebSite {
  return {
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    } as any,
  }
}

/**
 * Generate Product schema
 */
export function generateProductSchema(product: {
  name: string
  description?: string
  image?: string
  price: number
  currency?: string
  sku: string
  brand?: string
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder'
  rating?: number
  reviewCount?: number
}): Product {
  const {
    name,
    description,
    image,
    price,
    currency = 'INR',
    sku,
    brand = SITE_NAME,
    availability = 'InStock',
    rating,
    reviewCount,
  } = product

  return {
    '@type': 'Product',
    name,
    description,
    image,
    sku,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    offers: {
      '@type': 'Offer',
      price: price.toString(),
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
      url: `${SITE_URL}/products/${sku}`,
    },
    ...(rating && reviewCount
      ? {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: rating,
          reviewCount,
        },
      }
      : {}),
  }
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(
  breadcrumbs: Array<{ name: string; url: string }>
): BreadcrumbList {
  return {
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
 * Generate LocalBusiness schema
 */
export function generateLocalBusinessSchema(): LocalBusiness {
  return {
    '@type': 'LocalBusiness',
    name: SITE_NAME,
    image: `${SITE_URL}/logo/logo.png`,
    '@id': SITE_URL,
    url: SITE_URL,
    telephone: '+91-XXXXXXXXXX',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Business Address',
      addressLocality: 'Mumbai',
      addressRegion: 'MH',
      postalCode: '400001',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 19.0760,
      longitude: 72.8777,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    sameAs: [
      'https://www.facebook.com/cedarelevators',
      'https://www.linkedin.com/company/cedarelevators',
    ],
  }
}

/**
 * Wrap schema in script tag for HTML insertion
 */
export function wrapSchema(schema: any): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    ...schema,
  })
}

