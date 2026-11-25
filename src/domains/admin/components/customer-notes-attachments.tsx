'use client'

import { Quote } from '@/types/b2b/quote'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Paperclip, Download } from 'lucide-react'

interface CustomerNotesAttachmentsProps {
  quote: Quote
}

export function CustomerNotesAttachments({ quote }: CustomerNotesAttachmentsProps) {
  if (!quote.attachments || quote.attachments.length === 0) {
    return null
  }

  return (
    <Card className="border-gray-200 shadow-none">
      <CardHeader className="border-b border-gray-100 bg-gray-50/60 py-4">
        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-gray-600" />
          <span>Customer Attachments ({quote.attachments.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-2">
        {quote.attachments.map((attachment) => (
          <a
            key={attachment.id}
            href={attachment.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Download className="w-4 h-4 text-gray-500 shrink-0" />
            <span className="flex-1 text-sm text-gray-800 truncate">{attachment.file_name}</span>
          </a>
        ))}
      </CardContent>
    </Card>
  )
}
