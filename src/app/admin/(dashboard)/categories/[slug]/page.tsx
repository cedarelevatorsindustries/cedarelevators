"use client"

import { use, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Loader2, FolderTree, Package, Plus, Calendar, Link as LinkIcon, Image as ImageIcon, ChevronRight, ChevronDown, Trash2, ArrowRightLeft } from "lucide-react"
import Link from "next/link"
import { useCategory, useCategoryBySlug, useCategories, useSubcategories } from "@/hooks/queries/useCategories"
import { useProductsByCategory } from "@/hooks/queries/useProductsByCategory"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { deleteSubcategory } from "@/lib/actions/subcategories"
import { moveSubcategoryToCategory } from "@/lib/actions/category-subcategories"
import { useRouter } from "next/navigation"


interface PageProps {
  params: Promise<{ slug: string }>
}

export default function CategoryDetailPage({ params }: PageProps) {
  const resolvedParams = use(params)

  // Check if the parameter is a UUID (contains hyphens in UUID format)
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(resolvedParams.slug)

  // Fetch by ID if UUID, otherwise by slug
  const { data: dataBySlug, isLoading: isLoadingSlug } = useCategoryBySlug(resolvedParams.slug)
  const { data: dataById, isLoading: isLoadingId } = useCategory(isUUID ? resolvedParams.slug : '')

  const data = isUUID ? dataById : dataBySlug
  const isLoading = isUUID ? isLoadingId : isLoadingSlug

  const category = data?.category

  // Fetch subcategories from subcategories table via junction table
  const { data: subcategoriesData } = useSubcategories(category?.id || '')
  const subcategories = subcategoriesData?.subcategories || []

  // Fetch products for this category
  const { data: productsData, isLoading: isLoadingProducts } = useProductsByCategory(category?.id || '')

  // State for expandable subcategory sections
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set())

  // State for delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [subcategoryToDelete, setSubcategoryToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // State for move dialog
  const [moveDialogOpen, setMoveDialogOpen] = useState(false)
  const [subcategoryToMove, setSubcategoryToMove] = useState<any>(null)
  const [targetCategoryId, setTargetCategoryId] = useState<string>("")
  const [isMoving, setIsMoving] = useState(false)

  const router = useRouter()

  const toggleSubcategory = (subcategoryId: string) => {
    setExpandedSubcategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(subcategoryId)) {
        newSet.delete(subcategoryId)
      } else {
        newSet.add(subcategoryId)
      }
      return newSet
    })
  }

  // Handle delete subcategory
  const handleDeleteSubcategory = async () => {
    if (!subcategoryToDelete) return

    setIsDeleting(true)
    try {
      const result = await deleteSubcategory(subcategoryToDelete.id)

      if (result.success) {
        toast.success("Subcategory deleted successfully")
        setDeleteDialogOpen(false)
        setSubcategoryToDelete(null)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to delete subcategory")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle move subcategory
  const handleMoveSubcategory = async () => {
    if (!subcategoryToMove || !targetCategoryId || !category) return

    setIsMoving(true)
    try {
      const result = await moveSubcategoryToCategory(
        subcategoryToMove.id,
        category.id,
        targetCategoryId
      )

      if (result.success) {
        toast.success("Subcategory moved successfully")
        setMoveDialogOpen(false)
        setSubcategoryToMove(null)
        setTargetCategoryId("")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to move subcategory")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsMoving(false)
    }
  }


  // Fetch all categories for parent lookup
  const { data: categoriesData } = useCategories()

  // Get parent category if this is a subcategory
  const parentCategory = category?.parent_id
    ? categoriesData?.categories?.find(c => c.id === category.parent_id)
    : null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  if (!category) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Category not found</h3>
        <Button asChild variant="outline">
          <Link href="/admin/categories">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Link>
        </Button>
      </div>
    )
  }

  const catName = category.name
  const catSlug = category.slug || category.handle
  const catThumbnail = category.thumbnail
  const catBanner = category.banner_url
  const metaTitle = category.seo_meta_title
  const metaDescription = category.seo_meta_description

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Breadcrumb */}
            {parentCategory && (
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Link href={`/admin/categories/${parentCategory.slug || parentCategory.handle}`} className="hover:text-gray-700">
                  {parentCategory.name}
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-gray-900 font-medium">{catName}</span>
              </div>
            )}

            <div className="flex items-center gap-2 mb-3">
              <Badge
                variant="outline"
                className={category.is_active
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-gray-50 text-gray-700 border-gray-200"}
              >
                {category.is_active ? 'active' : 'draft'}
              </Badge>
              {!parentCategory && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Parent Category
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {catName}
              </h1>
            </div>
            {category.description && (
              <p className="text-gray-500 max-w-3xl">{category.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button variant="outline" asChild className="border-gray-300 bg-white">
              <Link href="/admin/categories">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white">
              <Link href={`/admin/categories/create?id=${category.id}`}>
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
                    <p className="text-gray-900 mt-1 text-lg font-semibold">{catName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Slug</label>
                    <p className="text-gray-900 mt-1 font-mono text-sm flex items-center gap-2">
                      <LinkIcon className="h-3 w-3 text-gray-400" />
                      {catSlug}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="text-gray-900 mt-1">{category.description || '-'}</p>
                  </div>
                  {parentCategory && (
                    <div className="sm:col-span-2">
                      <label className="text-sm font-medium text-gray-700">Parent Category</label>
                      <Link
                        href={`/admin/categories/${parentCategory.slug || parentCategory.handle}`}
                        className="text-blue-600 hover:text-blue-700 mt-1 inline-flex items-center gap-2"
                      >
                        <FolderTree className="h-4 w-4" />
                        {parentCategory.name}
                      </Link>
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
                {catThumbnail && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Thumbnail Image</label>
                    <img
                      src={catThumbnail}
                      alt={catName}
                      className="w-48 h-48 rounded-lg object-cover border-2 border-gray-200"
                    />
                  </div>
                )}
                {catBanner && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Banner Image</label>
                    <img
                      src={catBanner as string}
                      alt={`${catName} banner`}
                      className="w-full max-w-2xl rounded-lg object-cover border-2 border-gray-200"
                    />
                  </div>
                )}
                {!catThumbnail && !catBanner && (
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

            {/* Hierarchical Subcategories Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Subcategories</CardTitle>
                    <CardDescription>
                      {subcategories.length > 0
                        ? `${subcategories.length} subcategories under this category`
                        : 'No subcategories yet'}
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    asChild
                  >
                    <Link href={`/admin/categories/create?parent=${category.id}`}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Subcategory
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {subcategories.length > 0 ? (
                  <div className="space-y-3">
                    {subcategories.map((subcat) => (
                      <div
                        key={subcat.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all bg-gradient-to-r from-blue-50/30 to-white"
                      >
                        <Link
                          href={`/admin/categories/${subcat.slug || subcat.handle}`}
                          className="flex items-center gap-4 min-w-0 flex-1 cursor-pointer group"
                        >
                          {subcat.thumbnail ? (
                            <img
                              src={subcat.thumbnail}
                              alt={subcat.name}
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border-2 border-blue-100 group-hover:border-blue-300 transition-colors"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 border-2 border-blue-200 group-hover:border-blue-300 transition-colors">
                              <FolderTree className="h-6 w-6 text-blue-600" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {subcat.name}
                            </h4>
                            {subcat.description && (
                              <p className="text-sm text-gray-500 truncate">{subcat.description}</p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                              <span className="flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                {subcat.product_count || 0} products
                              </span>
                            </div>
                          </div>
                        </Link>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge
                            variant="outline"
                            className={subcat.status === 'active'
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-gray-50 text-gray-700 border-gray-200"}
                          >
                            {subcat.status || 'draft'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.preventDefault()
                              setSubcategoryToMove(subcat)
                              setMoveDialogOpen(true)
                            }}
                          >
                            <ArrowRightLeft className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.preventDefault()
                              setSubcategoryToDelete(subcat)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                            <Link href={`/admin/categories/create?id=${subcat.id}&parent=${category?.id}`}>
                              <Edit className="h-4 w-4 text-gray-600" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FolderTree className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No subcategories yet</p>
                    <p className="text-xs text-gray-400 mt-1">Click "Add Subcategory" to create one</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Products */}
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
                <CardDescription>
                  {productsData?.hasSubcategories
                    ? 'Products grouped by subcategory'
                    : 'Products assigned to this category'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingProducts ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                  </div>
                ) : productsData?.hasSubcategories && productsData.groupedProducts ? (
                  // Parent category: Show products grouped by subcategory
                  <div className="space-y-4">
                    {productsData.groupedProducts.map((group: any) => {
                      const isExpanded = expandedSubcategories.has(group.subcategory.id)
                      const productCount = group.products.length

                      return (
                        <div key={group.subcategory.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* Subcategory Header - Clickable */}
                          <button
                            onClick={() => toggleSubcategory(group.subcategory.id)}
                            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50/50 to-white hover:from-blue-50 hover:to-blue-50/30 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {isExpanded ? (
                                <ChevronDown className="h-5 w-5 text-blue-600" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                              )}
                              {group.subcategory.thumbnail ? (
                                <img
                                  src={group.subcategory.thumbnail}
                                  alt={group.subcategory.name}
                                  className="w-10 h-10 rounded-lg object-cover border-2 border-blue-100"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center border-2 border-blue-200">
                                  <FolderTree className="h-5 w-5 text-blue-600" />
                                </div>
                              )}
                              <div className="text-left">
                                <h4 className="font-semibold text-gray-900">{group.subcategory.name}</h4>
                                <p className="text-sm text-gray-500">{productCount} {productCount === 1 ? 'product' : 'products'}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {productCount}
                            </Badge>
                          </button>

                          {/* Products List - Expandable */}
                          {isExpanded && (
                            <div className="p-4 bg-white border-t border-gray-100">
                              {group.products.length > 0 ? (
                                <div className="grid gap-3">
                                  {group.products.map((product: any) => (
                                    <Link
                                      key={product.id}
                                      href={`/admin/products/${product.slug}`}
                                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-sm transition-all bg-white group"
                                    >
                                      {product.thumbnail_url ? (
                                        <img
                                          src={product.thumbnail_url}
                                          alt={product.name}
                                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-gray-200 group-hover:border-orange-300 transition-colors"
                                        />
                                      ) : (
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                          <Package className="h-6 w-6 text-gray-400" />
                                        </div>
                                      )}
                                      <div className="min-w-0 flex-1">
                                        <h5 className="font-medium text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                                          {product.name}
                                        </h5>
                                        <p className="text-xs text-gray-500 truncate">{product.slug}</p>
                                      </div>
                                      <Badge
                                        variant="outline"
                                        className={product.status === 'published'
                                          ? "bg-green-50 text-green-700 border-green-200"
                                          : "bg-gray-50 text-gray-700 border-gray-200"}
                                      >
                                        {product.status}
                                      </Badge>
                                    </Link>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 text-center py-4">No products in this subcategory</p>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : productsData?.products && productsData.products.length > 0 ? (
                  // Leaf category: Show products directly
                  <div className="grid gap-3">
                    {productsData.products.map((product: any) => (
                      <Link
                        key={product.id}
                        href={`/admin/products/${product.slug}`}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-sm transition-all bg-white group"
                      >
                        {product.thumbnail_url ? (
                          <img
                            src={product.thumbnail_url}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-gray-200 group-hover:border-orange-300 transition-colors"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h5 className="font-medium text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                            {product.name}
                          </h5>
                          <p className="text-xs text-gray-500 truncate">{product.slug}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={product.status === 'published'
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-gray-50 text-gray-700 border-gray-200"}
                        >
                          {product.status}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No products found</p>
                    <p className="text-xs text-gray-400 mt-1">Products assign themselves to categories</p>
                  </div>
                )}
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
                    Subcategories
                  </span>
                  <span className="text-lg font-semibold text-gray-900">{subcategories.length}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Products
                  </span>
                  <span className="text-lg font-semibold text-gray-900">{category.product_count || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Hierarchy Info */}
            {!parentCategory && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-base text-blue-900">Category Hierarchy</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-800">
                  <p className="mb-2">
                    This is a <strong>parent category</strong>. You can create subcategories to organize products more specifically.
                  </p>
                  <p className="text-xs text-blue-700">
                    Example: If this is "Motors", subcategories could be "AC Motors", "DC Motors", etc.
                  </p>
                </CardContent>
              </Card>
            )}

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
                      className={category.is_active
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-gray-50 text-gray-700 border-gray-200"}
                    >
                      {category.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    Created At
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {format(new Date(category.created_at), 'PPP')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(category.created_at), 'p')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Updated At</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {format(new Date(category.updated_at), 'PPP')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(category.updated_at), 'p')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Subcategory</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{subcategoryToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSubcategory}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Subcategory Dialog */}
      <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Subcategory</DialogTitle>
            <DialogDescription>
              Move "{subcategoryToMove?.name}" to another category
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Select Target Category
            </label>
            <Select value={targetCategoryId} onValueChange={setTargetCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {categoriesData?.categories
                  ?.filter((cat) => cat.id !== category?.id)
                  .map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setMoveDialogOpen(false)
                setTargetCategoryId("")
              }}
              disabled={isMoving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMoveSubcategory}
              disabled={isMoving || !targetCategoryId}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isMoving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Moving...
                </>
              ) : (
                "Move"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
