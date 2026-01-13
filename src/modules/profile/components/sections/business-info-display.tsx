'use client'

import { Building2, Mail, MapPin, Phone } from 'lucide-react'

interface BusinessInfoDisplayProps {
    companyName: string
    email: string
    phone?: string
    taxId?: string
    industry?: string
    companySize?: string
}

export default function BusinessInfoDisplay({
    companyName,
    email,
    phone,
    taxId,
    industry,
    companySize
}: BusinessInfoDisplayProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Business Information</h2>
                        <p className="text-sm text-gray-600 mt-0.5">
                            View your company details
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Company Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company Name
                        </label>
                        <div className="flex items-center gap-2 text-gray-900">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span>{companyName || 'Not provided'}</span>
                        </div>
                    </div>

                    {/* Contact Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contact Email
                        </label>
                        <div className="flex items-center gap-2 text-gray-900">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{email}</span>
                        </div>
                    </div>

                    {/* Contact Phone */}
                    {phone && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contact Phone
                            </label>
                            <div className="flex items-center gap-2 text-gray-900">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span>{phone}</span>
                            </div>
                        </div>
                    )}

                    {/* Tax ID / GSTIN */}
                    {taxId && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                GST Number
                            </label>
                            <div className="flex items-center gap-2 text-gray-900">
                                <span className="font-mono text-sm">{taxId}</span>
                            </div>
                        </div>
                    )}

                    {/* Industry */}
                    {industry && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Industry
                            </label>
                            <div className="text-gray-900">
                                <span>{industry}</span>
                            </div>
                        </div>
                    )}

                    {/* Company Size */}
                    {companySize && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Company Size
                            </label>
                            <div className="text-gray-900">
                                <span>{companySize}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
