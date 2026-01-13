'use client'

import { Headphones, MessageCircle } from 'lucide-react'
import Link from 'next/link'

interface SupportCTAProps {
    orderId: string
}

export default function SupportCTA({ orderId }: SupportCTAProps) {
    return (
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Headphones className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Need help?</h4>
                    <p className="text-sm text-gray-600 mb-4">
                        Having an issue with delivery or items? Our support team is here to help.
                    </p>
                    <Link
                        href={`/contact?order_id=${orderId}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                        <MessageCircle className="w-4 h-4" />
                        Contact Support
                    </Link>
                </div>
            </div>
        </div>
    )
}
