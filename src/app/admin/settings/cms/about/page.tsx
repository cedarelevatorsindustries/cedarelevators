"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { getStoreSettings, updateStoreSettings } from "@/lib/services/settings"

export default function AboutUsEditor() {
    const router = useRouter()
    const [isSaving, setIsSaving] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [aboutContent, setAboutContent] = useState("")

    useEffect(() => {
        async function fetchSettings() {
            const { data } = await getStoreSettings()
            if (data?.about_cedar) {
                setAboutContent(data.about_cedar)
            }
            setIsLoading(false)
        }
        fetchSettings()
    }, [])

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const projectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID || ''
            await updateStoreSettings(projectId, { about_cedar: aboutContent })
            router.refresh()
            alert("About Us content saved successfully!")
        } catch (error) {
            alert("Failed to save content")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/settings/general">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">
                                    About Us
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Edit your company description
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            size="sm"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="about_content">About Cedar Content</Label>
                            <p className="text-xs text-gray-500 mb-2">
                                This content will be displayed on the About Us page (/about)
                            </p>
                            <Textarea
                                id="about_content"
                                value={aboutContent}
                                onChange={(e) => setAboutContent(e.target.value)}
                                placeholder="Welcome to Cedar Elevators - Your trusted partner for quality elevator solutions..."
                                rows={20}
                                className="font-mono text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {aboutContent.length} characters
                            </p>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
                            <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded border border-gray-200 whitespace-pre-wrap">
                                {aboutContent || "No content yet..."}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
