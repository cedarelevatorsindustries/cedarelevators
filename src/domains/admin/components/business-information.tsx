'use client'

import { Quote } from '@/types/b2b/quote'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, User, MapPin } from 'lucide-react'

interface BusinessInformationProps {
  quote: Quote
}

export function BusinessInformation({ quote }: BusinessInformationProps) {
  const customerName = quote.requester_name || quote.guest_name || quote.company_details?.contact_name || 'N/A'
  const customerEmail = quote.requester_email || quote.guest_email || 'N/A'
  const customerPhone = quote.requester_phone || quote.guest_phone || quote.company_details?.contact_phone || 'N/A'
  const companyName = quote.company_name || quote.company_details?.company_name || null
  const gstNumber = quote.gst_number || quote.company_details?.gst_number || null

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-100 bg-gray-50/50">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          {companyName ? (
            <Building2 className="w-5 h-5 text-orange-600" />
          ) : (
            <User className="w-5 h-5 text-blue-600" />
          )}
          Customer &amp; Project Information
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Full Name</p>
            <p className="font-semibold text-gray-900">{customerName}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Email Address</p>
            <p className="font-semibold text-gray-900 break-all">{customerEmail}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Phone Number</p>
            <p className="font-semibold text-gray-900">{customerPhone}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Company / Organization</p>
            <p className="font-semibold text-gray-900">
              {companyName || <span className="text-gray-400 font-normal">Not provided</span>}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">GST Number</p>
            <p className="font-semibold text-gray-900 font-mono text-sm">
              {gstNumber || <span className="text-gray-400 font-sans font-normal">Not provided</span>}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Project Name</p>
            <p className="font-semibold text-gray-900">
              {quote.project_name || <span className="text-gray-400 font-normal">Not specified</span>}
            </p>
          </div>

          {quote.project_location && (
            <div className="sm:col-span-2">
              <p className="text-xs font-medium text-gray-500 uppercase mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Project Location
              </p>
              <p className="font-semibold text-gray-900">{quote.project_location}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
