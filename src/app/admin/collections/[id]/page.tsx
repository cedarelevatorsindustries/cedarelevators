"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Loader2, Package, Eye, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import { useCollection } from "@/hooks/queries/useCollections"
import { useMemo } from "react"

export default function CollectionDetailPage({ params }: { params: { id: string } }) {
  const { data: collectionData, isLoading: isLoadingCollection } = useCollection(params.id)

  const collection = collectionData?.collection

  // Get products that have assigned themselves to this collection
  const assignedProducts = useMemo(() => {
    if (!collection || !collection.products) return []
    return collection.products
  }, [collection])

  if (isLoadingCollection) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <p className="text-gray-600">Collection not found</p>
        <Button variant="outline" asChild>
          <Link href="/admin/collections">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Collections
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {collection.title}
              </h1>
              <Badge variant={collection.is_active ? "default" : "secondary"} className={collection.is_active ? "bg-green-100 text-green-800" : ""}>
                {collection.is_active ? "Active" : "Inactive"}
              </Badge>
              {collection.is_featured && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
                  Featured
                </Badge>
              )}
            </div>
            <p className="text-gray-600">
              Collection details and assigned products
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" asChild>
              <Link href="/admin/collections">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white" asChild>
              <Link href={`/admin/collections/${params.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Collection
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Collection Details */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Collection Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Slug</p>
                  <p className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                    {collection.slug}
                  </p>
                </div>

                {collection.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Description</p>
                    <p className="text-sm text-gray-900">{collection.description}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Type</p>
                  <Badge variant="outline">{collection.type}</Badge>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Sort Order</p>
                  <p className="text-sm text-gray-900">{collection.sort_order}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Created</p>
                  <p className="text-sm text-gray-900">
                    {new Date(collection.created_at).toLocaleDateString()}
                  </p>
                </div>

                {collection.updated_at && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Last Updated</p>
                    <p className="text-sm text-gray-900">
                      {new Date(collection.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {collection.image_url && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Collection Image
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg overflow-hidden border border-gray-200">
                    <img 
                      src={collection.image_url} 
                      alt={collection.image_alt || collection.title}
                      className="w-full h-auto"
                    />
                  </div>
                  {collection.image_alt && (
                    <p className="text-xs text-gray-500 mt-2">Alt: {collection.image_alt}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {(collection.meta_title || collection.meta_description) && (
              <Card>
                <CardHeader>
                  <CardTitle>SEO Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {collection.meta_title && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Meta Title</p>
                      <p className="text-sm text-gray-900">{collection.meta_title}</p>
                    </div>
                  )}
                  {collection.meta_description && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Meta Description</p>
                      <p className="text-sm text-gray-900">{collection.meta_description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Assigned Products */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Assigned Products
                      <Badge variant="secondary" className="ml-2">
                        {assignedProducts.length}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Products that have assigned themselves to this collection
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingCollection ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
                  </div>
                ) : assignedProducts.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">No products assigned yet</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Products will appear here when they assign themselves to this collection in their Organization tab.
                      </p>
                    </div>
                    <Button variant="outline" asChild className="mt-4">
                      <Link href="/admin/products/create">
                        Create Product
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Info Banner */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <svg className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-blue-900">
                          <p className="font-medium">Read-Only View</p>
                          <p className="text-blue-700 mt-1">
                            You cannot add/remove products here. Products manage their own collection assignments in the Product form's Organization tab.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Products List */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      {assignedProducts.map((productCollection: any) => {
                        const product = productCollection.product
                        if (!product) return null
                        
                        return (
                          <Card key={product.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex gap-4">
                                {/* Product Image */}
                                <div className="h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                  {product.thumbnail ? (
                                    <img 
                                      src={product.thumbnail} 
                                      alt={product.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center">
                                      <Package className="h-8 w-8 text-gray-400" />
                                    </div>
                                  )}
                                </div>

                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-900 truncate">
                                    {product.name}
                                  </h4>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {product.slug || 'No slug'}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    {product.price && (
                                      <span className="text-sm font-semibold text-orange-600">
                                        ${product.price.toFixed(2)}
                                      </span>
                                    )}
                                    <Badge 
                                      variant={product.status === 'active' ? 'default' : 'secondary'}
                                      className={`text-xs ${product.status === 'active' ? 'bg-green-100 text-green-800' : ''}`}
                                    >
                                      {product.status}
                                    </Badge>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-start">
                                  <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/admin/products/${product.id}`}>
                                      <Eye className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
