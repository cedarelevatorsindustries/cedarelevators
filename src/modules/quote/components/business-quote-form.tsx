"use client"

import { useState, useEffect } from "react"
import { Send, LoaderCircle, CircleCheck, Trash2, Upload, Minus, Plus, Building2, CheckSquare } from "lucide-react"
import { toast } from "sonner"
import { submitBusinessQuote } from "@/lib/actions/quotes"
import { getBusinessProfile } from "@/lib/actions/business"
import { uploadQuoteAttachments } from "@/lib/services/file-upload"
import { fileToBase64 } from "@/lib/utils/file-helpers"
import { useQuoteBasket } from "@/lib/hooks/use-quote-basket"
import { useUser } from "@/lib/auth/client"
import Link from "next/link"

interface BusinessQuoteFormProps {
    products?: any[]
    prefilledProduct?: {
        id: string
        variantId?: string
        quantity?: number
        source?: string
    }
    onSuccess?: (quoteNumber: string) => void
    isVerified?: boolean
}

export const BusinessQuoteForm = ({ products, prefilledProduct, onSuccess, isVerified = false }: BusinessQuoteFormProps) => {
    const { user } = useUser()
    const { items, removeItem, updateQuantity, toggleBulkPricing, clearBasket, isLoading: basketLoading } = useQuoteBasket()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [quoteNumber, setQuoteNumber] = useState<string | null>(null)
    const [isLoadingProfile, setIsLoadingProfile] = useState(true)

    const [notes, setNotes] = useState("")
    const [attachments, setAttachments] = useState<File[]>([])
    const [companyDetails, setCompanyDetails] = useState({
        company_name: "",
        gst_number: "",
        pan_number: "",
        contact_name: "",
        contact_phone: ""
    })

    const maxNotes = isVerified ? 10000 : 1000
    const maxAttachments = isVerified ? 5 : 2
    const maxItems = isVerified ? 1000 : 50

    // Load business profile
    useEffect(() => {
        async function loadProfile() {
            try {
                const result = await getBusinessProfile()
                if (result.success && result.profile) {
                    setCompanyDetails({
                        company_name: result.profile.company_name || "",
                        gst_number: result.profile.gst_number || "",
                        pan_number: result.profile.pan_number || "",
                        contact_name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "",
                        contact_phone: result.profile.phone || ""
                    })
                }
            } catch (error) {
                console.error("Error loading business profile:", error)
            } finally {
                setIsLoadingProfile(false)
            }
        }
        loadProfile()
    }, [user])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])

        for (const file of files) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name} is too large. Max 5MB per file.`)
                return
            }
        }

        if (attachments.length + files.length > maxAttachments) {
            toast.error(`Maximum ${maxAttachments} attachments allowed`)
            return
        }

        setAttachments([...attachments, ...files])
    }

    const removeAttachment = (index: number) => {
        setAttachments(attachments.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (items.length === 0) {
            toast.error("Please add at least one item to your quote basket")
            return
        }

        if (!companyDetails.company_name) {
            toast.error("Company name is required")
            return
        }

        if (notes.length > maxNotes) {
            toast.error(`Notes must be ${maxNotes} characters or less`)
            return
        }

        setIsSubmitting(true)

        try {
            // Upload attachments to Supabase Storage
            let uploadedAttachments: Array<{
                file_name: string
                file_url: string
                file_size: number
                mime_type: string
            }> = []

            if (attachments.length > 0) {
                // Convert files to base64 for server upload
                const fileDataArray = await Promise.all(
                    attachments.map(async (file) => ({
                        base64: await fileToBase64(file),
                        fileName: file.name,
                        fileType: file.type,
                        fileSize: file.size
                    }))
                )

                const uploadResult = await uploadQuoteAttachments(fileDataArray)

                if (!uploadResult.success) {
                    toast.error(uploadResult.error || "Failed to upload attachments")
                    setIsSubmitting(false)
                    return
                }

                uploadedAttachments = (uploadResult.attachments || [])
                    .filter(a => a.success)
                    .map(a => ({
                        file_name: a.file_name || '',
                        file_url: a.file_url || '',
                        file_size: a.file_size || 0,
                        mime_type: a.mime_type || ''
                    }))
            }

            const result = await submitBusinessQuote({
                notes,
                items,
                company_details: companyDetails,
                attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined
            })

            if (result.success) {
                setIsSuccess(true)
                setQuoteNumber(result.quote_number)
                clearBasket()
                toast.success("Quote submitted successfully!")
                onSuccess?.(result.quote_number)
            } else {
                toast.error(result.error || "Failed to submit quote")
            }
        } catch (error) {
            console.error("Error submitting quote:", error)
            toast.error("Something went wrong. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Success State
    if (isSuccess && quoteNumber) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                    <CircleCheck className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Quote Submitted!</h3>
                <p className="text-gray-600">
                    Your bulk quote request <span className="font-semibold text-blue-600">{quoteNumber}</span> has been submitted with {isVerified ? "high" : "medium"} priority.
                </p>
                <p className="text-sm text-gray-500">
                    Our team will review and respond within 24 hours.
                </p>
                <div className="flex gap-3 justify-center pt-4">
                    <Link
                        href="/quotes"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        View Quote Status
                    </Link>
                    <button
                        onClick={() => {
                            setIsSuccess(false)
                            setQuoteNumber(null)
                            setNotes("")
                            setAttachments([])
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                        New Quote
                    </button>
                </div>
            </div>
        )
    }

    // Empty basket state
    if (!basketLoading && items.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                    <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Start Your Bulk Quote</h3>
                <p className="text-gray-600">
                    Browse products and add them to your quote basket to get bulk pricing.
                </p>
                <Link
                    href="/catalog"
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                    Browse Products
                </Link>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Verification Banner */}
            {!isVerified && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-amber-900">Get Verified for More Features</h4>
                        <p className="text-sm text-amber-700 mt-1">
                            Verified businesses get unlimited items, 5 attachments, templates, and priority support.
                        </p>
                        <Link href="/profile/business/verify" className="text-sm font-medium text-amber-700 hover:text-amber-800 mt-2 inline-block">
                            Verify Now →
                        </Link>
                    </div>
                </div>
            )}

            {/* Company Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
                <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Company Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={companyDetails.company_name}
                            onChange={(e) => setCompanyDetails({ ...companyDetails, company_name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Your Company Name"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            GST Number
                        </label>
                        <input
                            type="text"
                            value={companyDetails.gst_number}
                            onChange={(e) => setCompanyDetails({ ...companyDetails, gst_number: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="22AAAAA0000A1Z5"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contact Name
                        </label>
                        <input
                            type="text"
                            value={companyDetails.contact_name}
                            onChange={(e) => setCompanyDetails({ ...companyDetails, contact_name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contact Phone
                        </label>
                        <input
                            type="tel"
                            value={companyDetails.contact_phone}
                            onChange={(e) => setCompanyDetails({ ...companyDetails, contact_phone: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="+91 XXXXX XXXXX"
                        />
                    </div>
                </div>
            </div>

            {/* Quote Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Quote Items ({items.length}/{maxItems})</h3>
                    <span className="text-sm text-gray-500">Toggle bulk pricing per item</span>
                </div>
                <div className="divide-y divide-gray-100">
                    {items.map((item) => (
                        <div key={item.id} className="p-4 flex items-center gap-4">
                            {/* Thumbnail */}
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                                {item.product_thumbnail ? (
                                    <img
                                        src={item.product_thumbnail}
                                        alt={item.product_name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <Send className="w-6 h-6" />
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 truncate">{item.product_name}</h4>
                                {item.product_sku && (
                                    <p className="text-sm text-gray-500">SKU: {item.product_sku}</p>
                                )}
                            </div>

                            {/* Bulk Pricing Toggle */}
                            <button
                                type="button"
                                onClick={() => toggleBulkPricing(item.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${item.bulk_pricing_requested
                                    ? "bg-green-100 text-green-700 border border-green-200"
                                    : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                                    }`}
                            >
                                <CheckSquare className={`w-3.5 h-3.5 ${item.bulk_pricing_requested ? "fill-green-500" : ""}`} />
                                Bulk Pricing
                            </button>

                            {/* Quantity */}
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-10 text-center font-medium">{item.quantity}</span>
                                <button
                                    type="button"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Remove */}
                            <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
                <label className="block text-sm font-bold text-gray-900">
                    Requirements & Notes
                    <span className="text-gray-400 font-normal ml-2">({notes.length}/{maxNotes})</span>
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => {
                        if (e.target.value.length <= maxNotes) {
                            setNotes(e.target.value)
                        }
                    }}
                    rows={5}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                    placeholder="Describe your requirements, delivery schedule, project details..."
                />
            </div>

            {/* Attachments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
                <label className="block text-sm font-bold text-gray-900">
                    Attachments <span className="text-gray-400 font-normal">({attachments.length}/{maxAttachments} files)</span>
                </label>

                {attachments.length > 0 && (
                    <div className="space-y-2">
                        {attachments.map((file, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                <Upload className="w-5 h-5 text-blue-600" />
                                <span className="flex-1 text-sm text-blue-800 truncate">{file.name}</span>
                                <span className="text-xs text-blue-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                <button
                                    type="button"
                                    onClick={() => removeAttachment(index)}
                                    className="text-blue-600 hover:text-blue-700"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {attachments.length < maxAttachments && (
                    <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors">
                        <Upload className="w-8 h-8 text-gray-400" />
                        <span className="text-sm text-gray-600">Click to upload PDF, CSV, or images</span>
                        <span className="text-xs text-gray-400">Max 5MB per file</span>
                        <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.csv,.doc,.docx,.jpg,.jpeg,.png,.webp"
                            multiple
                            onChange={handleFileChange}
                        />
                    </label>
                )}
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={isSubmitting || items.length === 0 || !companyDetails.company_name}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95 transition-all disabled:cursor-not-allowed"
            >
                {isSubmitting ? (
                    <>
                        <LoaderCircle className="w-5 h-5 animate-spin" />
                        Submitting Bulk Quote...
                    </>
                ) : (
                    <>
                        <Send className="w-5 h-5" />
                        Submit Bulk Quote Request
                    </>
                )}
            </button>
        </form>
    )
}
