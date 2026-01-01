import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { ProductEditForm } from '@/modules/admin/product-edit/product-edit-form'
import { getProduct, getProductVariants, getProductElevatorTypes, getProductCollections } from '@/lib/actions/products'
import { getApplications, getCollections, getElevatorTypes } from '@/lib/actions/catalog'

interface ProductEditPageProps {
  params: { id: string }
}

export default async function ProductEditPage({ params }: ProductEditPageProps) {
  // In Next.js 15+, params is a Promise that must be awaited
  const { id } = await params

  // Fetch all required data in parallel
  const [
    productResult,
    variants,
    productElevatorTypeIds,
    productCollectionIds,
    applicationsResult,
    collectionsResult,
    elevatorTypesResult
  ] = await Promise.all([
    getProduct(id),
    getProductVariants(id),
    getProductElevatorTypes(id),
    getProductCollections(id),
    getApplications(),
    getCollections(),
    getElevatorTypes(),
  ])

  if (!productResult) {
    notFound()
  }

  if (!applicationsResult.success || !collectionsResult.success || !elevatorTypesResult.success) {
    throw new Error('Failed to load form data')
  }

  // Merge the association IDs into the product object
  const product = {
    ...productResult,
    elevator_type_ids: productElevatorTypeIds,
    collection_ids: productCollectionIds
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Suspense fallback={<ProductEditSkeleton />}>
        <ProductEditForm
          product={product}
          applications={applicationsResult.data || []}
          collections={collectionsResult.data || []}
          elevatorTypes={elevatorTypesResult.data || []}
          variants={variants}
        />
      </Suspense>
    </div>
  )
}

function ProductEditSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-gray-200 rounded animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="h-96 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="h-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}