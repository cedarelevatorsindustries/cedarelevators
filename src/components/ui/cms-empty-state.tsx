"use client"

import { FileText, Mail } from "lucide-react"
import Link from "next/link"

interface CMSEmptyStateProps {
    pageTitle: string
}

export function CMSEmptyState({ pageTitle }: CMSEmptyStateProps) {
    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4 pt-32 pb-16">
            <div className="max-w-md w-full text-center">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center">
                            <FileText className="w-12 h-12 text-blue-600" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 text-xl font-bold">!</span>
                        </div>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                    {pageTitle}
                </h1>

                {/* Message */}
                <p className="text-gray-600 mb-2">
                    This page content is currently being prepared.
                </p>
                <p className="text-sm text-gray-500 mb-8">
                    We're working hard to provide you with comprehensive information. Please check back soon.
                </p>

                {/* Contact CTA */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Mail className="w-5 h-5 text-gray-700" />
                        <h3 className="font-semibold text-gray-900">Need Immediate Assistance?</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                        If you have urgent questions about our policies, please feel free to contact us.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Contact Us
                    </Link>
                </div>
            </div>
        </div>
    )
}
