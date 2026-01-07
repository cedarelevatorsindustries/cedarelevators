"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Wrench, Package, Edit, Trash2, LoaderCircle, RefreshCw, Search, Eye } from "lucide-react"
import Link from "next/link"
import { useElevatorTypes, useDeleteElevatorType, useElevatorTypeStats } from "@/hooks/queries/useElevatorTypes"
import type { ElevatorTypeWithStats } from "@/lib/types/elevator-types"

export default function ElevatorTypesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const { data, isLoading, refetch } = useElevatorTypes()
  const { data: statsData } = useElevatorTypeStats()
  const deleteMutation = useDeleteElevatorType()

  const elevatorTypes = data?.elevatorTypes || []
  const stats = statsData?.stats || { total: 0, active: 0, inactive: 0 }

  // Filter elevator types
  const filteredElevatorTypes = elevatorTypes.filter((type: ElevatorTypeWithStats) => {
    const matchesSearch = !searchQuery ||
      type.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (type.description && type.description.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || type.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this elevator type? This action cannot be undone.')) return
    await deleteMutation.mutateAsync(id)
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Elevator Types</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage elevator type classifications
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
              <Link href="/admin/elevator-types/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Elevator Type
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
              <Wrench className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <p className="text-xs text-gray-500 mt-1">All elevator types</p>
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
              <Package className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {elevatorTypes.reduce((sum: number, type: ElevatorTypeWithStats) => sum + (type.product_count || 0), 0)}
              </div>
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
                    placeholder="Search elevator types..."
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
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Elevator Types List */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900">
              All Elevator Types ({filteredElevatorTypes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <LoaderCircle className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : filteredElevatorTypes.length === 0 ? (
              <div className="text-center py-12">
                <Wrench className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-base font-medium text-gray-900 mb-2">No elevator types found</h3>
                <p className="text-sm text-gray-500 mb-6">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your filters."
                    : "Get started by creating your first elevator type."}
                </p>
                <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Link href="/admin/elevator-types/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Elevator Type
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredElevatorTypes.map((type: ElevatorTypeWithStats, index: number) => (
                  <div
                    key={type.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-sm transition-all bg-gradient-to-r from-orange-50/30 to-white"
                  >
                    <Link href={`/admin/elevator-types/${type.id}`} className="flex items-center gap-4 min-w-0 flex-1 cursor-pointer group">
                      {type.thumbnail_image ? (
                        <img
                          src={type.thumbnail_image}
                          alt={type.title}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border-2 border-orange-100 group-hover:border-orange-300 transition-colors"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg flex items-center justify-center flex-shrink-0 border-2 border-orange-200 group-hover:border-orange-300 transition-colors">
                          <Wrench className="h-8 w-8 text-orange-600" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-orange-600 transition-colors">
                          {type.title}
                        </h3>
                        {type.subtitle && (
                          <p className="text-sm text-gray-600 mb-1">{type.subtitle}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {type.product_count || 0} products
                          </span>
                        </div>
                      </div>
                    </Link>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <Badge
                        variant="outline"
                        className={type.status === "active"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : type.status === "draft"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : "bg-gray-50 text-gray-700 border-gray-200"}
                      >
                        {type.status}
                      </Badge>

                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-orange-100" asChild>
                          <Link href={`/admin/elevator-types/${type.id}`}>
                            <Eye className="h-4 w-4 text-orange-600" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100" asChild>
                          <Link href={`/admin/elevator-types/create?id=${type.id}`}>
                            <Edit className="h-4 w-4 text-gray-600" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-50"
                          onClick={() => handleDelete(type.id)}
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
      </div>
    </div>
  )
}
