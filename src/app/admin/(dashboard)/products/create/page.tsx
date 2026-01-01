"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Save, ArrowRight, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createProduct } from "@/lib/actions/products"
import { toast } from "sonner"
import { ProductTabs } from "@/modules/admin/product-creation/product-tabs"
import { ProductPreview } from "@/modules/admin/product-creation/product-preview"
import { useConfirmDialog } from "@/hooks/use-confirm-dialog"

// Import all tab components
import { BasicInformationTab } from "@/modules/admin/product-creation/basic-information-tab"
import { MediaTab } from "@/modules/admin/product-creation/media-tab"
import { ProductDetailsTab } from "@/modules/admin/product-creation/product-details-tab"
import { VariantsTab, type VariantOption, type ProductVariant } from "@/modules/admin/product-creation/variants-tab"
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
  // Step 1: Basic Information
  title: string
  sku: string
  shortDescription: string
  status: "draft" | "active" | "archived"

  // Step 2: Media
  images: ProductImage[]

  // Step 3: Product Details & Attributes
  description: string
  attributes: ProductAttribute[]

  // Step 4: Variants
  options: VariantOption[]
  variants: ProductVariant[]

  // Step 5: Classification
  application_id?: string
  category_id?: string
  subcategory_id?: string
  elevator_type_ids?: string[]
  collection_ids?: string[]

  // Step 6: Pricing & Inventory
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

  // Step 7: SEO
  metaTitle: string
  metaDescription: string
  urlHandle: string

  // Technical specs
  technical_specs?: Record<string, any>
}

interface ValidationError {
  field: string
  message: string
  step: string
}

