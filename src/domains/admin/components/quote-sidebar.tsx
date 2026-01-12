'use client'

import { Quote } from '@/types/b2b/quote'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, ShoppingCart, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import Link from 'next/link'

interface QuoteSidebarProps {
    quote: Quote
    canConvert: boolean
    isSaving: boolean
    onStartReview: () => void
    onConvert: () => void
}

export function QuoteSidebar({
    quote,
    canConvert,
    isSaving,
    onStartReview,
    onConvert
}: QuoteSidebarProps) {
    return (
        <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                    <CardTitle className="text-lg font-semibold">Actions</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                    {quote.status === 'pending' && (
                        <Button
                            onClick={onStartReview}
                            disabled={isSaving}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            Start Review
                        </Button>
                    )}
                    {canConvert && (
                        <Button
                            onClick={onConvert}
                            className="w-full bg-[#FF6B35] hover:bg-[#FF5722] text-white font-semibold"
                        >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Convert to Order
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        className="w-full border-gray-300"
                        onClick={() => window.print()}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                    </Button>
                </CardContent>
            </Card>

            {/* Quote Info */}
            <Card className="border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                    <CardTitle className="text-lg font-semibold">Quote Details</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Quote ID</span>
                        <span className="font-semibold">#{quote.quote_number}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Created</span>
                        <span className="font-semibold">
                            {format(new Date(quote.created_at), 'MMM d, yyyy')}
                        </span>
                    </div>
                    {quote.approved_at && (
                        <div className="flex justify-between">
                            <span className="text-gray-600">Approved</span>
                            <span className="font-semibold text-green-700">
                                {format(new Date(quote.approved_at), 'MMM d, yyyy')}
                            </span>
                        </div>
                    )}
                    {quote.converted_order_id && (
                        <div className="flex justify-between">
                            <span className="text-gray-600">Order ID</span>
                            <Link href={`/admin/orders/${quote.converted_order_id}`} className="text-orange-600 hover:underline font-semibold">
                                View Order →
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
