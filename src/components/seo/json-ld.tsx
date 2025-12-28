/**
 * JSON-LD Component
 * Renders structured data in script tag
 */

import Script from 'next/script'

interface JsonLdProps {
  data: any
}

export function JsonLd({ data }: JsonLdProps) {
  const jsonLdString = JSON.stringify({
    '@context': 'https://schema.org',
    ...data,
  })

  return (
    <Script
      id={`json-ld-${Math.random().toString(36).substr(2, 9)}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdString }}
      strategy="beforeInteractive"
    />
  )
}

/**
 * Multiple JSON-LD schemas component
 */
interface JsonLdMultipleProps {
  schemas: any[]
}

export function JsonLdMultiple({ schemas }: JsonLdMultipleProps) {
  return (
    <>
      {schemas.map((schema, index) => (
        <JsonLd key={index} data={schema} />
      ))}
    </>
  )
}
