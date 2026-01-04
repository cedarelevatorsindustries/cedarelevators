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


export default function BannersPage() {
  const { data, isLoading, refetch } = useBanners({ placement: 'hero-carousel' })
  const deleteMutation = useDeleteBanner()
  const toggleMutation = useToggleBannerStatus()

  const banners = data?.banners || []

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
            <h1 className="text-3xl font-bold text-gray-900">Catalog Carousel</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage catalog carousel banners for product discovery navigation
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
                  Get started by creating your first carousel banner for product discovery.
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

