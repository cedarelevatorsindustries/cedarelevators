/**
 * Robots.txt Generation
 * Configures search engine crawling rules
 */

import { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cedarelevators.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/*',
          '/api/*',
          '/dashboard/*',
          '/checkout/*',
          '/cart',
          '/sign-in',
          '/sign-up',
          '/*.json$',
          '/private/*',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/*',
          '/api/*',
          '/dashboard/*',
          '/checkout/*',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
