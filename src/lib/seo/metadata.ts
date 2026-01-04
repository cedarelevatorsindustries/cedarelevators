/**
 * SEO Metadata Utilities
 * Generates metadata for pages
 */

import { Metadata } from 'next'

const SITE_NAME = 'Cedar Elevators'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cedarelevators.com'
const SITE_DESCRIPTION = "India's leading B2B marketplace for premium elevator components"

export interface SEOConfig {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  keywords?: string[]
  noindex?: boolean
  canonical?: string
}

/**
 * Generate metadata for pages
 */
export function generateMetadata(config: SEOConfig = {}): Metadata {
  const {
    title,
    description = SITE_DESCRIPTION,
    image = `${SITE_URL}/og-image.png`,
    url = SITE_URL,
    type = 'website',
    keywords = [],
    noindex = false,
    canonical,
  } = config

  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    robots: noindex ? 'noindex, nofollow' : 'index, follow',
    alternates: {
      canonical: canonical || url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title || SITE_NAME,
        },
      ],
      locale: 'en_IN',
      type: type === 'product' ? 'website' : type,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: '@cedarelevators',
    },
    other: {
      'fb:app_id': process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
    },
  }
}

/**
 * Generate product metadata
 */
export function generateProductMetadata(product: {
  name: string
  description?: string
  image?: string
  price: number
  slug: string
}): Metadata {
  return generateMetadata({
    title: product.name,
    description: product.description || `Buy ${product.name} at Cedar Elevators`,
    image: product.image,
    url: `${SITE_URL}/products/${product.slug}`,
    type: 'product',
    keywords: [product.name, 'elevator', 'lift', 'components'],
  })
}

/**
 * Generate category metadata
 */
export function generateCategoryMetadata(category: {
  name: string
  description?: string
  slug: string
}): Metadata {
  return generateMetadata({
    title: category.name,
    description: category.description || `Shop ${category.name} at Cedar Elevators`,
    url: `${SITE_URL}/categories/${category.slug}`,
    keywords: [category.name, 'elevator parts', 'lift components'],
  })
}

