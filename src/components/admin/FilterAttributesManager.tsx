/**
 * Admin panel for managing filterable product attributes
 * Allows admins to create, edit, and configure filter dimensions
 */

"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Save, X, MoveUp, MoveDown } from 'lucide-react'
import { toast } from 'sonner'

interface ProductAttribute {
  id: string
  attribute_key: string
  attribute_type: 'range' | 'enum' | 'boolean' | 'multi-select'
  display_name: string
  unit?: string
  is_filterable: boolean
  filter_priority: number
  options?: string[]
  min_value?: number
  max_value?: number
}

export function FilterAttributesManager() {
  const [attributes, setAttributes] = useState<ProductAttribute[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingAttribute, setEditingAttribute] = useState<ProductAttribute | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchAttributes()
  }, [])

  const fetchAttributes = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/filter-attributes')
      const data = await response.json()
      if (data.success) {
        setAttributes(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch attributes:', error)
      toast.error('Failed to load filter attributes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (attribute: Partial<ProductAttribute>) => {
    try {
      const url = attribute.id 
        ? `/api/admin/filter-attributes/${attribute.id}`
        : '/api/admin/filter-attributes'
      
      const method = attribute.id ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attribute)
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(attribute.id ? 'Attribute updated' : 'Attribute created')
        fetchAttributes()
        setIsDialogOpen(false)
        setEditingAttribute(null)
      } else {
        toast.error(data.error || 'Failed to save attribute')
      }
    } catch (error) {
      console.error('Failed to save attribute:', error)
      toast.error('Failed to save attribute')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this attribute?')) return

    try {
      const response = await fetch(`/api/admin/filter-attributes/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Attribute deleted')
        fetchAttributes()
      } else {
        toast.error(data.error || 'Failed to delete attribute')
      }
    } catch (error) {
      console.error('Failed to delete attribute:', error)
      toast.error('Failed to delete attribute')
    }
  }

  const handleToggleFilterable = async (id: string, isFilterable: boolean) => {
    try {
      const response = await fetch(`/api/admin/filter-attributes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_filterable: isFilterable })
      })

      const data = await response.json()
      
      if (data.success) {
        fetchAttributes()
      } else {
        toast.error('Failed to update attribute')
      }
    } catch (error) {
      console.error('Failed to toggle filterable:', error)
    }
  }

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const index = attributes.findIndex(a => a.id === id)
    if (index === -1) return
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === attributes.length - 1) return

    const newAttributes = [...attributes]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    // Swap priorities
    const temp = newAttributes[index].filter_priority
    newAttributes[index].filter_priority = newAttributes[targetIndex].filter_priority
    newAttributes[targetIndex].filter_priority = temp

    // Swap positions
    ;[newAttributes[index], newAttributes[targetIndex]] = [newAttributes[targetIndex], newAttributes[index]]
    
    setAttributes(newAttributes)

    // Save to backend
    try {
      await Promise.all([
        fetch(`/api/admin/filter-attributes/${newAttributes[index].id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filter_priority: newAttributes[index].filter_priority })
        }),
        fetch(`/api/admin/filter-attributes/${newAttributes[targetIndex].id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filter_priority: newAttributes[targetIndex].filter_priority })
        })
      ])
    } catch (error) {
      console.error('Failed to reorder:', error)
      toast.error('Failed to reorder attributes')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Filter Attributes</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage filterable product attributes and their display order
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingAttribute(null)} className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Attribute
            </Button>
          </DialogTrigger>
          <AttributeDialog
            attribute={editingAttribute}
            onSave={handleSave}
            onClose={() => {
              setIsDialogOpen(false)
              setEditingAttribute(null)
            }}
          />
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Attribute Key</TableHead>
                <TableHead>Display Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Filterable</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attributes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No filter attributes found. Add your first attribute to get started.
                  </TableCell>
                </TableRow>
              ) : (
                attributes.map((attr, index) => (
                  <TableRow key={attr.id}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReorder(attr.id, 'up')}
                          disabled={index === 0}
                        >
                          <MoveUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReorder(attr.id, 'down')}
                          disabled={index === attributes.length - 1}
                        >
                          <MoveDown className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{attr.attribute_key}</TableCell>
                    <TableCell className="font-medium">{attr.display_name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{attr.attribute_type}</Badge>
                    </TableCell>
                    <TableCell>{attr.unit || '-'}</TableCell>
                    <TableCell>
                      <Switch
                        checked={attr.is_filterable}
                        onCheckedChange={(checked) => handleToggleFilterable(attr.id, checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingAttribute(attr)
                            setIsDialogOpen(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(attr.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

function AttributeDialog({
  attribute,
  onSave,
  onClose
}: {
  attribute: ProductAttribute | null
  onSave: (attr: Partial<ProductAttribute>) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState<Partial<ProductAttribute>>({
    attribute_key: '',
    attribute_type: 'multi-select',
    display_name: '',
    unit: '',
    is_filterable: true,
    filter_priority: 0,
    options: [],
    ...attribute
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          {attribute ? 'Edit Attribute' : 'Add New Attribute'}
        </DialogTitle>
        <DialogDescription>
          Configure a filterable product attribute for the store filters
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="attr-key">Attribute Key *</Label>
            <Input
              id="attr-key"
              value={formData.attribute_key}
              onChange={(e) => setFormData({ ...formData, attribute_key: e.target.value })}
              placeholder="e.g., voltage, capacity"
              required
              disabled={!!attribute}
            />
            <p className="text-xs text-gray-500 mt-1">Unique identifier (lowercase, no spaces)</p>
          </div>
          
          <div>
            <Label htmlFor="display-name">Display Name *</Label>
            <Input
              id="display-name"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              placeholder="e.g., Voltage, Load Capacity"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="attr-type">Attribute Type *</Label>
            <Select 
              value={formData.attribute_type} 
              onValueChange={(value: any) => setFormData({ ...formData, attribute_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="range">Range (min-max)</SelectItem>
                <SelectItem value="enum">Enum (single select)</SelectItem>
                <SelectItem value="multi-select">Multi-Select</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="unit">Unit (optional)</Label>
            <Input
              id="unit"
              value={formData.unit || ''}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              placeholder="e.g., V, kg, m/s"
            />
          </div>
        </div>

        {(formData.attribute_type === 'enum' || formData.attribute_type === 'multi-select') && (
          <div>
            <Label htmlFor="options">Options (comma-separated)</Label>
            <Input
              id="options"
              value={(formData.options || []).join(', ')}
              onChange={(e) => setFormData({ 
                ...formData, 
                options: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              })}
              placeholder="e.g., 220V, 380V, 415V"
            />
          </div>
        )}

        {formData.attribute_type === 'range' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min-value">Min Value</Label>
              <Input
                id="min-value"
                type="number"
                value={formData.min_value || ''}
                onChange={(e) => setFormData({ ...formData, min_value: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="max-value">Max Value</Label>
              <Input
                id="max-value"
                type="number"
                value={formData.max_value || ''}
                onChange={(e) => setFormData({ ...formData, max_value: parseFloat(e.target.value) })}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Switch
            id="is-filterable"
            checked={formData.is_filterable}
            onCheckedChange={(checked) => setFormData({ ...formData, is_filterable: checked })}
          />
          <Label htmlFor="is-filterable">Enable as filter</Label>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
            <Save className="w-4 h-4 mr-2" />
            Save Attribute
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

