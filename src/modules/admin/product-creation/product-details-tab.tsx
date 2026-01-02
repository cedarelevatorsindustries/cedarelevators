"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Plus, X, CheckCircle2, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ProductAttribute {
  id: string
  key: string
  value: string
}

interface ProductDetailsData {
  description: string
  attributes: ProductAttribute[]
  tags?: string[]
  technical_specs?: Record<string, any>
}

interface ProductDetailsTabProps {
  formData: ProductDetailsData
  onFormDataChange: (updates: Partial<ProductDetailsData>) => void
}

export function ProductDetailsTab({ formData, onFormDataChange }: ProductDetailsTabProps) {
  const addAttribute = () => {
    const newAttribute: ProductAttribute = {
      id: `attr-${Date.now()}`,
      key: '',
      value: ''
    }
    onFormDataChange({
      attributes: [...formData.attributes, newAttribute]
    })
  }

  const updateAttribute = (id: string, field: 'key' | 'value', newValue: string) => {
    const updatedAttributes = formData.attributes.map(attr =>
      attr.id === id ? { ...attr, [field]: newValue } : attr
    )
    onFormDataChange({ attributes: updatedAttributes })
  }

  const removeAttribute = (id: string) => {
    onFormDataChange({
      attributes: formData.attributes.filter(attr => attr.id !== id)
    })
  }

  const filledAttributes = formData.attributes.filter(attr => attr.key && attr.value).length
  const hasDescription = formData.description.length >= 50

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-1">Step 3: Product Details & Attributes</h3>
        <p className="text-sm text-blue-700">Technical description and key specifications for the PDP</p>
      </div>

      {/* Brief Description */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Brief Description
            <span className="text-red-500 text-sm">*</span>
            {hasDescription && <CheckCircle2 className="h-5 w-5 text-green-500" />}
          </CardTitle>
          <CardDescription className="text-gray-500">
            Full technical description shown in the PDP "Overview" section
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              Technical Description
              {formData.description.length > 0 && (
                hasDescription ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                )
              )}
            </Label>
            <Textarea
              id="description"
              placeholder="Detailed technical specifications, installation requirements, compatibility info, features, and benefits..."
              value={formData.description}
              onChange={(e) => onFormDataChange({ description: e.target.value })}
              rows={8}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              {formData.description.length} characters • Minimum 50 characters recommended
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tags Section */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Tags</CardTitle>
          <CardDescription className="text-gray-500">
            Add tags for better product categorization and search (Optional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tags">Product Tags</Label>
            <Input
              id="tags"
              placeholder="Enter tags separated by commas (e.g., hydraulic, commercial, energy-efficient)"
              value={(formData.tags || []).join(', ')}
              onChange={(e) => {
                const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                onFormDataChange({ tags: tagsArray })
              }}
              className="w-full"
            />
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                    <button
                      type="button"
                      onClick={() => {
                        const newTags = formData.tags?.filter((_, i) => i !== index)
                        onFormDataChange({ tags: newTags })
                      }}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Technical Specifications Section */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Technical Specifications</CardTitle>
          <CardDescription className="text-gray-500">
            Add detailed technical specs as key-value pairs (Optional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {Object.entries(formData.technical_specs || {}).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-4">No technical specifications added yet</p>
                <Button
                  type="button"
                  onClick={() => {
                    const newSpecs = { ...formData.technical_specs, [`spec_${Date.now()}`]: '' }
                    onFormDataChange({ technical_specs: newSpecs })
                  }}
                  variant="outline"
                  className="border-dashed"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Specification
                </Button>
              </div>
            ) : (
              <>
                {Object.entries(formData.technical_specs || {}).map(([key, value], index) => (
                  <div key={key} className="flex items-start gap-2">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor={`spec-key-${key}`} className="text-xs text-gray-600">
                          Specification Name
                        </Label>
                        <Input
                          id={`spec-key-${key}`}
                          placeholder="e.g., Motor Power, Control System"
                          value={key.startsWith('spec_') ? '' : key}
                          onChange={(e) => {
                            const newSpecs = { ...formData.technical_specs }
                            delete newSpecs[key]
                            newSpecs[e.target.value || `spec_${Date.now()}`] = value
                            onFormDataChange({ technical_specs: newSpecs })
                          }}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`spec-value-${key}`} className="text-xs text-gray-600">
                          Value
                        </Label>
                        <Input
                          id={`spec-value-${key}`}
                          placeholder="e.g., 15 kW, VVVF Drive"
                          value={value as string}
                          onChange={(e) => {
                            const newSpecs = { ...formData.technical_specs, [key]: e.target.value }
                            onFormDataChange({ technical_specs: newSpecs })
                          }}
                          className="w-full"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newSpecs = { ...formData.technical_specs }
                        delete newSpecs[key]
                        onFormDataChange({ technical_specs: newSpecs })
                      }}
                      className="mt-6 text-gray-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const newSpecs = { ...formData.technical_specs, [`spec_${Date.now()}`]: '' }
                    onFormDataChange({ technical_specs: newSpecs })
                  }}
                  className="w-full border-dashed"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Specification
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Attributes (Key-Value) */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Technical Attributes
            {filledAttributes > 0 && (
              <Badge variant="secondary">{filledAttributes} attributes</Badge>
            )}
          </CardTitle>
          <CardDescription className="text-gray-500">
            Key-value specifications displayed in the PDP attributes section
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">


          <div className="space-y-3">
            {formData.attributes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-4">No attributes added yet</p>
                <Button
                  type="button"
                  onClick={addAttribute}
                  variant="outline"
                  className="border-dashed"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Attribute
                </Button>
              </div>
            ) : (
              <>
                {formData.attributes.map((attr, index) => (
                  <div key={attr.id} className="flex items-start gap-2">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor={`attr-key-${attr.id}`} className="text-xs text-gray-600">
                          Attribute Name
                        </Label>
                        <Input
                          id={`attr-key-${attr.id}`}
                          placeholder="e.g., Voltage, Load Capacity"
                          value={attr.key}
                          onChange={(e) => updateAttribute(attr.id, 'key', e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`attr-value-${attr.id}`} className="text-xs text-gray-600">
                          Value
                        </Label>
                        <Input
                          id={`attr-value-${attr.id}`}
                          placeholder="e.g., 380V AC, 1000 kg"
                          value={attr.value}
                          onChange={(e) => updateAttribute(attr.id, 'value', e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAttribute(attr.id)}
                      className="mt-6 text-gray-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addAttribute}
                  className="w-full border-dashed"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Attribute
                </Button>
              </>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              💡 <strong>Tip:</strong> Attributes are searchable and filterable. Add all relevant technical specs for better product discovery.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}