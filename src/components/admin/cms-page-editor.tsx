"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Save, Eye, Globe, FileText } from "lucide-react"
import Link from "next/link"
import { CMSPageFull, updateCMSPage, publishCMSPage, unpublishCMSPage } from "@/lib/actions/admin-cms"

interface CMSPageEditorProps {
    page: CMSPageFull
}

export function CMSPageEditor({ page }: CMSPageEditorProps) {
    const router = useRouter()
    const [isSaving, setIsSaving] = useState(false)
    const [isPublishing, setIsPublishing] = useState(false)

    const [formData, setFormData] = useState({
        title: page.title,
        slug: page.slug,
        content: page.content || "",
        seo_title: page.seo_title || "",
        seo_description: page.seo_description || "",
        hero_subtitle: page.hero_subtitle || "",
        hero_image_url: page.hero_image_url || "",
        show_toc: page.show_toc,
        show_last_updated: page.show_last_updated,
    })

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const result = await updateCMSPage(page.id, formData)
            if (result.success) {
                router.refresh()
            } else {
                alert(`Error: ${result.error}`)
            }
        } catch (error) {
            alert("Failed to save page")
        } finally {
            setIsSaving(false)
        }
    }

    const handlePublish = async () => {
        setIsPublishing(true)
        try {
            const result = page.is_published
                ? await unpublishCMSPage(page.id)
                : await publishCMSPage(page.id)

            if (result.success) {
                router.refresh()
            } else {
                alert(`Error: ${result.error}`)
            }
        } catch (error) {
            alert("Failed to update status")
        } finally {
            setIsPublishing(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/settings/cms">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">
                                    {page.title}
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Version {page.version} • Last updated{" "}
                                    {new Date(page.updated_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Badge
                                variant={page.is_published ? "default" : "secondary"}
                                className={
                                    page.is_published
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                }
                            >
                                {page.is_published ? "Published" : "Draft"}
                            </Badge>

                            {page.is_published && (
                                <Link href={`/${page.slug}`} target="_blank">
                                    <Button variant="outline" size="sm">
                                        <Eye className="w-4 h-4 mr-2" />
                                        Preview
                                    </Button>
                                </Link>
                            )}

                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                size="sm"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {isSaving ? "Saving..." : "Save"}
                            </Button>

                            <Button
                                onClick={handlePublish}
                                disabled={isPublishing}
                                variant={page.is_published ? "outline" : "default"}
                                size="sm"
                            >
                                <Globe className="w-4 h-4 mr-2" />
                                {isPublishing
                                    ? "..."
                                    : page.is_published
                                        ? "Unpublish"
                                        : "Publish"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="col-span-2 space-y-6">
                        {/* Basic Info */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Basic Information
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="title">Page Title</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) =>
                                            setFormData({ ...formData, title: e.target.value })
                                        }
                                        placeholder="About Cedar Elevators"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="slug">URL Slug</Label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">/</span>
                                        <Input
                                            id="slug"
                                            value={formData.slug}
                                            onChange={(e) =>
                                                setFormData({ ...formData, slug: e.target.value })
                                            }
                                            placeholder="about-us"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        URL-friendly version of the page title
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Hero Section */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Hero Section
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="hero_subtitle">Subtitle</Label>
                                    <Input
                                        id="hero_subtitle"
                                        value={formData.hero_subtitle}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                hero_subtitle: e.target.value,
                                            })
                                        }
                                        placeholder="Your trusted partner for quality elevator solutions"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="hero_image_url">
                                        Hero Image URL (Optional)
                                    </Label>
                                    <Input
                                        id="hero_image_url"
                                        type="url"
                                        value={formData.hero_image_url}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                hero_image_url: e.target.value,
                                            })
                                        }
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Content Editor */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Page Content
                            </h2>
                            <RichTextEditor
                                content={formData.content}
                                onChange={(content) =>
                                    setFormData({ ...formData, content })
                                }
                            />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* SEO */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                SEO Settings
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="seo_title">Meta Title</Label>
                                    <Input
                                        id="seo_title"
                                        value={formData.seo_title}
                                        onChange={(e) =>
                                            setFormData({ ...formData, seo_title: e.target.value })
                                        }
                                        placeholder={formData.title}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formData.seo_title.length}/60 characters
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="seo_description">Meta Description</Label>
                                    <Textarea
                                        id="seo_description"
                                        value={formData.seo_description}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                seo_description: e.target.value,
                                            })
                                        }
                                        placeholder="Brief description for search engines"
                                        rows={3}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formData.seo_description.length}/160 characters
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Display Options */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Display Options
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="show_toc" className="cursor-pointer">
                                        Show Table of Contents
                                    </Label>
                                    <Switch
                                        id="show_toc"
                                        checked={formData.show_toc}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, show_toc: checked })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="show_last_updated"
                                        className="cursor-pointer"
                                    >
                                        Show Last Updated
                                    </Label>
                                    <Switch
                                        id="show_last_updated"
                                        checked={formData.show_last_updated}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, show_last_updated: checked })
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Page Info */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Page Info
                            </h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Version:</span>
                                    <span className="font-medium">v{page.version}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Created:</span>
                                    <span className="font-medium">
                                        {new Date(page.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Last Updated:</span>
                                    <span className="font-medium">
                                        {new Date(page.updated_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
