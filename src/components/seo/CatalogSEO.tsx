/**
 * SEO component for catalog pages
 * Handles meta tags, canonical URLs, and structured data
 */

import Head from 'next/head'
import { CatalogSEOConfig } from '@/lib/seo/catalog-seo'

interface CatalogSEOProps {
  config: CatalogSEOConfig
  structuredData?: any
  breadcrumbData?: any
}

export function CatalogSEO({ config, structuredData, breadcrumbData }: CatalogSEOProps) {
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{config.title}</title>
      <meta name="description" content={config.description} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={config.canonicalUrl} />
      
      {/* Robots Meta Tags */}
      {(config.noindex || config.nofollow) && (
        <meta 
          name="robots" 
          content={`${config.noindex ? 'noindex' : 'index'},${config.nofollow ? 'nofollow' : 'follow'}`} 
        />
      )}
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={config.title} />
      <meta property="og:description" content={config.description} />
      <meta property="og:url" content={config.canonicalUrl} />
      <meta property="og:type" content="website" />
      {config.ogImage && <meta property="og:image" content={config.ogImage} />}
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={config.title} />
      <meta name="twitter:description" content={config.description} />
      {config.ogImage && <meta name="twitter:image" content={config.ogImage} />}
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      
      {breadcrumbData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
        />
      )}
    </Head>
  )
}

/**
 * Metadata export for Next.js 13+ App Router
 */
export function generateCatalogMetadata(config: CatalogSEOConfig) {
  return {
    title: config.title,
    description: config.description,
    alternates: {
      canonical: config.canonicalUrl,
    },
    robots: {
      index: !config.noindex,
      follow: !config.nofollow,
      googleBot: {
        index: !config.noindex,
        follow: !config.nofollow,
      },
    },
    openGraph: {
      title: config.title,
      description: config.description,
      url: config.canonicalUrl,
      type: 'website',
      images: config.ogImage ? [{ url: config.ogImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: config.title,
      description: config.description,
      images: config.ogImage ? [config.ogImage] : [],
    },
  }
}

