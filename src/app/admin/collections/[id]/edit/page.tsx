"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Upload, ArrowLeft, Loader2, GripVertical, X, Package } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd"
import { 
  useCollection, 
  useUpdateCollection, 
  useUploadCollectionImage,
  useReorderCollectionProducts,
  useAddProductsToCollection,
  useRemoveProductFromCollection
} from "@/hooks/queries/useCollections"
import { useProducts } from "@/hooks/queries/useProducts"
import { ProductSelector } from "@/components/admin/ProductSelector"
import { generateSlug } from "@/lib/types/collections"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function EditCollectionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: collectionData, isLoading: isLoadingCollection } = useCollection(params.id)
  const updateMutation = useUpdateCollection()
  const uploadMutation = useUploadCollectionImage()
  const reorderMutation = useReorderCollectionProducts()
  const addProductsMutation = useAddProductsToCollection()
  const removeProductMutation = useRemoveProductFromCollection()

  const collection = collectionData?.collection

  // Get all products
  const { data: productsData } = useProducts({}, 1, 1000)
  const allProducts = productsData?.products || []

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    image_url: "",
    image_alt: "",
    type: "manual" as "manual" | "automatic",
    is_active: true,
    is_featured: false,
    sort_order: 0,
    meta_title: "",
    meta_description: ""
  })

  // Product state
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [orderedProductIds, setOrderedProductIds] = useState<string[]>([])
  const [originalProductIds, setOriginalProductIds] = useState<string[]>([])
  const [hasReordered, setHasReordered] = useState(false)

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)

  // Load collection data
  useEffect(() => {
    if (collection) {
      setFormData({
        title: collection.title || "",
        slug: collection.slug || "",
        description: collection.description || "",
        image_url: collection.image_url || "",
        image_alt: collection.image_alt || "",
        type: collection.type || "manual",
        is_active: collection.is_active ?? true,
        is_featured: collection.is_featured || false,
        sort_order: collection.sort_order || 0,
        meta_title: collection.meta_title || "",
        meta_description: collection.meta_description || ""
      })
      if (collection.image_url) {
        setImagePreview(collection.image_url)
      }

      // Load products in order
      if (collection.products && collection.products.length > 0) {
        const productIds = collection.products.map(p => p.product_id)
        setSelectedProductIds(productIds)
        setOrderedProductIds(productIds)
        setOriginalProductIds(productIds)
      }
    }
  }, [collection])

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

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title)
    })
  }

  const handleProductSelectionChange = (productIds: string[]) => {
    // When products are selected/deselected
    const newProducts = productIds.filter(id => !orderedProductIds.includes(id))
    const removedProducts = orderedProductIds.filter(id => !productIds.includes(id))
    
    // Update ordered list: remove deselected, add new ones at the end
    const updatedOrdered = orderedProductIds
      .filter(id => !removedProducts.includes(id))
      .concat(newProducts)
    
    setSelectedProductIds(productIds)
    setOrderedProductIds(updatedOrdered)
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(orderedProductIds)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setOrderedProductIds(items)
    setHasReordered(true)
  }

  const handleRemoveProduct = (productId: string) => {
    setSelectedProductIds(prev => prev.filter(id => id !== productId))
    setOrderedProductIds(prev => prev.filter(id => id !== productId))
  }

  const handleSubmit = async () => {
    try {
      let imageUrl = formData.image_url

      // Upload new image if selected
      if (imageFile) {
        setIsUploading(true)
        const result = await uploadMutation.mutateAsync(imageFile)
        if (result.success && result.url) {
          imageUrl = result.url
        }
        setIsUploading(false)
      }

      // Update collection metadata
      const result = await updateMutation.mutateAsync({
        id: params.id,
        data: {
          ...formData,
          image_url: imageUrl
        }
      })

      if (result.success) {
        // Handle product changes
        const addedProducts = orderedProductIds.filter(id => !originalProductIds.includes(id))
        const removedProducts = originalProductIds.filter(id => !orderedProductIds.includes(id))

        // Remove products
        if (removedProducts.length > 0) {
          toast.loading(`Removing ${removedProducts.length} products...`)
          await Promise.all(
            removedProducts.map(productId =>
              removeProductMutation.mutateAsync({
                collectionId: params.id,
                productId
              })
            )
          )
          toast.dismiss()
        }

        // Add new products
        if (addedProducts.length > 0) {
          toast.loading(`Adding ${addedProducts.length} products...`)
          await addProductsMutation.mutateAsync({
            collectionId: params.id,
            productIds: addedProducts
          })
          toast.dismiss()
        }

        // Reorder if needed (or if products were added/removed)
        if (hasReordered || addedProducts.length > 0 || removedProducts.length > 0) {
          toast.loading('Updating product order...')
          await reorderMutation.mutateAsync({
            collectionId: params.id,
            orderedProductIds
          })
          toast.dismiss()
        }

        // Show success message
        if (addedProducts.length > 0 || removedProducts.length > 0) {
          const msg = []
          if (addedProducts.length > 0) msg.push(`${addedProducts.length} added`)
          if (removedProducts.length > 0) msg.push(`${removedProducts.length} removed`)
          toast.success(`Collection updated! (${msg.join(', ')})`)
        } else if (hasReordered) {
          toast.success('Collection updated with new product order!')
        } else {
          toast.success('Collection updated successfully!')
        }

        router.push('/admin/collections')
      }
    } catch (error) {
      console.error('Error updating collection:', error)
      toast.error('Failed to update collection')
      setIsUploading(false)
    }
  }

  if (isLoadingCollection) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  const isLoading = updateMutation.isPending || isUploading

  // Get ordered product details for display
  const orderedProducts = orderedProductIds
    .map(id => allProducts.find(p => p.id === id))
    .filter(Boolean)

  return (
    <div className="w-full max-w-full overflow-x-hidden p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Edit Collection
            </h1>
            <p className="text-gray-600 mt-1">
              Update collection information and products
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" asChild>
              <Link href="/admin/collections">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancel
              </Link>
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white"
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

        {/* Main Form */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Collection Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Collection Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="automatic">Automatic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Product Management */}
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
                <CardDescription>
                  Manage collection products and their order
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>Select Products</Label>
                  <ProductSelector
                    products={allProducts}
                    selectedProductIds={selectedProductIds}
                    onSelectionChange={handleProductSelectionChange}
                    placeholder="Search and select products..."
                    multiple={true}
                  />
                  {(selectedProductIds.length !== originalProductIds.length) && (
                    <p className="text-xs text-orange-600 font-medium">
                      Changes will be saved when you click "Save Changes"
                    </p>
                  )}
                </div>

                {/* Drag and Drop Ordered List */}
                {orderedProducts.length > 0 && (
                  <div className="space-y-3 mt-6">
                    <div className="flex items-center justify-between">
                      <Label>Product Order ({orderedProducts.length})</Label>
                      <p className="text-xs text-gray-500">Drag to reorder</p>
                    </div>
                    
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="products">
                        {(provided, snapshot) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={cn(
                              "space-y-2 p-3 rounded-lg border-2 border-dashed transition-colors",
                              snapshot.isDraggingOver 
                                ? "border-orange-400 bg-orange-50" 
                                : "border-gray-200 bg-gray-50"
                            )}
                          >
                            {orderedProducts.map((product: any, index: number) => (
                              <Draggable 
                                key={product.id} 
                                draggableId={product.id} 
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={cn(
                                      "flex items-center gap-3 p-3 bg-white rounded-lg border transition-all",
                                      snapshot.isDragging 
                                        ? "border-orange-400 shadow-lg" 
                                        : "border-gray-200 hover:border-gray-300"
                                    )}
                                  >
                                    {/* Drag Handle */}
                                    <div
                                      {...provided.dragHandleProps}
                                      className="flex-shrink-0 cursor-grab active:cursor-grabbing"
                                    >
                                      <GripVertical className="h-5 w-5 text-gray-400" />
                                    </div>

                                    {/* Position Badge */}
                                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                                      {index + 1}
                                    </div>

                                    {/* Product Thumbnail */}
                                    {product.thumbnail ? (
                                      <img
                                        src={product.thumbnail}
                                        alt={product.name}
                                        className="h-12 w-12 rounded object-cover flex-shrink-0"
                                      />
                                    ) : (
                                      <div className="h-12 w-12 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                                        <Package className="h-6 w-6 text-gray-400" />
                                      </div>
                                    )}

                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {product.name}
                                      </p>
                                      <p className="text-xs text-gray-500 truncate">
                                        {product.sku || product.slug}
                                      </p>
                                    </div>

                                    {/* Remove Button */}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveProduct(product.id)}
                                      className="flex-shrink-0 h-8 w-8 p-0 hover:bg-red-50"
                                    >
                                      <X className="h-4 w-4 text-red-600" />
                                    </Button>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                )}

                {selectedProductIds.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                    <Package className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">
                      No products in this collection. Use the selector above to add products.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Collection Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Feature Image</Label>
                  <div className="flex items-start gap-6">
                    <div
                      onClick={() => document.getElementById('image-upload')?.click()}
                      className={cn(
                        "h-32 w-32 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden",
                        imagePreview ? "border-solid border-gray-200" : "border-gray-300 hover:border-orange-400 hover:bg-orange-50"
                      )}
                    >
                      {imagePreview ? (
                        <>
                          <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-medium">
                            Change
                          </div>
                        </>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-xs text-gray-500">Upload</span>
                        </>
                      )}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="image_alt">Alt Text</Label>
                        <Input
                          id="image_alt"
                          placeholder="Describe image for accessibility"
                          value={formData.image_alt || ""}
                          onChange={(e) => setFormData({ ...formData, image_alt: e.target.value })}
                        />
                      </div>
                      <Input
                        id="image-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <p className="text-xs text-gray-500">
                        JPG, PNG or WEBP. Max 2MB.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Publishing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Active</Label>
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_featured">Featured</Label>
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    min="0"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">SEO</CardTitle>
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
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
