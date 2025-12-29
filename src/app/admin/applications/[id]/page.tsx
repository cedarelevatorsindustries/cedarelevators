"use client"

import { use } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Loader2, FolderTree, Package } from "lucide-react"
import Link from "next/link"
import { useApplication } from "@/hooks/queries/useApplications"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ApplicationDetailPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const { data, isLoading } = useApplication(resolvedParams.id)
  const application = data?.application

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

  return (
    <div className="w-full max-w-full overflow-x-hidden p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild className="border-gray-300 bg-white">
              <Link href="/admin/applications">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {application.name}
              </h1>
              <p className="text-gray-600 mt-1">Application details</p>
            </div>
          </div>
          <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white">
            <Link href={`/admin/applications/${application.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Application
            </Link>
          </Button>
        </div>

        {/* Application Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Application Information</CardTitle>
              <Badge
                variant="outline"
                className={application.status === "active"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-gray-50 text-gray-700 border-gray-200"}
              >
                {application.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Image */}
            {(application.thumbnail_image || application.image_url) && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Thumbnail</label>
                <img
                  src={application.thumbnail_image || application.image_url}
                  alt={application.name}
                  className="w-48 h-48 rounded-lg object-cover border-2 border-gray-200"
                />
              </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Name</label>
                <p className="text-gray-900 mt-1">{application.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Slug</label>
                <p className="text-gray-900 mt-1 font-mono text-sm">{application.slug}</p>
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <p className="text-gray-900 mt-1">{application.description || '-'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Sort Order</label>
                <p className="text-gray-900 mt-1">{application.sort_order}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Active</label>
                <p className="text-gray-900 mt-1">{application.is_active ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Categories</CardTitle>
              <FolderTree className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{application.category_count || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Direct children categories</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Subcategories</CardTitle>
              <FolderTree className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{application.subcategory_count || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Nested subcategories</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Products</CardTitle>
              <Package className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{application.product_count || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Total products</p>
            </CardContent>
          </Card>
        </div>

        {/* SEO Information */}
        {(application.meta_title || application.meta_description) && (
          <Card>
            <CardHeader>
              <CardTitle>SEO Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {application.meta_title && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Meta Title</label>
                  <p className="text-gray-900 mt-1">{application.meta_title}</p>
                </div>
              )}
              {application.meta_description && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Meta Description</label>
                  <p className="text-gray-900 mt-1">{application.meta_description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Created At</label>
                <p className="text-gray-900 mt-1">
                  {new Date(application.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Updated At</label>
                <p className="text-gray-900 mt-1">
                  {new Date(application.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
