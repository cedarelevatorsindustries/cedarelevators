'use client'

import { Quote } from '@/types/b2b/quote'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, User, BadgeCheck, XCircle } from 'lucide-react'

interface BusinessInformationProps {
    quote: Quote
}

export function BusinessInformation({ quote }: BusinessInformationProps) {
    const isBusinessAccount = quote.account_type === 'business' || quote.account_type === 'verified'
    const isVerified = quote.account_type === 'verified'

    return (
        <Card className="border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    {isBusinessAccount ? (
                        <Building2 className="w-5 h-5 text-purple-600" />
                    ) : (
                        <User className="w-5 h-5 text-blue-600" />
                    )}
                    {isBusinessAccount ? 'Business Information' : 'Requester Information'}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-6">
                    {quote.company_details?.company_name && (
                        <>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Company</p>
                                <p className="font-semibold text-gray-900">{quote.company_details.company_name}</p>
                            </div>
                            {quote.company_details.gst_number && (
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">GST Number</p>
                                    <p className="font-semibold text-gray-900">{quote.company_details.gst_number}</p>
                                </div>
                            )}
                            {isVerified && (
                                <div className="col-span-2">
                                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                                        <BadgeCheck className="w-4 h-4 text-green-600" />
                                        <span className="text-sm font-semibold text-green-700">Verification Status: Verified</span>
                                    </div>
                                </div>
                            )}
                            {quote.account_type === 'business' && (
                                <div className="col-span-2">
                                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                                        <XCircle className="w-4 h-4 text-red-600" />
                                        <span className="text-sm font-semibold text-red-700">Verification Status: Not Verified</span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Name</p>
                        <p className="font-semibold text-gray-900">
                            {quote.company_details?.contact_name || quote.guest_name || 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Email</p>
                        <p className="font-semibold text-gray-900">{quote.guest_email || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Phone</p>
                        <p className="font-semibold text-gray-900">
                            {quote.company_details?.contact_phone || quote.guest_phone || 'N/A'}
                        </p>
                    </div>
                    {!isBusinessAccount && (
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Source</p>
                            <p className="font-semibold text-gray-900">
                                {quote.account_type === 'individual' ? 'Individual Account' : 'Guest (No Account)'}
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
