import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { ProductDetailView } from '@/modules/admin/product-detail/product-detail-view'
import { getProductWithVariants } from '@/lib/actions/products'

interface ProductDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  try {
    const { id } = await params
    const product = await getProductWithVariants(id)

    if (!product) {
      console.log('Product not found for ID:', id)
      notFound()
    }

    return (
      <div className="space-y-6">
        <Suspense fallback={<ProductDetailSkeleton />}>
          <ProductDetailView
            product={product}
            variants={product.product_variants || []}
          />
        </Suspense>
      </div>
    )
  } catch (error) {
    console.error('Error in ProductDetailPage:', error)
    notFound()
  }
}

function ProductDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-gray-200 rounded animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="h-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}