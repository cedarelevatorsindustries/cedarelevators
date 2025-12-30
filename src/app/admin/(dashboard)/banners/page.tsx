"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Image as ImageIcon, Calendar, Eye, Edit, Trash2, LoaderCircle, RefreshCw, Search, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { useBanners, useDeleteBanner, useToggleBannerStatus } from "@/hooks/queries/useBanners"
import { computeBannerStatus } from "@/lib/types/banners"
import type { BannerWithStatus } from "@/lib/types/banners"
import { BannerPhilosophyCard } from "@/components/admin/banner-philosophy-card"


export default function BannersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filters = {
    search: searchQuery || undefined,
    placement: 'hero-carousel' as const, // Always filter to All Products Carousel
    status: statusFilter !== 'all' ? statusFilter : undefined,
  }

  const { data, isLoading, refetch } = useBanners(filters)
  const deleteMutation = useDeleteBanner()
  const toggleMutation = useToggleBannerStatus()

  const banners = data?.banners || []
  const stats = data?.stats || { total: 0, active: 0, scheduled: 0, expired: 0 }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return
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
            <h1 className="text-3xl font-bold text-gray-900">All Products Carousel</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage homepage carousel banners for product discovery navigation
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
              <Link href="/admin/banners/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Banner
              </Link>
            </Button>
          </div>
        </div>

        {/* Philosophy Card */}
        <BannerPhilosophyCard />

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Banners</CardTitle>
              <ImageIcon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <p className="text-xs text-gray-500 mt-1">All banners</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
              <Eye className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
              <p className="text-xs text-gray-500 mt-1">Currently live</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Scheduled</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.scheduled}</div>
              <p className="text-xs text-gray-500 mt-1">Future dated</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Expired</CardTitle>
              <Calendar className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.expired}</div>
              <p className="text-xs text-gray-500 mt-1">Past end date</p>
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
                    placeholder="Search banners..."
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
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Banners List */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900">
              All Banners ({banners.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <LoaderCircle className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : banners.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-base font-medium text-gray-900 mb-2">No carousel banners found</h3>
                <p className="text-sm text-gray-500 mb-6">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your filters."
                    : "Get started by creating your first carousel banner for product discovery."}
                </p>
                <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Link href="/admin/banners/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Banner
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {banners.map((banner: BannerWithStatus) => {
                  const status = computeBannerStatus(banner)
                  const statusColors: Record<string, string> = {
                    active: 'bg-green-50 text-green-700 border-green-200',
                    scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
                    expired: 'bg-gray-50 text-gray-700 border-gray-200',
                    disabled: 'bg-red-50 text-red-700 border-red-200'
                  }

                  return (
                    <div
                      key={banner.id}
                      className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all bg-white"
                    >
                      {/* Image */}
                      {banner.image_url ? (
                        <img
                          src={banner.image_url}
                          alt={banner.image_alt || banner.title}
                          className="w-24 h-16 rounded object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-24 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900 truncate">{banner.title}</h3>
                          <Badge variant="outline" className={`text-xs ${statusColors[status]}`}>
                            {status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 truncate">{banner.internal_name}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="capitalize">{banner.placement.replace('-', ' ')}</span>
                          {banner.start_date && (
                            <span>Starts: {new Date(banner.start_date).toLocaleDateString()}</span>
                          )}
                          {banner.end_date && (
                            <span>Ends: {new Date(banner.end_date).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-gray-100"
                          asChild
                        >
                          <Link href={`/admin/banners/${banner.id}/edit`}>
                            <Edit className="h-4 w-4 text-gray-600" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-gray-100"
                          onClick={() => handleToggleStatus(banner.id)}
                          disabled={toggleMutation.isPending}
                        >
                          <Eye className={`h-4 w-4 ${banner.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-50"
                          onClick={() => handleDelete(banner.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
