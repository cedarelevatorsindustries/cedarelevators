"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save, ArrowLeft, LoaderCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCreateElevatorType } from "@/hooks/queries/useElevatorTypes"
import { generateSlug } from "@/lib/types/elevator-types"
import type { ElevatorTypeFormData } from "@/lib/types/elevator-types"
import { toast } from "sonner"

export default function CreateElevatorTypePage() {
  const router = useRouter()
  const createMutation = useCreateElevatorType()

  const [formData, setFormData] = useState<ElevatorTypeFormData>({
    name: "",
    slug: "",
    description: "",
    icon: "",
    sort_order: 0,
    is_active: true
  })

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    })
  }

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.slug) {
        toast.error('Please fill in required fields')
        return
      }

      const result = await createMutation.mutateAsync(formData)

      if (result.success) {
        toast.success('Elevator type created successfully!')
        router.push('/admin/elevator-types')
      } else {
        toast.error(result.error || 'Failed to create elevator type')
      }
    } catch (error) {
      console.error('Error creating elevator type:', error)
      toast.error('Failed to create elevator type')
    }
  }

  const isLoading = createMutation.isPending

  return (
    <div className="w-full max-w-full overflow-x-hidden p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Create Elevator Type
            </h1>
            <p className="text-gray-600 mt-1">
              Add a new elevator type classification
            </p>
          </div>
          <Button variant="outline" asChild className="border-gray-300 bg-white">
            <Link href="/admin/elevator-types">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancel
            </Link>
          </Button>
        </div>

        {/* Main Form */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column - Main Form */}
          <div className="lg:col-span-8 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Elevator type details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Residential, Commercial, MRL"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    />
                    <p className="text-xs text-gray-500">Auto-generated from name. Must be unique.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe this elevator type..."
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">Icon (Optional)</Label>
                  <Input
                    id="icon"
                    placeholder="e.g., 🏢 or emoji"
                    value={formData.icon || ''}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    maxLength={2}
                  />
                  <p className="text-xs text-gray-500">Single emoji or icon character</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Settings */}
          <div className="lg:col-span-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Status</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
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
                  <p className="text-xs text-gray-500">Controls display order (lower numbers first)</p>
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Elevator Type
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
