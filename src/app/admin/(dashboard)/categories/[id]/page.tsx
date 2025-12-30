"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Loader2, Package, Eye, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import { useCategory } from "@/hooks/queries/useCategories"
import { useProducts } from "@/hooks/queries/useProducts"
import { useMemo } from "react"

export default function CategoryDetailPage({ params }: { params: { id: string } }) {
  const { data: categoryData, isLoading: isLoadingCategory } = useCategory(params.id)
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({}, 1, 1000)

  const category = categoryData?.category
  const allProducts = productsData?.products || []

  // Find products that have assigned themselves to this category
  // Using the NEW category_id field (Cedar Interconnection Logic)
  const assignedProducts = useMemo(() => {
    if (!category) return []
    
    return allProducts.filter(p => {
      // Check new hierarchy fields first (Cedar Interconnection Logic)
      if (p.category_id === params.id || 
          p.application_id === params.id || 
          p.subcategory_id === params.id) {
        return true
      }
      
      // Fallback to legacy category field for backward compatibility
      if (p.category === params.id) {
        return true
      }
      
      return false
    })
  }, [allProducts, params.id, category])

  if (isLoadingCategory) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <p className="text-gray-600">Category not found</p>
        <Button variant="outline" asChild>
          <Link href="/admin/categories">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
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
                {category.name}
              </h1>
              <Badge variant={category.is_active ? "default" : "secondary"} className={category.is_active ? "bg-green-100 text-green-800" : ""}>
                {category.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-gray-600">
              Category details and assigned products
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" asChild>
              <Link href="/admin/categories">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white" asChild>
              <Link href={`/admin/categories/${params.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Category
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Category Details */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Slug</p>
                  <p className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                    {category.slug}
                  </p>
                </div>

                {category.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Description</p>
                    <p className="text-sm text-gray-900">{category.description}</p>
                  </div>
                )}

                {category.application && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Application Type</p>
                    <Badge variant="outline">{category.application}</Badge>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Sort Order</p>
                  <p className="text-sm text-gray-900">{category.sort_order}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Created</p>
                  <p className="text-sm text-gray-900">
                    {new Date(category.created_at).toLocaleDateString()}
                  </p>
                </div>

                {category.updated_at && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Last Updated</p>
                    <p className="text-sm text-gray-900">
                      {new Date(category.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {category.image_url && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Category Image
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg overflow-hidden border border-gray-200">
                    <img 
                      src={category.image_url} 
                      alt={category.image_alt || category.name}
                      className="w-full h-auto"
                    />
                  </div>
                  {category.image_alt && (
                    <p className="text-xs text-gray-500 mt-2">Alt: {category.image_alt}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {(category.meta_title || category.meta_description) && (
              <Card>
                <CardHeader>
                  <CardTitle>SEO Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {category.meta_title && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Meta Title</p>
                      <p className="text-sm text-gray-900">{category.meta_title}</p>
                    </div>
                  )}
                  {category.meta_description && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Meta Description</p>
                      <p className="text-sm text-gray-900">{category.meta_description}</p>
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
                      Products that have assigned themselves to this category
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingProducts ? (
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
                        Products will appear here when they assign themselves to this category in their Organization tab.
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
                            You cannot add/remove products here. Products manage their own category assignments in the Product form's Organization tab.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Products List */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      {assignedProducts.map((product) => (
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
                                  {product.sku || 'No SKU'}
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
                      ))}
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
