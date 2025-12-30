"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useElevatorType, useUpdateElevatorType } from "@/hooks/queries/useElevatorTypes"
import { generateSlug } from "@/lib/types/elevator-types"
import type { ElevatorTypeFormData } from "@/lib/types/elevator-types"
import { toast } from "sonner"

export default function EditElevatorTypePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data, isLoading: isLoadingType } = useElevatorType(params.id)
  const updateMutation = useUpdateElevatorType()

  const elevatorType = data?.elevatorType

  const [formData, setFormData] = useState<ElevatorTypeFormData>({
    name: "",
    slug: "",
    description: "",
    banner_image: "",
    icon: "",
    sort_order: 0,
    is_active: true
  })

  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null)
  const [bannerImagePreview, setBannerImagePreview] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)

  // Load elevator type data
  useEffect(() => {
    if (elevatorType) {
      setFormData({
        name: elevatorType.name || "",
        slug: elevatorType.slug || "",
        description: elevatorType.description || "",
        banner_image: elevatorType.banner_image || "",
        icon: elevatorType.icon || "",
        sort_order: elevatorType.sort_order || 0,
        is_active: elevatorType.is_active ?? true
      })
      if (elevatorType.banner_image) {
        setBannerImagePreview(elevatorType.banner_image)
      }
    }
  }, [elevatorType])

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    })
  }

  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBannerImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setBannerImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.slug) {
        toast.error('Please fill in required fields')
        return
      }

      let bannerImageUrl = formData.banner_image

      // Upload banner image if selected
      if (bannerImageFile) {
        setIsUploading(true)
        // Note: Need to add upload mutation to useElevatorTypes hook
        // For now, we'll skip the upload and just save the formData
        toast.warning('Banner image upload not yet implemented')
        setIsUploading(false)
      }

      const result = await updateMutation.mutateAsync({
        id: params.id,
        formData: {
          ...formData,
          banner_image: bannerImageUrl
        }
      })

      if (result.success) {
        toast.success('Elevator type updated successfully!')
        router.push('/admin/elevator-types')
      } else {
        toast.error(result.error || 'Failed to update elevator type')
      }
    } catch (error) {
      console.error('Error updating elevator type:', error)
      toast.error('Failed to update elevator type')
      setIsUploading(false)
    }
  }

  if (isLoadingType) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  if (!elevatorType) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <p className="text-gray-600">Elevator type not found</p>
        <Button variant="outline" asChild>
          <Link href="/admin/elevator-types">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Elevator Types
          </Link>
        </Button>
      </div>
    )
  }

  const isLoading = updateMutation.isPending || isUploading

  return (
    <div className="w-full max-w-full overflow-x-hidden p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Edit Elevator Type
            </h1>
            <p className="text-gray-600 mt-1">
              Update elevator type information
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" asChild>
              <Link href="/admin/elevator-types">
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
                  Saving...
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
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
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
                    <p className="text-xs text-gray-500">Must be unique</p>
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

          {/* Right Column */}
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
                  <p className="text-xs text-gray-500">Controls display order</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
