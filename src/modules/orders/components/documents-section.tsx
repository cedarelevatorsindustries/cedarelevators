'use client'

import { FileText, Download, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface DocumentsSectionProps {
    orderId: string
    quoteId?: string
    quoteNumber?: string
}

export default function DocumentsSection({ orderId, quoteId, quoteNumber }: DocumentsSectionProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Documents</h3>

            <div className="space-y-3">
                {/* Invoice */}
                <a
                    href={`/api/orders/${orderId}/invoice`}
                    download
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 text-sm">Invoice (PDF)</p>
                            <p className="text-xs text-gray-500">Download your invoice</p>
                        </div>
                    </div>
                    <Download className="w-4 h-4 text-gray-400 group-hover:text-orange-600" />
                </a>

                {/* Quote Reference */}
                {quoteId && quoteNumber && (
                    <Link
                        href={`/profile/quotes/${quoteId}`}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 text-sm">Quote Reference</p>
                                <p className="text-xs text-gray-500">{quoteNumber}</p>
                            </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-orange-600" />
                    </Link>
                )}

                {/* Delivery Note - Coming Soon */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50 opacity-60">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-600 text-sm">Delivery Note</p>
                            <p className="text-xs text-gray-400">Available after shipment</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
