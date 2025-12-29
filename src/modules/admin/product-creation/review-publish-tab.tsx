"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle2,
  AlertTriangle,
  Edit,
  Image as ImageIcon,
  Package,
  FolderTree,
  DollarSign,
  FileText,
  Globe,
  ArrowLeft
} from 'lucide-react'
import Image from 'next/image'

interface ValidationError {
  field: string
  message: string
  step: string
}

interface ReviewPublishTabProps {
  formData: any
  onGoToStep: (step: string) => void
  validationErrors: ValidationError[]
}

export function ReviewPublishTab({ formData, onGoToStep, validationErrors }: ReviewPublishTabProps) {
  const hasErrors = validationErrors.length > 0
  const primaryImage = formData.images?.[0]
  const filledAttributes = formData.attributes?.filter((attr: any) => attr.key && attr.value).length || 0

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-1">Step 8: Review & Publish</h3>
        <p className="text-sm text-blue-700">Final review before publishing your product</p>
      </div>

      {/* Validation Summary */}
      {hasErrors ? (
        <Card className="border-red-300 bg-red-50">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-red-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Validation Issues Found
            </CardTitle>
            <CardDescription className="text-red-700">
              Please fix the following issues before publishing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {validationErrors.map((error, index) => (
                <div key={index} className="flex items-start justify-between gap-4 p-3 bg-white rounded-lg border border-red-200">
                  <div className="flex-1">
                    <p className="font-medium text-red-900">{error.message}</p>
                    <p className="text-sm text-red-700">Field: {error.field}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onGoToStep(error.step)}
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Fix
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-300 bg-green-50">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-green-900 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              All Validation Checks Passed
            </CardTitle>
            <CardDescription className="text-green-700">
              Your product is ready to publish!
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Product Identity Summary */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Product Identity
            </CardTitle>
            <CardDescription>Basic information</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onGoToStep('basic-information')}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">Title</p>
                <p className="font-medium text-gray-900">{formData.title || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">SKU</p>
                <p className="font-medium text-gray-900">{formData.sku || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <Badge variant={formData.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                  {formData.status}
                </Badge>
              </div>
            </div>
            {formData.shortDescription && (
              <div>
                <p className="text-xs text-gray-500">Short Description</p>
                <p className="text-sm text-gray-700">{formData.shortDescription}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Media Preview */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Media
            </CardTitle>
            <CardDescription>{formData.images?.length || 0} images</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onGoToStep('media')}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          {formData.images?.length > 0 ? (
            <div className="flex gap-2">
              {formData.images.slice(0, 4).map((img: any, index: number) => (
                <div key={img.id} className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200">
                  <Image
                    src={img.url}
                    alt={img.alt || `Product image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  {img.isPrimary && (
                    <Badge className="absolute top-1 left-1 text-xs">Primary</Badge>
                  )}
                </div>
              ))}
              {formData.images.length > 4 && (
                <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <span className="text-xs text-gray-500">+{formData.images.length - 4}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No images added</p>
          )}
        </CardContent>
      </Card>

      {/* Product Details Summary */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Details & Attributes
            </CardTitle>
            <CardDescription>{filledAttributes} attributes</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onGoToStep('product-details')}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Description</p>
              <p className="text-sm text-gray-700 line-clamp-3">
                {formData.description || 'No description added'}
              </p>
            </div>
            {filledAttributes > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Attributes</p>
                <div className="grid grid-cols-2 gap-2">
                  {formData.attributes
                    .filter((attr: any) => attr.key && attr.value)
                    .slice(0, 4)
                    .map((attr: any) => (
                      <div key={attr.id} className="bg-gray-50 p-2 rounded">
                        <p className="text-xs font-medium text-gray-700">{attr.key}</p>
                        <p className="text-xs text-gray-600">{attr.value}</p>
                      </div>
                    ))}
                </div>
                {filledAttributes > 4 && (
                  <p className="text-xs text-gray-500 mt-2">+{filledAttributes - 4} more attributes</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Variants Summary */}
      {formData.variants?.length > 0 && (
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">Variants</CardTitle>
              <CardDescription>{formData.variants.length} variants</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onGoToStep('variants')}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {formData.variants.slice(0, 3).map((variant: any) => (
                <div key={variant.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <p className="text-sm font-medium">{variant.name}</p>
                  <div className="flex items-center gap-2">
                    {variant.price && <Badge variant="outline">₹{variant.price}</Badge>}
                    {variant.stock && <Badge variant="secondary">{variant.stock} units</Badge>}
                  </div>
                </div>
              ))}
              {formData.variants.length > 3 && (
                <p className="text-xs text-gray-500 text-center">+{formData.variants.length - 3} more variants</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Classification Summary */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FolderTree className="h-5 w-5" />
              Classification
            </CardTitle>
            <CardDescription>Catalog placement</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onGoToStep('classification')}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Application</p>
              <p className="text-sm font-medium">{formData.application_id || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Category</p>
              <p className="text-sm font-medium">{formData.category_id || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Elevator Types</p>
              <p className="text-sm font-medium">{formData.elevator_type_ids?.length || 0} selected</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Collections</p>
              <p className="text-sm font-medium">{formData.collection_ids?.length || 0} selected</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Inventory Summary */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing & Inventory
            </CardTitle>
            <CardDescription>Pricing and stock management</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onGoToStep('pricing-inventory')}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Base Price</p>
              <p className="text-lg font-bold text-gray-900">₹{formData.price || '0'}</p>
            </div>
            {formData.comparePrice && (
              <div>
                <p className="text-xs text-gray-500">Compare Price</p>
                <p className="text-sm font-medium text-gray-600 line-through">₹{formData.comparePrice}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500">Stock Tracking</p>
              <Badge variant={formData.trackInventory ? 'default' : 'secondary'}>
                {formData.trackInventory ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            {formData.trackInventory && (
              <div>
                <p className="text-xs text-gray-500">Stock Quantity</p>
                <p className="text-sm font-medium">{formData.stockQuantity || 0} units</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* SEO Preview */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Globe className="h-5 w-5" />
              SEO Preview
            </CardTitle>
            <CardDescription>How it appears in search results</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onGoToStep('seo')}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="space-y-1">
              <p className="text-blue-600 text-sm font-medium">
                {formData.metaTitle || formData.title || 'Product Title'}
              </p>
              <p className="text-green-700 text-xs">
                https://cedarlevators.com/products/{formData.urlHandle || 'product-slug'}
              </p>
              <p className="text-gray-700 text-sm line-clamp-2">
                {formData.metaDescription || formData.shortDescription || formData.description || 'Product description will appear here in search results...'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}