"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Save, ArrowLeft, Plus, Package } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { updateProduct } from "@/lib/actions/products"
import { toast } from "sonner"
import { ProductTabs } from "@/modules/admin/product-creation/product-tabs"
import { ProductPreview } from "@/modules/admin/product-creation/product-preview"
import { useRouter } from "next/navigation"

// Import all tab components
import { BasicInformationTab } from "@/modules/admin/product-creation/basic-information-tab"
import { MediaTab } from "@/modules/admin/product-creation/media-tab"
import { ProductDetailsTab } from "@/modules/admin/product-creation/product-details-tab"
import { ClassificationTab } from "@/modules/admin/product-creation/classification-tab"
import { PricingInventoryTab } from "@/modules/admin/product-creation/pricing-inventory-tab"
import { SEOTab } from "@/modules/admin/product-creation/seo-tab"
import { ReviewPublishTab } from "@/modules/admin/product-creation/review-publish-tab"
import { Badge } from "@/components/ui/badge"

// Types
interface ProductImage {
  id: string
  url: string
  alt: string
  isPrimary: boolean
  base64?: string
}

interface ProductAttribute {
  id: string
  key: string
  value: string
}

interface ProductFormData {
  title: string
  sku: string
  shortDescription: string
  status: "draft" | "active" | "archived"
  images: ProductImage[]
  description: string
  attributes: ProductAttribute[]
  application_id?: string
  category_id?: string
  subcategory_id?: string
  elevator_type_ids?: string[]
  collection_ids?: string[]
  price: string
  comparePrice: string
  cost: string
  taxable: boolean
  bulkPricingAvailable: boolean
  bulkPricingNote: string
  trackInventory: boolean
  stockQuantity: string
  lowStockThreshold: string
  allowBackorders: boolean
  metaTitle: string
  metaDescription: string
  urlHandle: string
  technical_specs?: Record<string, any>
}

interface ProductEditFormProps {
  product: any
  applications: any[]
  collections: any[]
  elevatorTypes: any[]
  variants: any[]
}

