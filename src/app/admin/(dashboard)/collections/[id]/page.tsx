"use client"

import { use, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SearchableMultiSelect } from "@/components/ui/searchable-multi-select"
import { ArrowLeft, Edit, Loader2, Package, Eye, Image as ImageIcon, X } from "lucide-react"
import Link from "next/link"
import { useCollection } from "@/hooks/queries/useCollections"
import { useCollectionProducts, useAddProductToCollection, useRemoveProductFromCollection } from "@/hooks/queries/useCollectionProducts"
import { toast } from "sonner"
import { useMemo } from "react"
import { useProducts } from "@/hooks/queries/useProducts"
import { useCategory } from "@/hooks/queries/useCategories"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function CollectionDetailPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const { data: collectionData, isLoading: isLoadingCollection } = useCollection(resolvedParams.id)
  const collection = collectionData?.collection

  // Fetch linked category if exists
  const { data: categoryData } = useCategory(collection?.category_id || '')
  const linkedCategoryName = categoryData?.category?.name

  // Fetch products in this collection
  const { data: collectionProducts, isLoading: isLoadingProducts } = useCollectionProducts(resolvedParams.id)

  // Fetch all products for the dropdown
  const { data: allProductsData } = useProducts()
  const allProducts = allProductsData?.products || []

  // Mutations
  const addProductMutation = useAddProductToCollection()
  const removeProductMutation = useRemoveProductFromCollection()

  // Get linked product IDs
  const linkedProductIds = useMemo(() => {
    return collectionProducts?.map((cp: any) => cp.product_id) || []
  }, [collectionProducts])

  // Handle product selection change
  const handleProductChange = async (selectedIds: string[]) => {
    if (!collection?.id) return

    const addedIds = selectedIds.filter(id => !linkedProductIds.includes(id))
    const removedIds = linkedProductIds.filter(id => !selectedIds.includes(id))

    try {
      // Add new products
      for (const productId of addedIds) {
        await addProductMutation.mutateAsync({
          collection_id: collection.id,
          product_id: productId
        })
      }

      // Remove unselected products
      for (const productId of removedIds) {
        const link = collectionProducts?.find((cp: any) => cp.product_id === productId)
        if (link) {
          await removeProductMutation.mutateAsync(link.id)
        }
      }

      if (addedIds.length > 0 || removedIds.length > 0) {
        toast.success('Products updated successfully')
      }
    } catch (error) {
      toast.error('Failed to update products')
    }
  }

  // Handle individual product removal
  const handleRemoveProduct = async (linkId: string) => {
    try {
      await removeProductMutation.mutateAsync(linkId)
      toast.success('Product removed successfully')
    } catch (error) {
      toast.error('Failed to remove product')
    }
  }

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

            </div>
            <p className="text-gray-600">
              Manage collection details and products
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
              <Link href={`/admin/collections/${resolvedParams.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Collection
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Collection Details - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Collection Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Slug</p>
                  <p className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                    {collection.slug}
                  </p>
                </div>

                {collection.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Description</p>
                    <p className="text-sm text-gray-900">{collection.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Type</p>
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline" className="w-fit">
                        {collection.collection_type === 'general' && 'General'}
                        {collection.collection_type === 'category_specific' && 'Category Specific'}
                        {collection.collection_type === 'business_specific' && 'Business Specific'}
                      </Badge>
                      {linkedCategoryName && (
                        <span className="text-xs text-gray-500">
                          linked to: {linkedCategoryName}
                        </span>
                      )}
                    </div>
                  </div>

                  {collection.is_business_only && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Access</p>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                        Business Only
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Sort Order</p>
                    <p className="text-sm text-gray-900">{collection.display_order}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Show to Guest</p>
                    <Badge variant={collection.show_in_guest ? "default" : "secondary"} className={collection.show_in_guest ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}>
                      {collection.show_in_guest ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-0.5">Created</p>
                    <p className="text-xs text-gray-900">
                      {new Date(collection.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {collection.updated_at && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-0.5">Last Updated</p>
                      <p className="text-xs text-gray-900">
                        {new Date(collection.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>



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

          {/* Products - Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Products</CardTitle>
                  <CardDescription>Add and manage products in this collection</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* SearchableMultiSelect for adding products */}
                <SearchableMultiSelect
                  items={allProducts.map((product: any) => ({
                    id: product.id,
                    name: product.name
                  }))}
                  selectedIds={linkedProductIds}
                  onSelectionChange={handleProductChange}
                  placeholder="Search and select products..."
                  emptyMessage="No products found"
                  hideSelectedBadges={true}
                />

                {/* Display linked products */}
                {isLoadingProducts ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                  </div>
                ) : collectionProducts && collectionProducts.length > 0 ? (
                  <div className="space-y-3 mt-4">
                    {collectionProducts.map((cp: any) => {
                      const product = cp.product
                      if (!product) return null

                      return (
                        <div
                          key={cp.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-sm transition-all bg-white group"
                        >
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                          >
                            {product.thumbnail_url || product.thumbnail ? (
                              <img
                                src={product.thumbnail_url || product.thumbnail}
                                alt={product.name}
                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-gray-200 group-hover:border-orange-300 transition-colors"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                                {product.name}
                              </h4>
                              <p className="text-xs text-gray-500 truncate">{product.slug}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {product.price && (
                                <span className="text-sm font-semibold text-gray-900">
                                  ₹{product.price.toLocaleString('en-IN')}
                                </span>
                              )}
                              <Badge
                                variant="outline"
                                className={product.status === 'active'
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-gray-50 text-gray-700 border-gray-200"}
                              >
                                {product.status}
                              </Badge>
                            </div>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                            onClick={() => handleRemoveProduct(cp.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No products in this collection yet</p>
                    <p className="text-xs text-gray-400 mt-1">Use the dropdown above to add products</p>
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
