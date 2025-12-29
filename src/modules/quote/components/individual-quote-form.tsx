"use client"

import { useState } from "react"
import { Send, LoaderCircle, CircleCheck, Trash2, Upload, Minus, Plus } from "lucide-react"
import { toast } from "sonner"
import { submitIndividualQuote } from "@/lib/actions/quotes"
import { useQuoteBasket } from "@/lib/hooks/use-quote-basket"
import { useUser } from "@/lib/auth/client"
import Link from "next/link"

interface IndividualQuoteFormProps {
    onSuccess?: (quoteNumber: string) => void
}

export const IndividualQuoteForm = ({ onSuccess }: IndividualQuoteFormProps) => {
    const { user } = useUser()
    const { items, removeItem, updateQuantity, clearBasket, isLoading: basketLoading } = useQuoteBasket()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [quoteNumber, setQuoteNumber] = useState<string | null>(null)

    const [notes, setNotes] = useState("")
    const [attachment, setAttachment] = useState<File | null>(null)
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size must be less than 5MB")
                return
            }
            // Validate file type
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
            if (!allowedTypes.includes(file.type)) {
                toast.error("Please upload a PDF, DOC, or image file")
                return
            }
            setAttachment(file)
            // TODO: Upload to Supabase Storage and get URL
            // For now, we'll skip the actual upload
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (items.length === 0) {
            toast.error("Please add at least one item to your quote basket")
            return
        }

        if (notes.length > 500) {
            toast.error("Notes must be 500 characters or less")
            return
        }

        setIsSubmitting(true)

        try {
            const result = await submitIndividualQuote({
                notes,
                items,
                attachment: attachment && uploadedUrl ? {
                    file_name: attachment.name,
                    file_url: uploadedUrl,
                    file_size: attachment.size,
                    mime_type: attachment.type
                } : undefined
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
                    Your quote request <span className="font-semibold text-blue-600">{quoteNumber}</span> has been submitted.
                </p>
                <p className="text-sm text-gray-500">
                    You can track its status in your quote history.
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
                            setAttachment(null)
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
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                    <Send className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Your Quote Basket is Empty</h3>
                <p className="text-gray-600">
                    Browse our products and add items you&apos;d like to get a quote for.
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
            {/* Quote Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Quote Items ({items.length}/10)</h3>
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
                    Additional Notes
                    <span className="text-gray-400 font-normal ml-2">({notes.length}/500)</span>
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => {
                        if (e.target.value.length <= 500) {
                            setNotes(e.target.value)
                        }
                    }}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                    placeholder="Any specific requirements, delivery preferences, or questions..."
                />
            </div>

            {/* Attachment */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
                <label className="block text-sm font-bold text-gray-900">
                    Attachment <span className="text-gray-400 font-normal">(Optional, 1 file max)</span>
                </label>
                {attachment ? (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <Upload className="w-5 h-5 text-blue-600" />
                        <span className="flex-1 text-sm text-blue-800 truncate">{attachment.name}</span>
                        <button
                            type="button"
                            onClick={() => setAttachment(null)}
                            className="text-blue-600 hover:text-blue-700"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors">
                        <Upload className="w-8 h-8 text-gray-400" />
                        <span className="text-sm text-gray-600">Click to upload PDF, DOC, or image</span>
                        <span className="text-xs text-gray-400">Max 5MB</span>
                        <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                            onChange={handleFileChange}
                        />
                    </label>
                )}
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95 transition-all disabled:cursor-not-allowed"
            >
                {isSubmitting ? (
                    <>
                        <LoaderCircle className="w-5 h-5 animate-spin" />
                        Submitting Quote...
                    </>
                ) : (
                    <>
                        <Send className="w-5 h-5" />
                        Submit Quote Request
                    </>
                )}
            </button>

            {/* Upgrade prompt */}
            <p className="text-center text-sm text-gray-500">
                Need bulk pricing or more features?{" "}
                <Link href="/profile/business" className="text-blue-600 hover:underline font-medium">
                    Upgrade to Business Account
                </Link>
            </p>
        </form>
    )
}
