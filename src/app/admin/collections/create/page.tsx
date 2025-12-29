"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Upload, ArrowLeft, LoaderCircle, GripVertical, X, Package } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd"
import { useCreateCollection, useUploadCollectionImage } from "@/hooks/queries/useCollections"
import { useProducts } from "@/hooks/queries/useProducts"
import { ProductSelector } from "@/components/admin/ProductSelector"
import { NoProductsWarning } from "@/components/admin/NoProductsWarning"
import type { CollectionFormData } from "@/lib/types/collections"
import { generateSlug } from "@/lib/types/collections"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function CreateCollectionPage() {
  const router = useRouter()
  const createMutation = useCreateCollection()
  const uploadMutation = useUploadCollectionImage()

  // Get all products
  const { data: productsData, isLoading: productsLoading } = useProducts({}, 1, 1000)
  const allProducts = productsData?.products || []

  const [formData, setFormData] = useState<CollectionFormData>({
    title: "",
    slug: "",
    description: "",
    image_url: "",
    image_alt: "",
    type: "manual",
    is_active: true,
    is_featured: false,
    sort_order: 0,
    meta_title: "",
    meta_description: "",
    product_ids: []
  })

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [orderedProductIds, setOrderedProductIds] = useState<string[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)

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
    // When products are selected, add new ones to the end of ordered list
    const newProducts = productIds.filter(id => !orderedProductIds.includes(id))
    const removedProducts = orderedProductIds.filter(id => !productIds.includes(id))
    
    // Update ordered list: remove deselected, add new ones
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
  }

  const handleRemoveProduct = (productId: string) => {
    setSelectedProductIds(prev => prev.filter(id => id !== productId))
    setOrderedProductIds(prev => prev.filter(id => id !== productId))
  }

  const handleSubmit = async () => {
    try {
      if (!formData.title || !formData.slug) {
        toast.error('Please fill in required fields')
        return
      }

      let imageUrl = formData.image_url

      // Upload image if selected
      if (imageFile) {
        setIsUploading(true)
        const result = await uploadMutation.mutateAsync(imageFile)
        if (result.success && result.url) {
          imageUrl = result.url
        }
        setIsUploading(false)
      }

      // Create collection with ordered product IDs
      const result = await createMutation.mutateAsync({
        ...formData,
        image_url: imageUrl,
        product_ids: orderedProductIds // Use ordered list
      })

      if (result.success) {
        toast.success(`Collection created with ${orderedProductIds.length} products!`)
        router.push('/admin/collections')
      }
    } catch (error) {
      console.error('Error creating collection:', error)
      toast.error('Failed to create collection')
      setIsUploading(false)
    }
  }

  const isLoading = createMutation.isPending || isUploading
  const hasProducts = allProducts.length > 0

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
              Create Collection
            </h1>
            <p className="text-gray-600 mt-1">
              Create a curated collection of products
            </p>
          </div>
          <Button variant="outline" asChild className="border-gray-300 bg-white">
            <Link href="/admin/collections">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancel
            </Link>
          </Button>
        </div>

        {/* No Products Warning */}
        {!hasProducts && !productsLoading && (
          <NoProductsWarning 
            title="Cannot Create Collection"
            description="You need to create products before you can create collections. Products are required to build collections."
            showCreateButton={true}
          />
        )}

        {/* Main Form */}
        {hasProducts && (
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Left Column - Main Form */}
            <div className="lg:col-span-8 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Collection details and settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="title">Collection Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Summer Sale, Best Sellers"
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
                      placeholder="Describe this collection..."
                      value={formData.description || ''}
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
                    <p className="text-xs text-gray-500">
                      Manual: You select products. Automatic: Products match rules.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Product Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Products</CardTitle>
                  <CardDescription>
                    Select and order products for this collection
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
                        No products selected. Use the selector above to add products.
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

            {/* Right Column - Settings */}
            <div className="lg:col-span-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Publishing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_active">Active</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_featured">Featured</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_featured"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                    </div>
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
                      value={formData.meta_title || ""}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meta_description">Meta Description</Label>
                    <Textarea
                      id="meta_description"
                      value={formData.meta_description || ""}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Button
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                onClick={handleSubmit}
                disabled={isLoading || !hasProducts}
              >
                {isLoading ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    {isUploading ? 'Uploading...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Collection
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
