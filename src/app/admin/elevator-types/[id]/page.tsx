"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Loader2, Package, Eye, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useElevatorType, useDeleteElevatorType, useProductsByElevatorType } from "@/hooks/queries/useElevatorTypes"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function ElevatorTypeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: typeData, isLoading: isLoadingType } = useElevatorType(params.id)
  const { data: productsData, isLoading: isLoadingProducts } = useProductsByElevatorType(params.id)
  const deleteMutation = useDeleteElevatorType()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const elevatorType = typeData?.elevatorType
  const products = productsData?.products || []

  const handleDelete = async () => {
    const result = await deleteMutation.mutateAsync(params.id)
    
    if (result.success) {
      toast.success('Elevator type deleted successfully')
      router.push('/admin/elevator-types')
    } else {
      toast.error(result.error || 'Failed to delete elevator type')
      setShowDeleteDialog(false)
    }
  }

  if (isLoadingType) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  if (!elevatorType) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <p className="text-gray-600">Elevator type not found</p>
        <Button variant="outline" asChild>
          <Link href="/admin/elevator-types">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Elevator Types
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {elevatorType.icon && (
                <span className="text-3xl">{elevatorType.icon}</span>
              )}
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {elevatorType.name}
              </h1>
              <Badge variant={elevatorType.is_active ? "default" : "secondary"} className={elevatorType.is_active ? "bg-green-100 text-green-800" : ""}>
                {elevatorType.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-gray-600">
              Elevator type details and assigned products
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" asChild>
              <Link href="/admin/elevator-types">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white" asChild>
              <Link href={`/admin/elevator-types/${params.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Elevator Type Details */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Type Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Slug</p>
                  <p className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                    {elevatorType.slug}
                  </p>
                </div>

                {elevatorType.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Description</p>
                    <p className="text-sm text-gray-900">{elevatorType.description}</p>
                  </div>
                )}

                {elevatorType.icon && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Icon</p>
                    <p className="text-2xl">{elevatorType.icon}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Sort Order</p>
                  <p className="text-sm text-gray-900">{elevatorType.sort_order}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Created</p>
                  <p className="text-sm text-gray-900">
                    {new Date(elevatorType.created_at).toLocaleDateString()}
                  </p>
                </div>

                {elevatorType.updated_at && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Last Updated</p>
                    <p className="text-sm text-gray-900">
                      {new Date(elevatorType.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Assigned Products */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Products Using This Type
                      <Badge variant="secondary" className="ml-2">
                        {products.length}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Products that have been assigned to this elevator type
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingProducts ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">No products assigned yet</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Products will appear here when they assign themselves to this elevator type.
                      </p>
                    </div>
                    <Button variant="outline" asChild className="mt-4">
                      <Link href="/admin/products/create">
                        Create Product
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Products List */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      {products.map((product: any) => (
                        <Card key={product.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              {/* Product Image */}
                              <div className="h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                {product.thumbnail ? (
                                  <img 
                                    src={product.thumbnail} 
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <Package className="h-8 w-8 text-gray-400" />
                                  </div>
                                )}
                              </div>

                              {/* Product Info */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 truncate">
                                  {product.name}
                                </h4>
                                <p className="text-sm text-gray-500 mt-1">
                                  {product.sku || 'No SKU'}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  {product.price && (
                                    <span className="text-sm font-semibold text-orange-600">
                                      ${product.price.toFixed(2)}
                                    </span>
                                  )}
                                  <Badge 
                                    variant={product.status === 'active' ? 'default' : 'secondary'}
                                    className={`text-xs ${product.status === 'active' ? 'bg-green-100 text-green-800' : ''}`}
                                  >
                                    {product.status}
                                  </Badge>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-start">
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/admin/products/${product.id}`}>
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Elevator Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{elevatorType.name}</strong>?
              <br /><br />
              {products.length > 0 ? (
                <span className="text-red-600 font-medium">
                  ⚠️ Cannot delete: This elevator type has {products.length} product(s) assigned.
                  Please reassign products first.
                </span>
              ) : (
                <span className="font-medium text-gray-900">
                  This action cannot be undone.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={products.length > 0}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
