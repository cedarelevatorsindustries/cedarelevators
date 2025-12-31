"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Sparkles, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

interface SEOTabProps {
    metaTitle: string
    onMetaTitleChange: (title: string) => void

    metaDescription: string
    onMetaDescriptionChange: (description: string) => void

    slug: string
    onSlugChange?: (slug: string) => void

    // Auto-generate function
    onAutoGenerate?: () => void

    className?: string
}

export function SEOTab({
    metaTitle,
    onMetaTitleChange,
    metaDescription,
    onMetaDescriptionChange,
    slug,
    onSlugChange,
    onAutoGenerate,
    className
}: SEOTabProps) {
    const titleLength = metaTitle.length
    const descriptionLength = metaDescription.length

    const titleStatus = titleLength === 0 ? "empty" : titleLength > 60 ? "long" : "good"
    const descriptionStatus = descriptionLength === 0 ? "empty" : descriptionLength > 160 ? "long" : "good"

    return (
        <div className={cn("space-y-6", className)}>
            {/* SEO Basics */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Search Engine Optimization</CardTitle>
                            <CardDescription>
                                Help search engines understand your content
                            </CardDescription>
                        </div>
                        {onAutoGenerate && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onAutoGenerate}
                                className="border-orange-300 text-orange-700 hover:bg-orange-50"
                            >
                                <Sparkles className="mr-2 h-4 w-4" />
                                Auto-Generate
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Meta Title */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="meta-title">Meta Title</Label>
                            <span className={cn(
                                "text-xs font-medium",
                                titleStatus === "empty" ? "text-gray-400" :
                                    titleStatus === "long" ? "text-red-600" :
                                        "text-green-600"
                            )}>
                                {titleLength}/60
                            </span>
                        </div>
                        <Input
                            id="meta-title"
                            placeholder="Enter a compelling title for search results"
                            value={metaTitle}
                            onChange={(e) => onMetaTitleChange(e.target.value)}
                            maxLength={70}
                        />
                        {titleStatus === "long" && (
                            <p className="text-xs text-red-600">
                                Title is too long. Keep it under 60 characters for best results.
                            </p>
                        )}
                    </div>

                    {/* Meta Description */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="meta-description">Meta Description</Label>
                            <span className={cn(
                                "text-xs font-medium",
                                descriptionStatus === "empty" ? "text-gray-400" :
                                    descriptionStatus === "long" ? "text-red-600" :
                                        "text-green-600"
                            )}>
                                {descriptionLength}/160
                            </span>
                        </div>
                        <Textarea
                            id="meta-description"
                            placeholder="Write a brief description that will appear in search results"
                            value={metaDescription}
                            onChange={(e) => onMetaDescriptionChange(e.target.value)}
                            rows={3}
                            maxLength={200}
                        />
                        {descriptionStatus === "long" && (
                            <p className="text-xs text-red-600">
                                Description is too long. Keep it under 160 characters for best results.
                            </p>
                        )}
                    </div>

                    {/* Slug */}
                    {onSlugChange && (
                        <div className="space-y-2">
                            <Label htmlFor="slug">URL Slug</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">/</span>
                                <Input
                                    id="slug"
                                    placeholder="url-friendly-slug"
                                    value={slug}
                                    onChange={(e) => onSlugChange(e.target.value)}
                                    className="flex-1"
                                />
                            </div>
                            <p className="text-xs text-gray-500">
                                Lowercase letters, numbers, and hyphens only
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* SERP Preview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Globe className="h-4 w-4" />
                        Search Preview
                    </CardTitle>
                    <CardDescription>
                        How this might appear in Google search results
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg p-4 bg-white space-y-1">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Globe className="h-3 w-3" />
                            <span>yoursite.com</span>
                            <span className="text-gray-400">›</span>
                            <span className="text-gray-500">{slug || "page"}</span>
                        </div>
                        <h3 className="text-lg text-blue-600 hover:underline cursor-pointer">
                            {metaTitle || "Your Page Title Will Appear Here"}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                            {metaDescription || "Your meta description will appear here. Make it compelling to encourage clicks from search results."}
                        </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                        This is a preview. Actual appearance may vary by search engine.
                    </p>
                </CardContent>
            </Card>

            {/* SEO Tips */}
            <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="text-blue-900 text-base">SEO Best Practices</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-800 space-y-2">
                    <ul className="list-disc list-inside space-y-1">
                        <li>Include your primary keyword in the title</li>
                        <li>Write unique descriptions for each page</li>
                        <li>Keep titles under 60 characters</li>
                        <li>Keep descriptions under 160 characters</li>
                        <li>Use action-oriented language</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    )
}