export function ProductEditForm({
  product,
  applications,
  collections,
  elevatorTypes,
  variants
}: ProductEditFormProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("basic-information")
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState<ProductFormData>({
    title: product.name || "",
    sku: product.sku || "",
    shortDescription: product.short_description || "",
    status: product.status || "draft",
    images: (product.images || []).map((img: any) => ({
      ...img,
      isPrimary: img.isPrimary ?? img.is_primary ?? false
    })),
    description: product.description || "",
    attributes: (product.specifications || []).map((spec: any, index: number) => ({
      id: `attr-${index}`,
      key: spec.key || "",
      value: spec.value || ""
    })),
    application_id: product.application_id,
    category_id: product.category_id,
    subcategory_id: product.subcategory_id,
    elevator_type_ids: product.elevator_type_ids || [],
    collection_ids: product.collection_ids || [],
    price: product.price?.toString() || "",
    comparePrice: product.compare_at_price?.toString() || "",
    cost: product.cost_per_item?.toString() || "",
    taxable: product.taxable || false,
    bulkPricingAvailable: product.bulk_pricing_available || false,
    bulkPricingNote: product.bulk_pricing_note || "",
    trackInventory: product.track_inventory !== false,
    stockQuantity: product.stock_quantity?.toString() || "0",
    lowStockThreshold: product.low_stock_threshold?.toString() || "5",
    allowBackorders: product.allow_backorders || false,
    metaTitle: product.meta_title || "",
    metaDescription: product.meta_description || "",
    urlHandle: product.slug || "",
    technical_specs: product.technical_specs || {}
  })

  const updateFormData = (updates: Partial<ProductFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    try {
      const productPayload: any = {
        name: formData.title,
        slug: formData.urlHandle,
        description: formData.description,
        short_description: formData.shortDescription,
        status: formData.status,
        application_id: formData.application_id,
        category_id: formData.category_id,
        subcategory_id: formData.subcategory_id,
        elevator_type_ids: formData.elevator_type_ids || [],
        collection_ids: formData.collection_ids || [],
        price: parseFloat(formData.price) || 0,
        compare_at_price: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
        cost_per_item: formData.cost ? parseFloat(formData.cost) : undefined,
        stock_quantity: parseInt(formData.stockQuantity) || 0,
        track_inventory: formData.trackInventory,
        allow_backorders: formData.allowBackorders,
        low_stock_threshold: parseInt(formData.lowStockThreshold) || 5,
        images: formData.images.map((img, index) => ({
          id: img.id || `img-${index}`,
          url: img.url,
          alt: img.alt,
          is_primary: img.isPrimary,
          base64: img.base64,
          sort_order: index
        })),
        specifications: formData.attributes
          .filter(attr => attr.key && attr.value)
          .map(attr => ({
            key: attr.key,
            value: attr.value
          })),
        meta_title: formData.metaTitle,
        meta_description: formData.metaDescription,
        sku: formData.sku,
        taxable: formData.taxable,
        bulk_pricing_available: formData.bulkPricingAvailable,
        bulk_pricing_note: formData.bulkPricingNote,
        technical_specs: formData.technical_specs || {}
      }

      const result = await updateProduct(product.id, productPayload)

      if (result.success) {
        toast.success("Product updated successfully")
        router.push('/admin/products')
      } else {
        throw new Error((result as any).error || 'Failed to update product')
      }

    } catch (error: any) {
      console.error('Error updating product:', error)
      toast.error(error.message || "Failed to update product")
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    "basic-information",
    "media",
    "product-details",
    "classification",
    "pricing-inventory",
    "variants",
    "seo",
    "review"
  ]

  const currentTabIndex = tabs.indexOf(activeTab)

  return (
    <div className="w-full max-w-full overflow-x-hidden p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
              Edit Product
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 mt-1 sm:mt-2">
              {product.name}
            </p>
          </div>
          <div className="flex items-center space-x-3 flex-shrink-0">
            <Button variant="outline" asChild className="bg-white border-gray-200 hover:bg-gray-50">
              <Link href="/admin/products">Cancel</Link>
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/25"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentTabIndex + 1} of {tabs.length}
            </span>
            <Badge variant="secondary">Editing</Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentTabIndex + 1) / tabs.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Tabs */}
        <ProductTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content */}
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-4 w-full">
          <div className="lg:col-span-3 min-w-0 w-full space-y-6">
            {activeTab === "basic-information" && (
              <BasicInformationTab
                formData={{
                  title: formData.title,
                  sku: formData.sku,
                  shortDescription: formData.shortDescription,
                  status: formData.status
                }}
                onFormDataChange={(updates) => updateFormData(updates)}
              />
            )}

            {activeTab === "media" && (
              <MediaTab
                images={formData.images}
                onImagesChange={(images: ProductImage[]) => updateFormData({ images })}
              />
            )}

            {activeTab === "product-details" && (
              <ProductDetailsTab
                formData={{
                  description: formData.description,
                  attributes: formData.attributes
                }}
                onFormDataChange={(updates) => updateFormData(updates)}
              />
            )}

            {activeTab === "classification" && (
              <ClassificationTab
                formData={{
                  application_id: formData.application_id,
                  category_id: formData.category_id,
                  subcategory_id: formData.subcategory_id,
                  elevator_type_ids: formData.elevator_type_ids,
                  collection_ids: formData.collection_ids
                }}
                onFormDataChange={(updates) => updateFormData(updates)}
              />
            )}

            {activeTab === "pricing-inventory" && (
              <PricingInventoryTab
                formData={{
                  price: formData.price,
                  comparePrice: formData.comparePrice,
                  cost: formData.cost,
                  taxable: formData.taxable,
                  bulkPricingAvailable: formData.bulkPricingAvailable,
                  bulkPricingNote: formData.bulkPricingNote,
                  trackInventory: formData.trackInventory,
                  stockQuantity: formData.stockQuantity,
                  lowStockThreshold: formData.lowStockThreshold,
                  allowBackorders: formData.allowBackorders
                }}
                onFormDataChange={(updates) => updateFormData(updates)}
                hasVariants={variants.length > 0}
              />
            )}

            {activeTab === "seo" && (
              <SEOTab
                seoData={{
                  metaTitle: formData.metaTitle,
                  metaDescription: formData.metaDescription,
                  urlHandle: formData.urlHandle
                }}
                onSEODataChange={(updates) => updateFormData(updates)}
                productName={formData.title}
                productDescription={formData.description}
              />
            )}

            {activeTab === "variants" && (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Product Variants</CardTitle>
                  <CardDescription>
                    Manage variants on individual variant detail pages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {variants.length > 0 ? (
                    <div className="space-y-3">
                      {variants.map((variant: any) => (
                        <Link
                          key={variant.id}
                          href={`/admin/products/${product.id}/variants/${variant.id}`}
                          className="block p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{variant.name}</h4>
                              <p className="text-sm text-gray-500 mt-1">SKU: {variant.sku}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">₹{variant.price}</p>
                              <p className="text-sm text-gray-500">{variant.inventory_quantity} in stock</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                      <Button asChild className="w-full mt-4 bg-orange-600 hover:bg-orange-700">
                        <Link href={`/admin/products/${product.id}/variants`}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add New Variant
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-base font-medium text-gray-900 mb-2">No variants yet</h3>
                      <p className="text-sm text-gray-500 mb-6">
                        Create variants to offer different options of this product
                      </p>
                      <Button asChild className="bg-orange-600 hover:bg-orange-700">
                        <Link href={`/admin/products/${product.id}/variants`}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create First Variant
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "review" && (
              <ReviewPublishTab
                formData={formData}
                onGoToStep={(step) => setActiveTab(step)}
                validationErrors={[]}
              />
            )}
          </div>

          {/* Product Preview - Always Visible */}
          <div className="lg:col-span-1 min-w-0 w-full">
            <ProductPreview
              productName={formData.title}
              productSubtitle={formData.shortDescription}
              price={formData.price}
              comparePrice={formData.comparePrice}
              images={formData.images}
              status={formData.status}
              hasVariants={variants.length > 0}
              variantCount={variants.length}
            />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => {
              const prevIndex = currentTabIndex - 1
              if (prevIndex >= 0) {
                setActiveTab(tabs[prevIndex])
              }
            }}
            disabled={currentTabIndex === 0}
            className="bg-white"
          >
            Previous
          </Button>

          <div className="flex items-center gap-3">
            <Button variant="outline" asChild className="bg-white">
              <Link href="/admin/products">Cancel</Link>
            </Button>

            {currentTabIndex < tabs.length - 1 ? (
              <Button
                onClick={() => {
                  const nextIndex = currentTabIndex + 1
                  if (nextIndex < tabs.length) {
                    setActiveTab(tabs[nextIndex])
                  }
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/25"
              >
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
