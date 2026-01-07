"use client"

import { use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Trash2, Package, Calendar, Loader2, Image as ImageIcon, Search, FileText, ChevronRight } from "lucide-react"
import { useElevatorType, useDeleteElevatorType, useElevatorTypeProducts } from "@/hooks/queries/useElevatorTypes"
import { format } from "date-fns"

export default function ElevatorTypeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { data, isLoading } = useElevatorType(resolvedParams.id)
  const { data: productsData, isLoading: isLoadingProducts } = useElevatorTypeProducts(resolvedParams.id)
  const deleteMutation = useDeleteElevatorType()

  const elevatorType = data?.elevatorType

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this elevator type? This action cannot be undone.')) return
    const result = await deleteMutation.mutateAsync(resolvedParams.id)
    if (result.success) {
      router.push('/admin/elevator-types')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  if (!elevatorType) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Elevator Type Not Found</h2>
        <p className="text-gray-500 mb-4">The elevator type you're looking for doesn't exist.</p>
        <Button asChild>
          <Link href="/admin/elevator-types">Back to Elevator Types</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{elevatorType.title}</h1>
              <Badge
                variant="outline"
                className={elevatorType.status === "active"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : elevatorType.status === "draft"
                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                    : "bg-gray-50 text-gray-700 border-gray-200"}
              >
                {elevatorType.status}
              </Badge>
            </div>
            {elevatorType.subtitle && (
              <p className="text-sm text-gray-500">{elevatorType.subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" asChild>
              <Link href="/admin/elevator-types">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm" asChild>
              <Link href={`/admin/elevator-types/create?id=${elevatorType.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-500" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Title</p>
                  <p className="text-base text-gray-900 mt-1">{elevatorType.title}</p>
                </div>

                {elevatorType.subtitle && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Subtitle</p>
                    <p className="text-base text-gray-900 mt-1">{elevatorType.subtitle}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-600">URL Slug</p>
                  <p className="text-base text-gray-900 mt-1 font-mono text-sm">{elevatorType.slug}</p>
                </div>

                {elevatorType.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Description</p>
                    <p className="text-base text-gray-700 mt-1 whitespace-pre-wrap">{elevatorType.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Media */}
            {(elevatorType.thumbnail_image || elevatorType.banner_image) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-orange-500" />
                    Media
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {elevatorType.thumbnail_image && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-3">Thumbnail</p>
                      <img
                        src={elevatorType.thumbnail_image}
                        alt={elevatorType.title}
                        className="w-full max-w-md rounded-lg border-2 border-gray-200 shadow-sm"
                      />
                    </div>
                  )}

                  {elevatorType.banner_image && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-3">Banner</p>
                      <img
                        src={elevatorType.banner_image}
                        alt={elevatorType.title}
                        className="w-full rounded-lg border-2 border-gray-200 shadow-sm"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* SEO Information */}
            {(elevatorType.meta_title || elevatorType.meta_description) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-orange-500" />
                    SEO Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {elevatorType.meta_title && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Meta Title</p>
                      <p className="text-base text-gray-900 mt-1">{elevatorType.meta_title}</p>
                      <p className="text-xs text-gray-500 mt-1">{elevatorType.meta_title.length} characters</p>
                    </div>
                  )}

                  {elevatorType.meta_description && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Meta Description</p>
                      <p className="text-base text-gray-700 mt-1">{elevatorType.meta_description}</p>
                      <p className="text-xs text-gray-500 mt-1">{elevatorType.meta_description.length} characters</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            {/* Products List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-orange-500" />
                  Associated Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingProducts ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                  </div>
                ) : productsData?.products && productsData.products.length > 0 ? (
                  <div className="space-y-4">
                    {productsData.products.map((product: any) => (
                      <div key={product.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm transition-all">
                        <div className="flex items-center gap-4">
                          {product.thumbnail_url ? (
                            <img src={product.thumbnail_url} alt={product.name} className="w-12 h-12 rounded-md object-cover border border-gray-200" />
                          ) : (
                            <div className="w-12 h-12 rounded-md bg-white border border-gray-200 flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-300" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium text-gray-900">{product.name}</h4>
                            <p className="text-xs text-gray-500 font-mono">{product.sku || 'No SKU'}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/products/${product.id}`}>
                            View
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No products associated with this elevator type</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Products</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{elevatorType.product_count || 0}</span>
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
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <Badge
                    variant="outline"
                    className={elevatorType.status === "active"
                      ? "bg-green-50 text-green-700 border-green-200 mt-2"
                      : elevatorType.status === "draft"
                        ? "bg-yellow-50 text-yellow-700 border-yellow-200 mt-2"
                        : "bg-gray-50 text-gray-700 border-gray-200 mt-2"}
                  >
                    {elevatorType.status}
                  </Badge>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <Calendar className="h-3 w-3" />
                    <span>Created</span>
                  </div>
                  <p className="text-sm text-gray-900">
                    {format(new Date(elevatorType.created_at), 'PPP')}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <Calendar className="h-3 w-3" />
                    <span>Last Updated</span>
                  </div>
                  <p className="text-sm text-gray-900">
                    {format(new Date(elevatorType.updated_at), 'PPP')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/admin/elevator-types/create?id=${elevatorType.id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Elevator Type
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Elevator Type
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
