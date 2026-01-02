"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/lib/auth/client"
import { ArrowLeft, Upload, X, Loader2, FileText, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { submitVerificationRequest } from "@/lib/actions/business-verification"
import Link from "next/link"

export default function BusinessVerificationPage() {
    const router = useRouter()
    const { user, isLoading } = useUser()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        companyAddress: '',
        contactPerson: '',
        contactPhone: '',
        gstNumber: user?.business?.gst_number || '',
        panNumber: user?.business?.pan_number || '',
        additionalNotes: ''
    })
    const [documents, setDocuments] = useState<{
        gst_certificate?: File
        company_registration?: File
        pan_card?: File
    }>({})

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
        )
    }

    if (!user || !user.business) {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4">
                <Card>
                    <CardContent className="p-12 text-center">
                        <p className="text-gray-600 mb-4">You need a business profile to apply for verification.</p>
                        <p className="text-sm text-gray-500">Use the profile switcher to create a business profile.</p>
                        <Link href="/profile">
                            <Button className="mt-4">Go to Profile</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // If already verified or pending, show status
    if (user.business.verification_status === 'verified') {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4">
                <Card>
                    <CardContent className="p-12 text-center">
                        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Business Already Verified
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Your business was verified on {new Date(user.business.verified_at!).toLocaleDateString()}
                        </p>
                        <Link href="/profile">
                            <Button>Back to Profile</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (user.business.verification_status === 'pending') {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4">
                <Card>
                    <CardContent className="p-12 text-center">
                        <Loader2 className="w-16 h-16 text-orange-600 mx-auto mb-4 animate-spin" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Verification Pending
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Your verification request is under review. We'll notify you once it's processed.
                        </p>
                        <Link href="/profile">
                            <Button>Back to Profile</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const handleFileChange = (type: 'gst_certificate' | 'company_registration' | 'pan_card', file: File | null) => {
        if (file) {
            setDocuments(prev => ({ ...prev, [type]: file }))
        } else {
            setDocuments(prev => {
                const newDocs = { ...prev }
                delete newDocs[type]
                return newDocs
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.companyAddress || !formData.contactPerson || !formData.contactPhone) {
            toast.error('Please fill in all required fields')
            return
        }

        setIsSubmitting(true)
        try {
            // TODO: Upload documents to storage first
            const documentUrls = {
                gst_certificate: documents.gst_certificate?.name,
                company_registration: documents.company_registration?.name,
                pan_card: documents.pan_card?.name
            }

            const result = await submitVerificationRequest({
                businessId: user.business!.id,
                ...formData,
                documents: documentUrls
            })

            if (result.success) {
                toast.success('Verification request submitted successfully!')
                router.push('/profile')
            } else {
                toast.error(result.error || 'Failed to submit verification request')
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to submit verification request')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto py-6 md:py-12 px-4">
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
                    <CardTitle className="text-2xl">Apply for Business Verification</CardTitle>
                    <p className="text-sm text-gray-600 mt-2">
                        Submit your business documents for verification to unlock pricing and ordering features.
                    </p>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Company Address */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Company Address <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.companyAddress}
                                onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                                placeholder="Enter complete company address"
                                rows={3}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                                required
                            />
                        </div>

                        {/* Contact Person */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contact Person <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.contactPerson}
                                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                placeholder="Full name of authorized person"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                required
                            />
                        </div>

                        {/* Contact Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contact Phone <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                value={formData.contactPhone}
                                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                placeholder="+91 XXXXX XXXXX"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                required
                            />
                        </div>

                        {/* GST Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                GST Number
                            </label>
                            <input
                                type="text"
                                value={formData.gstNumber}
                                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                                placeholder="Enter GST number"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                            />
                        </div>

                        {/* PAN Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                PAN Number
                            </label>
                            <input
                                type="text"
                                value={formData.panNumber}
                                onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                                placeholder="Enter PAN number"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                            />
                        </div>

                        {/* Document Uploads */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-900">Upload Documents</h3>

                            {/* GST Certificate */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    GST Certificate (PDF, JPG, PNG - Max 5MB)
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => handleFileChange('gst_certificate', e.target.files?.[0] || null)}
                                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                                />
                                {documents.gst_certificate && (
                                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" />
                                        {documents.gst_certificate.name}
                                    </p>
                                )}
                            </div>

                            {/* Company Registration */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Company Registration (PDF, JPG, PNG - Max 5MB)
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => handleFileChange('company_registration', e.target.files?.[0] || null)}
                                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                                />
                                {documents.company_registration && (
                                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" />
                                        {documents.company_registration.name}
                                    </p>
                                )}
                            </div>

                            {/* PAN Card */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    PAN Card (PDF, JPG, PNG - Max 5MB)
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => handleFileChange('pan_card', e.target.files?.[0] || null)}
                                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                                />
                                {documents.pan_card && (
                                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" />
                                        {documents.pan_card.name}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Additional Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Additional Notes (Optional)
                            </label>
                            <textarea
                                value={formData.additionalNotes}
                                onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                                placeholder="Any additional information..."
                                rows={3}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                            />
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-blue-900 mb-2">
                                What happens next?
                            </h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Your application will be reviewed by our team</li>
                                <li>• We may contact you for additional information</li>
                                <li>• You'll be notified once verification is complete</li>
                                <li>• Verified businesses get access to pricing and ordering</li>
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
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="w-4 h-4 mr-2" />
                                        Submit Application
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
