"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import Link from "next/link"
import { createProduct } from "@/lib/actions/products"
import { toast } from "sonner"
import { ProductTabs } from "@/modules/admin/product-creation/product-tabs"
import { ProductPreview } from "@/modules/admin/product-creation/product-preview"

// Import the tab components with correct names
import { GeneralTab } from "@/modules/admin/product-creation/general-tab"
import { MediaTab } from "@/modules/admin/product-creation/media-tab"
import { PricingTab } from "@/modules/admin/product-creation/pricing-tab"
import { VariantsTab, type VariantOption, type ProductVariant } from "@/modules/admin/product-creation/variants-tab"
import { InventoryTab } from "@/modules/admin/product-creation/inventory-tab"
import { OrganizationTab } from "@/modules/admin/product-creation/organization-tab"
import { SEOTab } from "@/modules/admin/product-creation/seo-tab"

// Types matching local state needs
interface ProductImage {
  id: string
  url: string
  alt: string
  isPrimary: boolean
}

// Local form state interface
interface ProductFormData {
  // General
  name: string
  subtitle: string
  description: string
  highlights: string[]
  status: "draft" | "active" | "archived"

  // Media
  images: ProductImage[]

  // Pricing
  pricingMode: "single" | "variant"
  price: string
  comparePrice: string
  cost: string
  taxable: boolean

  // Variants
  options: VariantOption[]
  variants: ProductVariant[]

  // Inventory
  trackInventory: boolean
  allowBackorders: boolean
  lowStockThreshold: string
  globalStock: string

  // Organization (Cedar Interconnection Logic)
  application_id?: string
  category_id?: string
  subcategory_id?: string
  elevator_type_ids?: string[]
  collection_ids?: string[]
  
  // Legacy (deprecated)
  categories: string[]
  collections: string[]
  tags: string[]

  // SEO
  metaTitle: string
  metaDescription: string
  urlHandle: string
}

export default function CreateProductPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<ProductFormData>({
    // General
    name: "",
    subtitle: "",
    description: "",
    highlights: [],
    status: "draft",

    // Media
    images: [],

    // Pricing
    pricingMode: "single",
    price: "",
    comparePrice: "",
    cost: "",
    taxable: false,

    // Variants
    options: [],
    variants: [],

    // Inventory
    trackInventory: true,
    allowBackorders: false,
    lowStockThreshold: "5",
    globalStock: "0",

    // Organization
    categories: [],
    collections: [],
    tags: [],

    // SEO
    metaTitle: "",
    metaDescription: "",
    urlHandle: ""
  })

  const updateFormData = (updates: Partial<ProductFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleSubmit = async (isDraft = false) => {
    setIsLoading(true)
    try {
      // Map local form data to API ProductFormData expected by server action
      // We perform a loose cast with 'any' to construct the payload, 
      // relying on the server action validation.
      const productPayload: any = {
        name: formData.name,
        slug: formData.urlHandle || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        description: formData.description,
        short_description: formData.subtitle,
        status: isDraft ? 'draft' : formData.status,

        // Pricing (for single product mode)
        price: formData.pricingMode === 'single' ? (parseFloat(formData.price) || 0) : 0,
        compare_at_price: formData.pricingMode === 'single' ? (parseFloat(formData.comparePrice) || undefined) : undefined,
        cost_per_item: formData.pricingMode === 'single' ? (parseFloat(formData.cost) || undefined) : undefined,
        stock_quantity: formData.pricingMode === 'single' ? (parseInt(formData.globalStock) || 0) : 0,

        // Map images to new structure
        images: formData.images.map((img, index) => ({
          id: img.id || `img-${index}`,
          url: img.url,
          alt: img.alt,
          is_primary: img.isPrimary,
          sort_order: index
        })),

        // Defaults
        dimensions: { unit: 'cm' },

        // Map tags and highlights
        tags: [...formData.tags, ...formData.highlights],
        specifications: [], // Placeholder for now

        is_featured: false,
        view_count: 0
      }

      // TODO: Handle Variant creation separately or expand server action
      // For now we create the base product. Variants require a valid product ID.

      const newProduct = await createProduct(productPayload)

      toast.success("Product created successfully")
      // Redirect to products list
      window.location.href = '/admin/products'

    } catch (error: any) {
      console.error('Error creating product:', error)
      toast.error(error.message || "Failed to create product")
    } finally {
      setIsLoading(false)
    }
  }

  const canPublish = () => {
    return formData.name &&
      formData.description &&
      (formData.variants.length > 0 || formData.price) &&
      formData.images.length > 0
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
          </div>
          <div className="flex items-center space-x-3 flex-shrink-0">
            <Button variant="outline" asChild className="bg-white border-gray-200 hover:bg-gray-50">
              <Link href="/admin/products">Cancel</Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSubmit(true)}
              disabled={isLoading}
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

        {/* Tabs */}
        <ProductTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content */}
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-4 w-full">
          <div className="lg:col-span-3 min-w-0 w-full space-y-6">
            {activeTab === "general" && (
              <GeneralTab
                formData={{
                  name: formData.name,
                  subtitle: formData.subtitle,
                  description: formData.description,
                  highlights: formData.highlights,
                  status: formData.status
                }}
                onFormDataChange={(updates: Partial<ProductFormData>) => updateFormData(updates)}
              />
            )}

            {activeTab === "media" && (
              <MediaTab
                images={formData.images}
                onImagesChange={(images: ProductImage[]) => updateFormData({ images })}
              />
            )}

            {activeTab === "pricing" && (
              <PricingTab
                pricingData={{
                  mode: formData.pricingMode,
                  price: formData.price,
                  comparePrice: formData.comparePrice,
                  cost: formData.cost,
                  taxable: formData.taxable
                }}
                onPricingDataChange={(updates: Partial<ProductFormData>) => updateFormData(updates)}
                hasVariants={formData.variants.length > 0}
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

            {activeTab === "inventory" && (
              <InventoryTab
                inventoryData={{
                  trackInventory: formData.trackInventory,
                  allowBackorders: formData.allowBackorders,
                  lowStockThreshold: formData.lowStockThreshold,
                  globalStock: formData.globalStock
                }}
                onInventoryDataChange={(updates) => updateFormData(updates)}
                hasVariants={formData.variants.length > 0}
                variantCount={formData.variants.length}
              />
            )}

            {activeTab === "organization" && (
              <OrganizationTab
                organizationData={{
                  categories: formData.categories,
                  collections: formData.collections,
                  tags: formData.tags
                }}
                onOrganizationDataChange={(updates) => updateFormData(updates)}
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
                productName={formData.name}
                productDescription={formData.description}
              />
            )}
          </div>

          {/* Product Preview - Always Visible */}
          <div className="lg:col-span-1 min-w-0 w-full">
            <ProductPreview
              productName={formData.name}
              productSubtitle={formData.subtitle}
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
    </div>
  )
}