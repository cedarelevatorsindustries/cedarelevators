"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

interface BasicInformationData {
  title: string
  sku: string
  shortDescription: string
  status: "draft" | "active" | "archived"
}

interface BasicInformationTabProps {
  formData: BasicInformationData
  onFormDataChange: (updates: Partial<BasicInformationData>) => void
}

export function BasicInformationTab({ formData, onFormDataChange }: BasicInformationTabProps) {
  const [validationState, setValidationState] = useState({
    title: false,
    sku: false,
    shortDescription: false
  })

  // Auto-generate SKU from title
  useEffect(() => {
    if (formData.title && !formData.sku) {
      const generatedSku = formData.title
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 20)
      onFormDataChange({ sku: `SKU-${generatedSku}` })
    }
  }, [formData.title])

  // Real-time validation
  useEffect(() => {
    setValidationState({
      title: formData.title.length >= 3,
      sku: formData.sku.length >= 3,
      shortDescription: formData.shortDescription.length > 0
    })
  }, [formData.title, formData.sku, formData.shortDescription])

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-1">Step 1: Define Product Identity</h3>
        <p className="text-sm text-blue-700">Basic information that identifies this product in your catalog</p>
      </div>

      {/* Product Title & SKU */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Product Identity
            {validationState.title && validationState.sku && (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            )}
          </CardTitle>
          <CardDescription className="text-gray-500">
            The primary identifiers for this product
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              Product Title <span className="text-red-500">*</span>
              {formData.title && (
                validationState.title ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                )
              )}
            </Label>
            <Input
              id="title"
              placeholder="e.g., Monarch NICE 3000+ Integrated Controller"
              value={formData.title}
              onChange={(e) => onFormDataChange({ title: e.target.value })}
              className={`w-full ${
                formData.title && !validationState.title
                  ? 'border-orange-300 focus:border-orange-500'
                  : validationState.title
                  ? 'border-green-300'
                  : ''
              }`}
            />
            <p className="text-xs text-gray-500">
              {formData.title.length > 0 ? `${formData.title.length} characters` : 'Minimum 3 characters required'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku" className="flex items-center gap-2">
              SKU (Stock Keeping Unit) <span className="text-red-500">*</span>
              {validationState.sku && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            </Label>
            <Input
              id="sku"
              placeholder="Auto-generated from title (editable)"
              value={formData.sku}
              onChange={(e) => onFormDataChange({ sku: e.target.value })}
              className={`w-full ${
                validationState.sku ? 'border-green-300' : ''
              }`}
            />
            <p className="text-xs text-gray-500">
              Unique identifier for inventory tracking
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Short Description */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Short Description
            {validationState.shortDescription && (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            )}
          </CardTitle>
          <CardDescription className="text-gray-500">
            1-2 lines shown near the title on product cards and PDP header
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shortDescription" className="flex items-center gap-2">
              Short Description <span className="text-red-500">*</span>
              {validationState.shortDescription && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            </Label>
            <Textarea
              id="shortDescription"
              placeholder="e.g., Compatible with Otis Gen2 / NICE 3000 Series | High-efficiency drive system"
              value={formData.shortDescription}
              onChange={(e) => onFormDataChange({ shortDescription: e.target.value })}
              rows={3}
              maxLength={200}
              className={`w-full ${
                validationState.shortDescription ? 'border-green-300' : ''
              }`}
            />
            <p className="text-xs text-gray-500">
              {formData.shortDescription.length}/200 characters • Keep it concise and informative
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Product Status</CardTitle>
          <CardDescription className="text-gray-500">
            Control product visibility in the catalog
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: "draft" | "active" | "archived") => onFormDataChange({ status: value })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Draft</Badge>
                    <span className="text-sm text-gray-600">Hidden from catalog</span>
                  </div>
                </SelectItem>
                <SelectItem value="active">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500">Active</Badge>
                    <span className="text-sm text-gray-600">Visible in catalog</span>
                  </div>
                </SelectItem>
                <SelectItem value="archived">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Archived</Badge>
                    <span className="text-sm text-gray-600">Discontinued</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}