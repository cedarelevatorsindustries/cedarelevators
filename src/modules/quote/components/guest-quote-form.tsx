"use client"

import { useState } from "react"
import { Upload, Send } from "lucide-react"

export const GuestQuoteForm = () => {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        requirement: "",
        file: null as File | null
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Handle form submission
        console.log("Quote request submitted:", formData)
    }

    return (
        <div className="px-4 py-6">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                        placeholder="Enter your name"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1.5">
                        Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                        placeholder="+91 XXXXX XXXXX"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1.5">
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                        placeholder="your@email.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1.5">
                        Requirement Details <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        required
                        value={formData.requirement}
                        onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                        placeholder="Describe your requirements..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                        Attach File (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group">
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                        />
                        <label htmlFor="file-upload" className="cursor-pointer w-full h-full block">
                            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-100 transition-colors">
                                <Upload className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-medium text-gray-700">
                                {formData.file ? formData.file.name : "Click to upload or drag and drop"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">PDF, DOC, or Image (Max 10MB)</p>
                        </label>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95 transition-all"
                >
                    <Send className="w-5 h-5" />
                    Submit Quote Request
                </button>
            </form>
        </div>
    )
}
