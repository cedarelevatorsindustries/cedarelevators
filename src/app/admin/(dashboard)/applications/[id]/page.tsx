"use client"

import { use, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Edit, Loader2, FolderTree, Package, Plus, X, Calendar, Link as LinkIcon, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import { useApplication } from "@/hooks/queries/useApplications"
import { format } from "date-fns"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ApplicationDetailPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const { data, isLoading } = useApplication(resolvedParams.id)
  const application = data?.application
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Application not found</h3>
        <Button asChild variant="outline">
          <Link href="/admin/applications">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Applications
          </Link>
        </Button>
      </div>
    )
  }

  const appName = application.title || application.name
  const appSlug = application.handle || application.slug
  const appThumbnail = application.thumbnail || application.thumbnail_image || application.image_url
  const appBanner = application.banner_url || application.banner_image
  const metaTitle = application.seo_meta_title || application.meta_title
  const metaDescription = application.seo_meta_description || application.meta_description

  return (
    <div className="w-full max-w-full overflow-x-hidden p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {appName}
              </h1>
              <Badge
                variant="outline"
                className={application.status === "active"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : application.status === "draft"
                    ? "bg-gray-50 text-gray-700 border-gray-200"
                    : "bg-red-50 text-red-700 border-red-200"}
              >
                {application.status}
              </Badge>
            </div>
            {application.subtitle && (
              <p className="text-lg text-gray-600 mb-2">{application.subtitle}</p>
            )}
            {application.description && (
              <p className="text-gray-500 max-w-3xl">{application.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button variant="outline" asChild className="border-gray-300 bg-white">
              <Link href="/admin/applications">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white">
              <Link href={`/admin/applications/${application.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <p className="text-gray-900 mt-1">{appName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Slug</label>
                    <p className="text-gray-900 mt-1 font-mono text-sm flex items-center gap-2">
                      <LinkIcon className="h-3 w-3 text-gray-400" />
                      {appSlug}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="text-gray-900 mt-1">{application.description || '-'}</p>
                  </div>
                  {application.subtitle && (
                    <div className="sm:col-span-2">
                      <label className="text-sm font-medium text-gray-700">Subtitle</label>
                      <p className="text-gray-900 mt-1">{application.subtitle}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Media */}
            <Card>
              <CardHeader>
                <CardTitle>Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {appThumbnail && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Thumbnail Image</label>
                    <img
                      src={appThumbnail}
                      alt={appName}
                      className="w-48 h-48 rounded-lg object-cover border-2 border-gray-200"
                    />
                  </div>
                )}
                {appBanner && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Banner Image</label>
                    <img
                      src={appBanner}
                      alt={`${appName} banner`}
                      className="w-full max-w-2xl rounded-lg object-cover border-2 border-gray-200"
                    />
                  </div>
                )}
                {!appThumbnail && !appBanner && (
                  <div className="text-center py-8 text-gray-500">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No images uploaded</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SEO Information */}
            <Card>
              <CardHeader>
                <CardTitle>SEO Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Meta Title</label>
                  <p className="text-gray-900 mt-1">{metaTitle || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Meta Description</label>
                  <p className="text-gray-900 mt-1">{metaDescription || '-'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Categories</CardTitle>
                    <CardDescription>Manage categories linked to this application</CardDescription>
                  </div>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <FolderTree className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No categories linked yet</p>
                  <p className="text-xs text-gray-400 mt-1">Click "Add Category" to link categories</p>
                </div>
              </CardContent>
            </Card>

            {/* Products */}
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
                <CardDescription>Products from all linked categories (read-only)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No products found</p>
                  <p className="text-xs text-gray-400 mt-1">Products are managed via categories</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <FolderTree className="h-4 w-4" />
                    Categories
                  </span>
                  <span className="text-lg font-semibold text-gray-900">{application.category_count || 0}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Products
                  </span>
                  <span className="text-lg font-semibold text-gray-900">{application.product_count || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Status & Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status & Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className={application.is_active
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-gray-50 text-gray-700 border-gray-200"}
                    >
                      {application.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    Created At
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {format(new Date(application.created_at), 'PPP')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(application.created_at), 'p')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Updated At</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {format(new Date(application.updated_at), 'PPP')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(application.updated_at), 'p')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
