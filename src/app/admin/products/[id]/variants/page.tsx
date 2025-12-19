import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { VariantsListView } from '@/domains/admin/variants/variants-list-view'
import { getProduct } from '@/lib/actions/products'

interface VariantsListPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ 
    search?: string
    option?: string
    stock?: string
    status?: string
  }>
}

export default async function VariantsListPage({ params, searchParams }: VariantsListPageProps) {
  const { id } = await params
  const filters = await searchParams
  const result = await getProduct(id)
  
  if (!result.success || !result.data) {
    notFound()
  }

  const product = result.data

  return (
    <div className="space-y-6">
      <Suspense fallback={<VariantsListSkeleton />}>
        <VariantsListView 
          product={product}
          filters={{
            search: filters.search,
            option: filters.option,
            stock: filters.stock,
            status: filters.status,
          }}
        />
      </Suspense>
    </div>
  )
}

function VariantsListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="flex gap-4">
        <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="h-96 bg-gray-200 rounded animate-pulse" />
    </div>
  )
}