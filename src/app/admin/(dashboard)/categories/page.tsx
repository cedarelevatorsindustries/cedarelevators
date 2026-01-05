"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination } from "@/components/ui/pagination"
import { Plus, FolderTree, Package, Eye, Edit, Trash2, ChevronRight, LoaderCircle, RefreshCw, Search } from "lucide-react"
import Link from "next/link"
import { useCategories, useCategoryStats, useDeleteCategory } from "@/hooks/queries/useCategories"
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
    if (!confirm('Are you sure you want to delete this category?')) return
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
              Manage your 3-layer category structure
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
        <div className="grid gap-4 md:grid-cols-5">
          <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Applications</CardTitle>
              <FolderTree className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.applications}</div>
              <p className="text-xs text-gray-500 mt-1">Top level</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Categories</CardTitle>
              <FolderTree className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.categories}</div>
              <p className="text-xs text-gray-500 mt-1">Mid level</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Subcategories</CardTitle>
              <FolderTree className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.subcategories}</div>
              <p className="text-xs text-gray-500 mt-1">Bottom level</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
              <Eye className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <p className="text-xs text-gray-500 mt-1">All categories</p>
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
                {categories.map((application: CategoryWithChildren) => (
                  <div key={application.id} className="space-y-2">
                    {/* Application Level */}
                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all bg-white">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        {application.image_url ? (
                          <img src={application.image_url} alt={application.name} className="w-12 h-12 rounded object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-12 bg-orange-50 rounded flex items-center justify-center flex-shrink-0">
                            <FolderTree className="h-6 w-6 text-orange-500" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900">{application.name}</h3>
                            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                              Application
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 truncate">{application.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900">{application.product_count || 0}</p>
                          <p className="text-xs text-gray-500">Products</p>
                        </div>

                        <Badge
                          variant="outline"
                          className={application.status === "active"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-gray-50 text-gray-700 border-gray-200"}
                        >
                          {application.status}
                        </Badge>

                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100" asChild>
                            <Link href={`/admin/categories/${application.id}/edit`}>
                              <Edit className="h-4 w-4 text-gray-600" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-red-50"
                            onClick={() => handleDelete(application.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Categories & Subcategories */}
                    {application.children && application.children.length > 0 && (
                      <div className="ml-8 space-y-2">
                        {application.children.map((category) => (
                          <div key={category.id} className="space-y-2">
                            {/* Category Level */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-gray-800 text-sm">{category.name}</h4>
                                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                      Category
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 flex-shrink-0">
                                <span className="text-sm text-gray-600">{category.product_count || 0}</span>
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-blue-100" asChild>
                                    <Link href={`/admin/categories/${category.id}/edit`}>
                                      <Edit className="h-3 w-3 text-gray-600" />
                                    </Link>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 hover:bg-red-50"
                                    onClick={() => handleDelete(category.id)}
                                  >
                                    <Trash2 className="h-3 w-3 text-red-600" />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* Subcategories */}
                            {category.children && category.children.length > 0 && (
                              <div className="ml-8 space-y-1">
                                {category.children.map((subcategory) => (
                                  <div key={subcategory.id} className="flex items-center justify-between p-2 rounded bg-purple-50/50 border border-purple-100">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                      <ChevronRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                      <span className="text-sm text-gray-700">{subcategory.name}</span>
                                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                        Sub
                                      </Badge>
                                    </div>

                                    <div className="flex items-center gap-3 flex-shrink-0">
                                      <span className="text-xs text-gray-600">{subcategory.product_count || 0}</span>
                                      <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-purple-100" asChild>
                                          <Link href={`/admin/categories/${subcategory.id}/edit`}>
                                            <Edit className="h-3 w-3 text-gray-600" />
                                          </Link>
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0 hover:bg-red-50"
                                          onClick={() => handleDelete(subcategory.id)}
                                        >
                                          <Trash2 className="h-3 w-3 text-red-600" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
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
