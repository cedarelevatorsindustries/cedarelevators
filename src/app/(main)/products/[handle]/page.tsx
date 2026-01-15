/**
 * Product Detail Page
 * Consolidated PDP using unified product card and components
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import ProductDetailPage from '@/modules/products/templates/desktop-pdp-page'
import MobileProductDetailPage from '@/modules/products/templates/mobile-pdp-page'
import { getProductByHandle, listProducts } from '@/lib/data/products'
import { getProductReviews } from '@/lib/actions/reviews'

interface ProductPageProps {
  params: Promise<{
    handle: string
  }>
  searchParams: Promise<{
    from?: string
    category?: string
    application?: string
    search?: string
  }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { handle } = await params

  const product = await getProductByHandle(handle)

  if (!product) {
    return {
      title: 'Product Not Found - Cedar Elevators'
    }
  }

  return {
    title: `${product.title} - Cedar Elevators | Premium Elevator Components`,
    description: product.description || '',
    openGraph: {
      title: product.title || '',
      description: product.description || '',
      images: product.thumbnail ? [product.thumbnail] : [],
      type: 'website'
    }
  }
}

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const { handle } = await params
  const catalogContext = await searchParams

  // Detect mobile device from user-agent
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || ''
  const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent)

  // Get product from Medusa
  const product = await getProductByHandle(handle)

  if (!product) {
    notFound()
  }

  // Get related products (same category)
  const relatedProducts: any[] = []
  if (product.categories && product.categories.length > 0) {
    const categoryId = product.categories[0].id
    const { response } = await listProducts({
      queryParams: {
        category_id: [categoryId],
        limit: 5
      }
    })

    // Filter out current product
    relatedProducts.push(...response.products.filter(p => p.id !== product.id).slice(0, 4))
  }

  // Get bundle products (other products)
  // Get bundle products (other products)
  const { response: bundleResponse } = await listProducts({
    queryParams: { limit: 4 }
  })
  const bundleProducts = bundleResponse.products.filter(p => p.id !== product.id).slice(0, 3)

  // Get reviews
  const { reviews } = await getProductReviews(product.id)
  const productReviews = reviews || []

  if (isMobile) {
    return (
      <MobileProductDetailPage
        product={product}
        relatedProducts={relatedProducts}
        bundleProducts={bundleProducts}
        catalogContext={catalogContext}
        reviews={productReviews}
      />
    )
  }

  return (
    <ProductDetailPage
      product={product}
      relatedProducts={relatedProducts}
      bundleProducts={bundleProducts}
      catalogContext={catalogContext}
      reviews={productReviews}
    />
  )
}
