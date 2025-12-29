"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Upload, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCategory, useUpdateCategory, useUploadCategoryImage, useCategories } from "@/hooks/queries/useCategories"
import { toast } from "sonner"

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: categoryData, isLoading: isLoadingCategory } = useCategory(params.id)
  const { data: categoriesData } = useCategories()
  const updateMutation = useUpdateCategory()
  const uploadMutation = useUploadCategoryImage()

  const category = categoryData?.category
  const existingCategories = categoriesData?.categories?.filter((c: any) => c.id !== params.id) || []

  // Removed: Product selection state (products now assign themselves)

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    parent_id: null as string | null,
    image_url: "",
    image_alt: "",
    icon: "",
    sort_order: 0,
    is_active: true,
    status: "active" as "active" | "inactive",
    application: "",
    meta_title: "",
    meta_description: ""
  })

  // Product selection state
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [originalProductIds, setOriginalProductIds] = useState<string[]>([])

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        slug: category.slug || "",
        description: category.description || "",
        parent_id: category.parent_id || null,
        image_url: category.image_url || "",
        image_alt: category.image_alt || "",
        icon: category.icon || "",
        sort_order: category.sort_order || 0,
        is_active: category.is_active ?? true,
        status: category.status || "active",
        application: category.application || "",
        meta_title: category.meta_title || "",
        meta_description: category.meta_description || ""
      })
      if (category.image_url) {
        setImagePreview(category.image_url)
      }
    }
  }, [category])

  useEffect(() => {
    if (categoryProducts.length > 0) {
      const productIds = categoryProducts.map(p => p.id)
      setSelectedProductIds(productIds)
      setOriginalProductIds(productIds)
    }
  }, [categoryProducts])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    try {
      let imageUrl = formData.image_url

      if (imageFile) {
        setIsUploading(true)
        const result = await uploadMutation.mutateAsync(imageFile)
        if (result.success && result.url) {
          imageUrl = result.url
        }
        setIsUploading(false)
      }

      const result = await updateMutation.mutateAsync({
        id: params.id,
        data: {
          ...formData,
          image_url: imageUrl
        }
      })

      if (result.success) {
        // Update product assignments
        const addedProducts = selectedProductIds.filter(id => !originalProductIds.includes(id))
        const removedProducts = originalProductIds.filter(id => !selectedProductIds.includes(id))

        if (addedProducts.length > 0 || removedProducts.length > 0) {
          toast.loading('Updating product assignments...')

          const updatePromises = [
            ...addedProducts.map(productId =>
              updateProduct(productId, { category: params.id })
            ),
            ...removedProducts.map(productId =>
              updateProduct(productId, { category: undefined })
            )
          ]

          await Promise.all(updatePromises)
          toast.dismiss()
          
          if (addedProducts.length > 0 && removedProducts.length > 0) {
            toast.success(`Category updated! ${addedProducts.length} products added, ${removedProducts.length} removed`)
          } else if (addedProducts.length > 0) {
            toast.success(`Category updated! ${addedProducts.length} products assigned`)
          } else if (removedProducts.length > 0) {
            toast.success(`Category updated! ${removedProducts.length} products unassigned`)
          } else {
            toast.success('Category updated successfully!')
          }
        } else {
          toast.success('Category updated successfully!')
        }

        router.push('/admin/categories')
      }
    } catch (error) {
      console.error('Error updating category:', error)
      toast.error('Failed to update category')
      setIsUploading(false)
    }
  }

  if (isLoadingCategory) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  const isLoading = updateMutation.isPending || isUploading

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="space-y-6 lg:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
              Edit Category
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 mt-1 sm:mt-2">
              Update category information and product assignments
            </p>
          </div>
          <div className="flex items-center space-x-3 flex-shrink-0">
            <Button variant="outline" asChild>
              <Link href="/admin/categories">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancel
              </Link>
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/25"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploading ? 'Uploading...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Product Assignment Card */}
            <Card>
              <CardHeader>
                <CardTitle>Product Assignment</CardTitle>
                <CardDescription>
                  Manage which products belong to this category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Label>Assigned Products</Label>
                  <ProductSelector
                    products={allProducts}
                    selectedProductIds={selectedProductIds}
                    onSelectionChange={setSelectedProductIds}
                    placeholder="Select products to assign to this category..."
                    multiple={true}
                  />
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                    <span>
                      {selectedProductIds.length} product{selectedProductIds.length !== 1 ? 's' : ''} assigned
                    </span>
                    {(selectedProductIds.length !== originalProductIds.length) && (
                      <span className="text-orange-600 font-medium">
                        Changes will be saved
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image">Upload New Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>

                {imagePreview && (
                  <div className="border rounded-lg overflow-hidden">
                    <img src={imagePreview} alt="Preview" className="w-full h-auto" />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="image_alt">Image Alt Text</Label>
                  <Input
                    id="image_alt"
                    value={formData.image_alt}
                    onChange={(e) => setFormData({ ...formData, image_alt: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="meta_title">Meta Title</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Hierarchy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Parent Category</Label>
                  <Select
                    value={formData.parent_id || "none"}
                    onValueChange={(value) => setFormData({ ...formData, parent_id: value === "none" ? null : value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Top Level)</SelectItem>
                      {existingCategories.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {!formData.parent_id && (
                  <div className="space-y-2">
                    <Label htmlFor="application">Application Type</Label>
                    <Input
                      id="application"
                      value={formData.application}
                      onChange={(e) => setFormData({ ...formData, application: e.target.value })}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Display Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">Icon</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked, status: e.target.checked ? 'active' : 'inactive' })}
                    className="rounded"
                  />
                  <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