export default function CreateProductPage() {
  const [activeTab, setActiveTab] = useState("basic-information")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Initialize confirmation dialog
  const { confirm, ConfirmDialog } = useConfirmDialog()

  const [formData, setFormData] = useState<ProductFormData>({
    // Step 1: Basic Information
    title: "",
    sku: "",
    shortDescription: "",
    status: "draft",

    // Step 2: Media
    images: [],

    // Step 3: Product Details & Attributes
    description: "",
    attributes: [],

    // Step 4: Variants
    options: [],
    variants: [],

    // Step 5: Classification
    application_id: undefined,
    category_id: undefined,
    subcategory_id: undefined,
    elevator_type_ids: [],
    collection_ids: [],

    // Step 6: Pricing & Inventory
    price: "",
    comparePrice: "",
    cost: "",
    taxable: false,
    bulkPricingAvailable: false,
    bulkPricingNote: "",
    trackInventory: true,
    stockQuantity: "0",
    lowStockThreshold: "5",
    allowBackorders: false,

    // Step 7: SEO
    metaTitle: "",
    metaDescription: "",
    urlHandle: ""
  })

  const updateFormData = (updates: Partial<ProductFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  // Auto-save functionality (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.title) {
        autoSaveDraft()
      }
    }, 3000) // Save after 3 seconds of inactivity

    return () => clearTimeout(timeoutId)
  }, [formData])

  const autoSaveDraft = async () => {
    if (!formData.title || isSaving) return

    setIsSaving(true)
    try {
      // Save to localStorage as draft
      localStorage.setItem('product-draft', JSON.stringify({
        ...formData,
        lastSaved: new Date().toISOString()
      }))
      setLastSaved(new Date())
    } catch (error) {
      console.error('Error auto-saving draft:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('product-draft')
    if (draft) {
      try {
        const parsed = JSON.parse(draft)
        const { lastSaved: savedTime, ...draftData } = parsed

        // Use async function to handle promise-based confirm
        const checkRestore = async () => {
          const shouldRestore = await confirm({
            title: 'Restore Draft?',
            description: 'Found an unsaved draft. Would you like to restore it?',
            confirmText: 'Restore',
            cancelText: 'Discard'
          })

          if (shouldRestore) {
            setFormData(draftData)
            setLastSaved(new Date(savedTime))
            toast.success('Draft restored')
          } else {
            localStorage.removeItem('product-draft')
          }
        }

        checkRestore()
      } catch (error) {
        console.error('Error loading draft:', error)
        localStorage.removeItem('product-draft')
      }
    }
  }, [confirm])

  // Validation
  const validateForm = (): ValidationError[] => {
    const errors: ValidationError[] = []

    // Step 1: Basic Information
    if (!formData.title || formData.title.length < 3) {
      errors.push({
        field: 'title',
        message: 'Product title is required (minimum 3 characters)',
        step: 'basic-information'
      })
    }
    if (!formData.sku || formData.sku.length < 3) {
      errors.push({
        field: 'sku',
        message: 'SKU is required (minimum 3 characters)',
        step: 'basic-information'
      })
    }
    if (!formData.shortDescription) {
      errors.push({
        field: 'shortDescription',
        message: 'Short description is required',
        step: 'basic-information'
      })
    }

    // Step 2: Media
    if (formData.images.length === 0) {
      errors.push({
        field: 'images',
        message: 'At least one product image is required',
        step: 'media'
      })
    }

    // Step 3: Product Details
    if (!formData.description || formData.description.length < 50) {
      errors.push({
        field: 'description',
        message: 'Description is required (minimum 50 characters)',
        step: 'product-details'
      })
    }

    // Step 5: Classification (Optional - products can exist without catalog placement)
    // No validation errors for classification fields - they are all optional

    // Step 6: Pricing
    if (!formData.price || parseFloat(formData.price) <= 0) {
      errors.push({
        field: 'price',
        message: 'Base price is required and must be greater than 0',
        step: 'pricing-inventory'
      })
    }

    return errors
  }

  const handleSubmit = async (isDraft = false) => {
    setIsLoading(true)

    try {
      // Validate only if publishing (not draft)
      if (!isDraft) {
        const errors = validateForm()
        if (errors.length > 0) {
          toast.error(`Please fix ${errors.length} validation error(s)`)
          setActiveTab('review')
          setIsLoading(false)
          return
        }
      }

      // Map form data to API format
      const productPayload: any = {
        name: formData.title,
        slug: formData.urlHandle || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        description: formData.description,
        short_description: formData.shortDescription,
        status: isDraft ? 'draft' : formData.status,

        // Classification
        application_id: formData.application_id,
        category_id: formData.category_id,
        subcategory_id: formData.subcategory_id,
        elevator_type_ids: formData.elevator_type_ids || [],
        collection_ids: formData.collection_ids || [],

        // Pricing
        price: parseFloat(formData.price) || 0,
        compare_at_price: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
        cost_per_item: formData.cost ? parseFloat(formData.cost) : undefined,

        // Inventory
        stock_quantity: parseInt(formData.stockQuantity) || 0,
        track_inventory: formData.trackInventory,
        allow_backorders: formData.allowBackorders,
        low_stock_threshold: parseInt(formData.lowStockThreshold) || 5,

        // Images
        images: formData.images.map((img, index) => ({
          id: img.id || `img-${index}`,
          url: img.url,
          alt: img.alt,
          is_primary: img.isPrimary,
          base64: img.base64,
          sort_order: index
        })),

        // Attributes
        specifications: formData.attributes
          .filter(attr => attr.key && attr.value)
          .map(attr => ({
            key: attr.key,
            value: attr.value
          })),

        // SEO
        meta_title: formData.metaTitle,
        meta_description: formData.metaDescription,

        // Other fields
        sku: formData.sku,
        taxable: formData.taxable,
        bulk_pricing_available: formData.bulkPricingAvailable,
        bulk_pricing_note: formData.bulkPricingNote,

        is_featured: false,
        view_count: 0,
        dimensions: { unit: 'cm' },

        // Technical Specs and Extras
        technical_specs: formData.technical_specs || {},

        // Variants
        variants: formData.variants || []
      }

      const result = await createProduct(productPayload)

      if (result.success) {
        toast.success(isDraft ? "Draft saved successfully" : "Product published successfully")
        localStorage.removeItem('product-draft')
        window.location.href = '/admin/products'
      } else {
        throw new Error((result as any).error || 'Failed to create product')
      }

    } catch (error: any) {
      console.error('Error creating product:', error)
      toast.error(error.message || "Failed to create product")
    } finally {
      setIsLoading(false)
    }
  }

  const canPublish = () => {
    const errors = validateForm()
    return errors.length === 0
  }

  const validationErrors = validateForm()

  // Navigation helpers
  const tabs = [
    "basic-information",
    "media",
    "product-details",
    "variants",
    "classification",
    "pricing-inventory",
    "seo",
    "review"
  ]

  const currentTabIndex = tabs.indexOf(activeTab)
  const canGoNext = currentTabIndex < tabs.length - 1
  const canGoPrevious = currentTabIndex > 0

  const goToNextTab = () => {
    if (canGoNext) {
      setActiveTab(tabs[currentTabIndex + 1])
    }
  }

  const goToPreviousTab = () => {
    if (canGoPrevious) {
      setActiveTab(tabs[currentTabIndex - 1])
    }
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
              Add Product
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 mt-1 sm:mt-2">
              Create a new elevator component for your catalog
            </p>
            {lastSaved && (
              <p className="text-xs text-gray-500 mt-1">
                {isSaving ? (
                  <span className="text-orange-600">Saving draft...</span>
                ) : (
                  <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
                )}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3 flex-shrink-0">
            <Button variant="outline" asChild className="bg-white border-gray-200 hover:bg-gray-50">
              <Link href="/admin/products">Cancel</Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSubmit(true)}
              disabled={isLoading || !formData.title}
              className="bg-white border-gray-200 hover:bg-gray-50"
            >
              Save as Draft
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/25"
              onClick={() => handleSubmit(false)}
              disabled={isLoading || !canPublish()}
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentTabIndex + 1} of {tabs.length}
            </span>
            <Badge variant={canPublish() ? "default" : "secondary"}>
              {canPublish() ? "Ready to publish" : `${validationErrors.length} issues`}
            </Badge>
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

            {activeTab === "variants" && (
              <VariantsTab
                options={formData.options}
                variants={formData.variants}
                onOptionsChange={(options) => updateFormData({ options })}
                onVariantsChange={(variants) => updateFormData({ variants })}
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
                hasVariants={formData.variants.length > 0}
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

            {activeTab === "review" && (
              <ReviewPublishTab
                formData={formData}
                onGoToStep={setActiveTab}
                validationErrors={validationErrors}
              />
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                onClick={goToPreviousTab}
                disabled={!canGoPrevious}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              {canGoNext ? (
                <Button
                  onClick={goToNextTab}
                  className="gap-2 bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => handleSubmit(false)}
                  disabled={isLoading || !canPublish()}
                  className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Save className="h-4 w-4" />
                  {isLoading ? "Publishing..." : "Publish Product"}
                </Button>
              )}
            </div>
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
              hasVariants={formData.variants.length > 0}
              variantCount={formData.variants.length}
            />
          </div>
        </div>
      </div>

      {/* Custom Confirmation Dialog */}
      <ConfirmDialog />
    </div>
  )
}
