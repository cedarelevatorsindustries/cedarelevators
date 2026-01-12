'use client'

import { Quote, QuoteAttachment } from '@/types/b2b/quote'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Download } from 'lucide-react'

interface CustomerNotesAttachmentsProps {
    quote: Quote
}

export function CustomerNotesAttachments({ quote }: CustomerNotesAttachmentsProps) {
    if (!quote.notes && (!quote.attachments || quote.attachments.length === 0)) {
        return null
    }

    return (
        <Card className="border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Customer Notes & Attachments
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                {quote.notes && (
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase mb-2">Customer Notes</p>
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{quote.notes}</p>
                        </div>
                    </div>
                )}
                {quote.attachments && quote.attachments.length > 0 && (
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase mb-2">Attachments</p>
                        <div className="space-y-2">
                            {quote.attachments.map((attachment) => (
                                <a
                                    key={attachment.id}
                                    href={attachment.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all"
                                >
                                    <Download className="w-4 h-4 text-gray-500" />
                                    <span className="flex-1 text-sm font-medium text-gray-700 truncate">{attachment.file_name}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
