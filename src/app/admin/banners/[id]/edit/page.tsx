"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Banner } from "@/lib/types/banners"

export default function EditBannerPage() {
  const params = useParams()
  const router = useRouter()
  const bannerId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [banner, setBanner] = useState<Banner | null>(null)
  const [formData, setFormData] = useState({
    internal_title: "",
    placement: "",
    action_type: "",
    action_target: "",
    action_name: "",
    start_date: "",
    end_date: "",
    position: "",
    category: "",
    cta_text: "",
    status: "",
  })

  useEffect(() => {
    fetchBanner()
  }, [bannerId])

  const fetchBanner = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/banners/${bannerId}`)
      if (!response.ok) throw new Error('Failed to fetch banner')
      
      const data = await response.json()
      setBanner(data)
      
      // Populate form
      setFormData({
        internal_title: data.internal_title || "",
        placement: data.placement || "",
        action_type: data.action_type || "",
        action_target: data.action_target || "",
        action_name: data.action_name || "",
        start_date: data.start_date || "",
        end_date: data.end_date || "",
        position: data.position?.toString() || "",
        category: data.category || "",
        cta_text: data.cta_text || "",
        status: data.status || "",
      })
    } catch (error) {
      console.error('Error fetching banner:', error)
      toast.error('Failed to load banner')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)

      const updateData = {
        internal_title: formData.internal_title,
        placement: formData.placement,
        action_type: formData.action_type,
        action_target: formData.action_target,
        action_name: formData.action_name,
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
        position: formData.position ? parseInt(formData.position) : undefined,
        category: formData.category || undefined,
        cta_text: formData.cta_text || undefined,
        status: formData.status,
      }

      const response = await fetch(`/api/admin/banners/${bannerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update banner')
      }

      toast.success('Banner updated successfully!')
      router.push('/admin/banners')
    } catch (error) {
      console.error('Error updating banner:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update banner')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    )
  }

  if (!banner) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Banner not found</h2>
        <Button asChild>
          <Link href="/admin/banners">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Banners
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
              Edit Banner
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 mt-1 sm:mt-2">
              Update banner details and settings
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin/banners">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update banner title and placement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="internal_title">Internal Title *</Label>
                <Input
                  id="internal_title"
                  value={formData.internal_title}
                  onChange={(e) => setFormData({ ...formData, internal_title: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="placement">Placement</Label>
                  <Select value={formData.placement} onValueChange={(value) => setFormData({ ...formData, placement: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homepage-carousel">Homepage Carousel</SelectItem>
                      <SelectItem value="product-listing-carousel">Product Listing Carousel</SelectItem>
                      <SelectItem value="category-banner">Category Banner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Target */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Action Target</CardTitle>
              <CardDescription>Where the banner links to</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="action_type">Action Type</Label>
                <Select value={formData.action_type} onValueChange={(value) => setFormData({ ...formData, action_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="collection">Collection</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="external">External URL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="action_target">Action Target</Label>
                  <Input
                    id="action_target"
                    value={formData.action_target}
                    onChange={(e) => setFormData({ ...formData, action_target: e.target.value })}
                    placeholder="ID or URL"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="action_name">Action Name</Label>
                  <Input
                    id="action_name"
                    value={formData.action_name}
                    onChange={(e) => setFormData({ ...formData, action_name: e.target.value })}
                    placeholder="Display name"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Optional Fields */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Optional Settings</CardTitle>
              <CardDescription>Additional banner configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cta_text">CTA Text</Label>
                  <Input
                    id="cta_text"
                    value={formData.cta_text}
                    onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                    placeholder="e.g., Shop Now"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    type="number"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="1, 2, 3..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category (for category banners)</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Shirts"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={formData.start_date ? new Date(formData.start_date).toISOString().slice(0, 16) : ""}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={formData.end_date ? new Date(formData.end_date).toISOString().slice(0, 16) : ""}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Image */}
          {banner.image_url && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Current Banner Image</CardTitle>
              </CardHeader>
              <CardContent>
                <img 
                  src={banner.image_url} 
                  alt={banner.internal_title}
                  className="w-full max-w-2xl rounded-lg border border-gray-200"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Note: To change the image, please create a new banner
                </p>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/banners">Cancel</Link>
            </Button>
            <Button 
              type="submit" 
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={saving}
            >
              {saving ? (
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
        </form>
      </div>
    </div>
  )
}
