"use client"

import { use, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SearchableMultiSelect } from "@/components/ui/searchable-multi-select"
import { ArrowLeft, Edit, Loader2, FolderTree, Package, Calendar, Link as LinkIcon, Image as ImageIcon, X, ChevronDown, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useApplication } from "@/hooks/queries/useApplications"
import { useApplicationCategories, useLinkCategoryToApplication, useUnlinkCategoryFromApplication } from "@/hooks/queries/useApplicationCategories"
import { useCategories } from "@/hooks/queries/useCategories"
import { format } from "date-fns"
import { toast } from "sonner"
import { getApplicationProducts } from "@/lib/actions/application-products"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ApplicationDetailPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const { data, isLoading } = useApplication(resolvedParams.id)
  const application = data?.application

  // Fetch linked categories
  const { data: linkedCategoriesData, isLoading: isLoadingLinkedCategories } = useApplicationCategories(application?.id || '')
  const linkedCategories = linkedCategoriesData || []

  // Fetch all categories for the dropdown
  const { data: allCategoriesData } = useCategories()
  const allCategories = allCategoriesData?.categories || []

  // Mutations for linking/unlinking categories
  const linkCategoryMutation = useLinkCategoryToApplication()
  const unlinkCategoryMutation = useUnlinkCategoryFromApplication()

  // Get linked category IDs
  const linkedCategoryIds = linkedCategories.map((link: any) => link.category_id)

  // State to hold products from linked categories
  const [groupedProducts, setGroupedProducts] = useState<any[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  // Fetch products when application or categories change
  useEffect(() => {
    async function fetchProducts() {
      if (!application?.id) return

      setIsLoadingProducts(true)
      try {
        const result = await getApplicationProducts(application.id)
        if (result.success) {
          setGroupedProducts(result.groupedProducts)
        }
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setIsLoadingProducts(false)
      }
    }

    fetchProducts()
  }, [application?.id, linkedCategories.length])

  // Handle category selection change
  const handleCategoryChange = async (selectedIds: string[]) => {
    if (!application?.id) return

    const addedIds = selectedIds.filter(id => !linkedCategoryIds.includes(id))
    const removedIds = linkedCategoryIds.filter(id => !selectedIds.includes(id))

    // Link new categories
    for (const categoryId of addedIds) {
      await linkCategoryMutation.mutateAsync({
        application_id: application.id,
        category_id: categoryId
      })
    }

    // Unlink removed categories
    for (const categoryId of removedIds) {
      const link = linkedCategories.find((l: any) => l.category_id === categoryId)
      if (link) {
        await unlinkCategoryMutation.mutateAsync(link.id)
      }
    }
  }

  // Handle individual category removal
  const handleRemoveCategory = async (linkId: string) => {
    try {
      await unlinkCategoryMutation.mutateAsync(linkId)
      toast.success('Category unlinked successfully')
    } catch (error) {
      toast.error('Failed to unlink category')
    }
  }

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

            {/* Categories with SearchableMultiSelect */}
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Categories</CardTitle>
                  <CardDescription>Link categories to this application</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <SearchableMultiSelect
                  items={allCategories.map((cat: any) => ({
                    id: cat.id,
                    name: cat.title || cat.name
                  }))}
                  selectedIds={linkedCategoryIds}
                  onSelectionChange={handleCategoryChange}
                  placeholder="Search and select categories..."
                  emptyMessage="No categories found"
                  hideSelectedBadges={true}
                />

                {/* Display linked categories */}
                {linkedCategories.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {linkedCategories.map((link: any) => (
                      <div
                        key={link.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all bg-gradient-to-r from-blue-50/30 to-white"
                      >
                        <Link
                          href={`/admin/categories/${link.category.slug}`}
                          className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer group"
                        >
                          {link.category.thumbnail ? (
                            <img
                              src={link.category.thumbnail}
                              alt={link.category.title}
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border-2 border-blue-100 group-hover:border-blue-300 transition-colors"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 border-2 border-blue-200 group-hover:border-blue-300 transition-colors">
                              <FolderTree className="h-5 w-5 text-blue-600" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {link.category.title}
                            </h4>
                          </div>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleRemoveCategory(link.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {linkedCategories.length === 0 && !isLoadingLinkedCategories && (
                  <div className="text-center py-8 text-gray-500">
                    <FolderTree className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No categories linked yet</p>
                    <p className="text-xs text-gray-400 mt-1">Use the dropdown above to link categories</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Products */}
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
                <CardDescription>
                  {groupedProducts.length > 0
                    ? 'Products grouped by category'
                    : 'Products from linked categories'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingProducts ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                  </div>
                ) : groupedProducts.length > 0 ? (
                  <div className="space-y-4">
                    {groupedProducts.map((group: any) => {
                      const isExpanded = expandedCategories.has(group.category.id)
                      const productCount = group.products.length

                      return (
                        <div key={group.category.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* Category Header - Clickable */}
                          <button
                            onClick={() => toggleCategory(group.category.id)}
                            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50/50 to-white hover:from-blue-50 hover:to-blue-50/30 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {isExpanded ? (
                                <ChevronDown className="h-5 w-5 text-blue-600" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                              )}
                              {group.category.thumbnail ? (
                                <img
                                  src={group.category.thumbnail}
                                  alt={group.category.title}
                                  className="w-10 h-10 rounded-lg object-cover border-2 border-blue-100"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center border-2 border-blue-200">
                                  <FolderTree className="h-5 w-5 text-blue-600" />
                                </div>
                              )}
                              <div className="text-left">
                                <h4 className="font-semibold text-gray-900">{group.category.title}</h4>
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
                                        className={product.status === 'active' || product.status === 'published'
                                          ? "bg-green-50 text-green-700 border-green-200"
                                          : "bg-gray-50 text-gray-700 border-gray-200"}
                                      >
                                        {product.status}
                                      </Badge>
                                    </Link>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 text-center py-4">No products in this category</p>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No products found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {linkedCategories.length === 0
                        ? "Link categories to see their products"
                        : "Products are managed via categories"}
                    </p>
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
                    Categories
                  </span>
                  <span className="text-lg font-semibold text-gray-900">{linkedCategories.length}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Products
                  </span>
                  <span className="text-lg font-semibold text-gray-900">
                    {groupedProducts.reduce((sum, group) => sum + group.products.length, 0)}
                  </span>
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
