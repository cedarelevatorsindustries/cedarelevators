"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/lib/auth/client"
import { Building2, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"

export default function CreateBusinessProfilePage() {
    const router = useRouter()
    const { user, createBusinessProfile } = useUser()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        gst_number: '',
        pan_number: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            toast.error('Business name is required')
            return
        }

        setIsSubmitting(true)
        try {
            await createBusinessProfile(formData)
            toast.success('Business profile created successfully!')
            router.push('/profile')
        } catch (error: any) {
            toast.error(error.message || 'Failed to create business profile')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
        )
    }

    if (user.hasBusinessProfile) {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4">
                <Card>
                    <CardContent className="p-12 text-center">
                        <Building2 className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Business Profile Already Exists
                        </h3>
                        <p className="text-gray-600 mb-6">
                            You already have a business profile. You can switch to it using the profile switcher.
                        </p>
                        <Link href="/profile">
                            <Button>Go to Profile</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            {/* Back Button */}
            <Link
                href="/profile"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Profile
            </Link>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Building2 className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">Create Business Profile</CardTitle>
                            <p className="text-sm text-gray-600 mt-1">
                                Set up your business account to access B2B features
                            </p>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Business Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Business Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter your company name"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                required
                            />
                        </div>

                        {/* GST Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                GST Number (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.gst_number}
                                onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                                placeholder="Enter GST number"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Required for business verification and tax benefits
                            </p>
                        </div>

                        {/* PAN Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                PAN Number (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.pan_number}
                                onChange={(e) => setFormData({ ...formData, pan_number: e.target.value })}
                                placeholder="Enter PAN number"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                            />
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-blue-900 mb-2">
                                What happens next?
                            </h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Your business profile will be created</li>
                                <li>• You can switch between individual and business profiles anytime</li>
                                <li>• Submit verification documents to unlock verified business features</li>
                                <li>• Access B2B pricing, bulk ordering, and credit terms</li>
                            </ul>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={isSubmitting}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Business Profile'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
