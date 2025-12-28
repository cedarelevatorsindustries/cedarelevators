"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Package, Edit, Trash2, Eye, EyeOff, Search, RefreshCw, Loader2, AlertTriangle, Archive, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useProducts, useProductStats, useDeleteProduct, useUpdateProduct } from "@/hooks/queries/useProducts"
import type { Product } from "@/lib/types/products"

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Note: We'll implement pagination later, for now fetching page 1
  const { data, isLoading, refetch } = useProducts({
    search: searchQuery || undefined,
    status: statusFilter !== 'all' ? (statusFilter as 'active' | 'draft' | 'archived') : undefined,
  })

  const { data: stats } = useProductStats()
  const deleteMutation = useDeleteProduct()
  const updateMutation = useUpdateProduct()

  const products = data?.products || []
  const productStats = stats || { total: 0, active: 0, draft: 0, archived: 0, out_of_stock: 0, low_stock: 0 }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    await deleteMutation.mutateAsync(id)
  }

  const handleToggleStatus = async (product: Product) => {
    const newStatus = product.status === 'active' ? 'draft' : 'active'
    await updateMutation.mutateAsync({ id: product.id, data: { status: newStatus } })
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your elevator components catalog
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className="bg-white border-gray-200 hover:bg-gray-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600 text-white shadow-sm">
              <Link href="/admin/products/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Product
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Products</CardTitle>
              <Package className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{productStats.total}</div>
              <p className="text-xs text-gray-500 mt-1">Catalog items</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
              <Eye className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{productStats.active}</div>
              <p className="text-xs text-gray-500 mt-1">Live on store</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Drafts</CardTitle>
              <Edit className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{productStats.draft}</div>
              <p className="text-xs text-gray-500 mt-1">Work in progress</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{productStats.low_stock}</div>
              <p className="text-xs text-gray-500 mt-1">Less than 10 items</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Out of Stock</CardTitle>
              <Archive className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{productStats.out_of_stock}</div>
              <p className="text-xs text-gray-500 mt-1">Needs action</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products by name or SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white border-gray-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products List */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900">
              All Products ({products.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-base font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-sm text-gray-500 mb-6">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your filters."
                    : "Get started by creating your first product."}
                </p>
                <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Link href="/admin/products/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Product
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product: Product) => (
                  <div
                    key={product.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all bg-white"
                  >
                    {/* Image */}
                    {product.thumbnail || (product.images && product.images.length > 0) ? (
                      <img
                        src={product.thumbnail || product.images[0].url}
                        alt={product.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded object-cover flex-shrink-0 bg-gray-100"
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                        <Package className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Title & SKU */}
                      <div className="col-span-1 lg:col-span-2">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900 truncate" title={product.name}>{product.name}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                            {product.sku || 'NO SKU'}
                          </span>
                        </div>
                      </div>

                      {/* Stock & Price */}
                      <div className="flex flex-row sm:flex-col justify-between sm:justify-center gap-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${product.stock_quantity === 0 ? 'bg-red-500' :
                              product.stock_quantity < 10 ? 'bg-yellow-500' : 'bg-green-500'
                            }`} />
                          <span className="text-sm font-medium text-gray-700">
                            {product.stock_quantity} in stock
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          {product.price ? `₹${product.price.toLocaleString('en-IN')}` : 'Price not set'}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex items-center sm:justify-start lg:justify-end">
                        <Badge
                          variant="outline"
                          className={`capitalize ${product.status === 'active'
                              ? "bg-green-50 text-green-700 border-green-200"
                              : product.status === 'draft'
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-gray-50 text-gray-700 border-gray-200"
                            }`}
                        >
                          {product.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:ml-4 flex-shrink-0 justify-end mt-2 sm:mt-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                        asChild
                        title="View on Store"
                      >
                        <Link href={`/products/${product.slug}`} target="_blank">
                          <ExternalLink className="h-4 w-4 text-gray-400" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                        asChild
                        title="Edit Product"
                      >
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Edit className="h-4 w-4 text-gray-600" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                        onClick={() => handleToggleStatus(product)}
                        disabled={updateMutation.isPending}
                        title={product.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {product.status === 'active' ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-red-50"
                        onClick={() => handleDelete(product.id)}
                        disabled={deleteMutation.isPending}
                        title="Delete Product"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
