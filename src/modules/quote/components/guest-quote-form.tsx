"use client"

import { useState } from "react"
import { Upload, Send, LoaderCircle, CircleCheck } from "lucide-react"
import { toast } from "sonner"
import { submitGuestQuote } from "@/lib/actions/quotes"
import { useQuoteBasket } from "@/lib/hooks/use-quote-basket"

interface GuestQuoteFormProps {
    onSuccess?: (quoteNumber: string) => void
}

export const GuestQuoteForm = ({ onSuccess }: GuestQuoteFormProps) => {
    const { items, clearBasket } = useQuoteBasket()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [quoteNumber, setQuoteNumber] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        notes: ""
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.name.trim()) {
            newErrors.name = "Name is required"
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required"
        } else if (!/^[+]?[\d\s-]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = "Please enter a valid phone number"
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address"
        }

        if (formData.notes && formData.notes.length > 200) {
            newErrors.notes = "Notes must be 200 characters or less"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            toast.error("Please fix the errors in the form")
            return
        }

        setIsSubmitting(true)

        try {
            // Use basket items if available, otherwise create a generic inquiry
            const quoteItems = items.length > 0 ? items : [{
                id: 'generic',
                product_id: 'generic-inquiry',
                product_name: 'General Quote Inquiry',
                quantity: 1
            }]

            const result = await submitGuestQuote({
                guest_name: formData.name,
                guest_email: formData.email,
                guest_phone: formData.phone,
                notes: formData.notes,
                items: quoteItems
            })

            if (result.success) {
                setIsSuccess(true)
                setQuoteNumber(result.quote_number)
                clearBasket()
                toast.success("Quote request submitted successfully!")
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
            <div className="px-4 py-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                        <CircleCheck className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Quote Request Sent!</h3>
                    <p className="text-gray-600">
                        Your quote request <span className="font-semibold text-blue-600">{quoteNumber}</span> has been submitted.
                    </p>
                    <p className="text-sm text-gray-500">
                        We&apos;ve sent a confirmation email to <span className="font-medium">{formData.email}</span>.
                        Our team will get back to you within 24 business hours.
                    </p>
                    <button
                        onClick={() => {
                            setIsSuccess(false)
                            setQuoteNumber(null)
                            setFormData({ name: "", phone: "", email: "", notes: "" })
                        }}
                        className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                        Submit another quote request
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="px-4 py-6">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
                {/* Quote Items Preview */}
                {items.length > 0 && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm font-medium text-blue-800 mb-2">
                            Requesting quote for:
                        </p>
                        {items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 text-sm text-blue-700">
                                <span className="font-medium">{item.product_name}</span>
                                <span className="text-blue-500">x{item.quantity}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value })
                            if (errors.name) setErrors({ ...errors, name: "" })
                        }}
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none ${errors.name ? "border-red-300 bg-red-50" : "border-gray-200"
                            }`}
                        placeholder="Enter your name"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1.5">
                        Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => {
                            setFormData({ ...formData, phone: e.target.value })
                            if (errors.phone) setErrors({ ...errors, phone: "" })
                        }}
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none ${errors.phone ? "border-red-300 bg-red-50" : "border-gray-200"
                            }`}
                        placeholder="+91 XXXXX XXXXX"
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value })
                            if (errors.email) setErrors({ ...errors, email: "" })
                        }}
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none ${errors.email ? "border-red-300 bg-red-50" : "border-gray-200"
                            }`}
                        placeholder="your@email.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1.5">
                        Requirement Details
                        <span className="text-gray-400 font-normal ml-2">({formData.notes.length}/200)</span>
                    </label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => {
                            if (e.target.value.length <= 200) {
                                setFormData({ ...formData, notes: e.target.value })
                                if (errors.notes) setErrors({ ...errors, notes: "" })
                            }
                        }}
                        rows={4}
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none ${errors.notes ? "border-red-300 bg-red-50" : "border-gray-200"
                            }`}
                        placeholder="Describe your requirements (optional)..."
                    />
                    {errors.notes && <p className="text-red-500 text-xs mt-1">{errors.notes}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95 transition-all disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <LoaderCircle className="w-5 h-5 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            Submit Quote Request
                        </>
                    )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                    By submitting, you agree to receive communications from Cedar Elevators.
                </p>
            </form>
        </div>
    )
}
