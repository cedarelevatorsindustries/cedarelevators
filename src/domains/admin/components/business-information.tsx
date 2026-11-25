'use client'

import { Quote } from '@/types/b2b/quote'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, User } from 'lucide-react'
import { format } from 'date-fns'

interface BusinessInformationProps {
  quote: Quote
}

function ValueOrEmpty({ value, mono = false }: { value?: string | null; mono?: boolean }) {
  if (!value || !value.trim()) {
    return <span className="text-gray-400 font-normal">Not provided</span>
  }
  return <span className={mono ? 'font-mono text-gray-900' : 'text-gray-900'}>{value}</span>
}

export function BusinessInformation({ quote }: BusinessInformationProps) {
  const customerName =
    quote.requester_name ||
    quote.guest_name ||
    quote.company_details?.contact_name ||
    null
  const customerEmail = quote.requester_email || quote.guest_email || null
  const customerPhone =
    quote.requester_phone ||
    quote.guest_phone ||
    quote.company_details?.contact_phone ||
    null
  const companyName = quote.company_name || quote.company_details?.company_name || null
  const gstNumber = quote.gst_number || quote.company_details?.gst_number || null

  return (
    <Card className="border-gray-200 shadow-none">
      <CardHeader className="border-b border-gray-100 bg-gray-50/60 py-4">
        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
          {companyName ? (
            <Building2 className="w-4 h-4 text-orange-600" />
          ) : (
            <User className="w-4 h-4 text-gray-600" />
          )}
          Customer &amp; Project Information
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Customer Name</p>
            <p className="font-medium">
              <ValueOrEmpty value={customerName} />
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-0.5">Email Address</p>
            <p className="font-medium break-all">
              <ValueOrEmpty value={customerEmail} />
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-0.5">Phone Number</p>
            <p className="font-medium tabular-nums">
              <ValueOrEmpty value={customerPhone} />
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-0.5">Company / Organization</p>
            <p className="font-medium">
              <ValueOrEmpty value={companyName} />
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-0.5">GST Number</p>
            <p className="font-medium text-sm">
              <ValueOrEmpty value={gstNumber} mono />
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-0.5">Submission Date</p>
            <p className="font-medium text-gray-900">
              {format(new Date(quote.created_at), 'dd MMM yyyy, hh:mm a')}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-0.5">Project Name</p>
            <p className="font-medium">
              <ValueOrEmpty value={quote.project_name} />
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-0.5">Project Location</p>
            <p className="font-medium">
              <ValueOrEmpty value={quote.project_location} />
            </p>
          </div>

          <div className="sm:col-span-2 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1.5">Customer Message / Requirements</p>
            {quote.notes && quote.notes.trim() ? (
              <div className="bg-gray-50 border border-gray-200/80 rounded-lg p-3.5 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                {quote.notes}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Not provided</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
