"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination } from "@/components/ui/pagination"
import { Plus, FolderTree, Package, Edit, Trash2, LoaderCircle, RefreshCw, Search, Eye } from "lucide-react"
import Link from "next/link"
import { useCategories, useDeleteCategory, useCategoryStats } from "@/hooks/queries/useCategories"
import type { CategoryWithChildren } from "@/lib/types/categories"

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  const filters = {
    search: searchQuery || undefined,
    status: statusFilter !== 'all' ? (statusFilter as 'active' | 'inactive') : undefined,
    page: currentPage,
    limit: itemsPerPage
  }

  const { data, isLoading, refetch } = useCategories(filters)
  const { data: statsData } = useCategoryStats()
  const deleteMutation = useDeleteCategory()

  const categories = data?.categories || []
  const stats = statsData || { total: 0, active: 0, applications: 0, categories: 0, subcategories: 0, total_products: 0 }
  const pagination = data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This will affect all related subcategories and products.')) return
    await deleteMutation.mutateAsync(id)
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage product categories and subcategories
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
              <Link href="/admin/categories/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Category
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-6">
          <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
              <FolderTree className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <p className="text-xs text-gray-500 mt-1">All categories</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
              <Eye className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
              <p className="text-xs text-gray-500 mt-1">Currently active</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Inactive</CardTitle>
              <Eye className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.total - stats.active}</div>
              <p className="text-xs text-gray-500 mt-1">Hidden from store</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Parents</CardTitle>
              <FolderTree className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.applications || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Top level</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Subcategories</CardTitle>
              <FolderTree className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.subcategories || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Child categories</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Products</CardTitle>
              <Package className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.total_products}</div>
              <p className="text-xs text-gray-500 mt-1">Total products</p>
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
                    placeholder="Search categories..."
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
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories List */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900">
              All Categories ({categories.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <LoaderCircle className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12">
                <FolderTree className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-base font-medium text-gray-900 mb-2">No categories found</h3>
                <p className="text-sm text-gray-500 mb-6">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your filters."
                    : "Get started by creating your first category."}
                </p>
                <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Link href="/admin/categories/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Category
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((category: CategoryWithChildren) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all bg-gradient-to-r from-blue-50/50 to-white"
                  >
                    <Link href={`/admin/categories/${category.slug || category.handle}`} className="flex items-center gap-4 min-w-0 flex-1 cursor-pointer group">
                      {(category.thumbnail || category.icon) ? (
                        <img
                          src={(category.thumbnail || category.icon) as string}
                          alt={category.name || ''}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border-2 border-blue-100 group-hover:border-blue-300 transition-colors"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 border-2 border-blue-200 group-hover:border-blue-300 transition-colors">
                          <FolderTree className="h-8 w-8 text-blue-600" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className="text-sm text-gray-500 truncate mb-2">{category.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <FolderTree className="h-3 w-3" />
                            {category.subcategory_count || 0} subcategories
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {category.product_count || 0} products
                          </span>
                        </div>
                      </div>
                    </Link>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <Badge
                        variant="outline"
                        className={category.is_active
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-gray-50 text-gray-700 border-gray-200"}
                      >
                        {category.is_active ? 'active' : 'inactive'}
                      </Badge>

                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-100" asChild>
                          <Link href={`/admin/categories/${category.slug || category.handle}`}>
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100" asChild>
                          <Link href={`/admin/categories/create?id=${category.id}`}>
                            <Edit className="h-4 w-4 text-gray-600" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-50"
                          onClick={() => handleDelete(category.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {!isLoading && categories.length > 0 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(newLimit) => {
              setItemsPerPage(newLimit)
              setCurrentPage(1) // Reset to page 1 when changing items per page
            }}
          />
        )}
      </div>
    </div>
  )
}
