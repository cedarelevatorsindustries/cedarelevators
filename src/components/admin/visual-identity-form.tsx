import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Upload, X, Image as ImageIcon } from "lucide-react"

interface VisualIdentityFormProps {
  thumbnailUrl?: string | null
  bannerUrl?: string | null
  onThumbnailChange?: (url: string) => void
  onBannerChange?: (url: string) => void
  onThumbnailFileChange?: (file: File) => void
  onBannerFileChange?: (file: File) => void
  entityType?: string // e.g., "category", "elevator-type", "collection"
}

export function VisualIdentityForm({
  thumbnailUrl,
  bannerUrl,
  onThumbnailChange,
  onBannerChange,
  onThumbnailFileChange,
  onBannerFileChange,
  entityType = "entity"
}: VisualIdentityFormProps) {
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(thumbnailUrl || null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(bannerUrl || null)

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (onThumbnailFileChange) {
        onThumbnailFileChange(file)
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setThumbnailPreview(result)
        if (onThumbnailChange) {
          onThumbnailChange(result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (onBannerFileChange) {
        onBannerFileChange(file)
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setBannerPreview(result)
        if (onBannerChange) {
          onBannerChange(result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const clearThumbnail = () => {
    setThumbnailPreview(null)
    if (onThumbnailChange) {
      onThumbnailChange("")
    }
  }

  const clearBanner = () => {
    setBannerPreview(null)
    if (onBannerChange) {
      onBannerChange("")
    }
  }

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900">Visual Identity</CardTitle>
        <p className="text-sm text-gray-500">
          Manage thumbnail and banner images for this {entityType}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Thumbnail Image */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700">
              Thumbnail Image
            </Label>
            {thumbnailPreview && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearThumbnail}
                className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Square image for cards, grids, and filters (recommended: 400x400px)
          </p>

          {thumbnailPreview ? (
            <div className="relative border-2 border-dashed border-gray-200 rounded-lg p-4">
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="w-32 h-32 object-cover rounded-md mx-auto"
              />
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No thumbnail image</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Input
              id="thumbnail-upload"
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('thumbnail-upload')?.click()}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              {thumbnailPreview ? 'Change Thumbnail' : 'Upload Thumbnail'}
            </Button>
          </div>
        </div>

        {/* Banner Image */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700">
              Banner Image (Optional)
            </Label>
            {bannerPreview && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearBanner}
                className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Wide banner for {entityType} page header - non-clickable context surface (recommended: 1920x400px)
          </p>

          {bannerPreview ? (
            <div className="relative border-2 border-dashed border-gray-200 rounded-lg p-4">
              <img
                src={bannerPreview}
                alt="Banner preview"
                className="w-full h-auto max-h-48 object-cover rounded-md"
              />
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No banner image</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Input
              id="banner-upload"
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('banner-upload')?.click()}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              {bannerPreview ? 'Change Banner' : 'Upload Banner'}
            </Button>
          </div>
        </div>

        {/* Helper Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-xs text-blue-800">
            <strong>Thumbnail:</strong> Used in category cards, product grids, and filter options.
            <br />
            <strong>Banner:</strong> Displayed at the top of the {entityType} page as a visual header (non-clickable).
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

