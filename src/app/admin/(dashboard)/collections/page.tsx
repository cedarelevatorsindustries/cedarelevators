"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination } from "@/components/ui/pagination"
import { Plus, Layers, Package, Eye, EyeOff, Edit, Trash2, LoaderCircle, RefreshCw, Search, Star } from "lucide-react"
import Link from "next/link"
import { useCollections, useDeleteCollection, useToggleCollectionStatus } from "@/hooks/queries/useCollections"
import type { CollectionWithProducts } from "@/lib/types/collections"

export default function CollectionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  const filters = {
    search: searchQuery || undefined,
    type: typeFilter !== 'all' ? (typeFilter as 'manual' | 'automatic') : undefined,
    is_active: statusFilter === 'active' ? true : statusFilter === 'draft' ? false : undefined,
    page: currentPage,
    limit: itemsPerPage
  }

  const { data, isLoading, refetch } = useCollections(filters)
  const deleteMutation = useDeleteCollection()
  const toggleMutation = useToggleCollectionStatus()

  const collections = data?.collections || []
  const stats = data?.stats || { total: 0, active: 0, total_products: 0 }
  const pagination = data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 }

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection?')) return
    await deleteMutation.mutateAsync(id)
  }

  const handleToggleStatus = async (id: string) => {
    await toggleMutation.mutateAsync(id)
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Collections</h1>
            <p className="text-sm text-gray-500 mt-1">
              Create curated product collections for campaigns
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
              <Link href="/admin/collections/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Collection
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Collections</CardTitle>
              <Layers className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <p className="text-xs text-gray-500 mt-1">All collections</p>
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
              <CardTitle className="text-sm font-medium text-gray-600">Products</CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.total_products}</div>
              <p className="text-xs text-gray-500 mt-1">In collections</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search collections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white border-gray-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="automatic">Automatic</SelectItem>
                  </SelectContent>
                </Select>
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

        {/* Collections List */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900">
              All Collections ({collections.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <LoaderCircle className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : collections.length === 0 ? (
              <div className="text-center py-12">
                <Layers className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-base font-medium text-gray-900 mb-2">No collections found</h3>
                <p className="text-sm text-gray-500 mb-6">
                  {searchQuery || typeFilter !== "all" || statusFilter !== "all"
                    ? "Try adjusting your filters."
                    : "Get started by creating your first collection."}
                </p>
                <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Link href="/admin/collections/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Collection
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {collections.map((collection: CollectionWithProducts) => (
                  <div
                    key={collection.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all bg-white"
                  >
                    {/* Icon */}
                    <div className="w-20 h-14 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      <Layers className="h-6 w-6 text-gray-400" />
                    </div>

                    {/* Content - Clickable */}
                    <Link
                      href={`/admin/collections/${collection.id}`}
                      className="flex-1 min-w-0 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 truncate group-hover:text-orange-600 transition-colors">{collection.title}</h3>
                      </div>
                      {collection.description && (
                        <p className="text-sm text-gray-500 truncate">{collection.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        {collection.collection_type === 'category_specific' ? (
                          <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                            Category Specific
                          </Badge>
                        ) : collection.collection_type === 'business_specific' || collection.is_business_only ? (
                          <Badge variant="outline" className="text-xs bg-orange-50 border-orange-200 text-orange-700">
                            Business Specific
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200 text-gray-700">
                            General
                          </Badge>
                        )}
                        <span>{collection.product_count || 0} products</span>
                      </div>
                    </Link>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                        asChild
                      >
                        <Link href={`/admin/collections/${collection.id}/edit`}>
                          <Edit className="h-4 w-4 text-gray-600" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                        onClick={() => handleToggleStatus(collection.id)}
                        disabled={toggleMutation.isPending}
                      >
                        {collection.is_active ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-red-50"
                        onClick={() => handleDelete(collection.id)}
                        disabled={deleteMutation.isPending}
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

        {/* Pagination */}
        {!isLoading && collections.length > 0 && (
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

