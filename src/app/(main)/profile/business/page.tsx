'use client'

import { useUser } from '@/lib/auth/client'
import CompanyInfoSection from '@/modules/profile/components/sections/company-info-section'
import { LoaderCircle } from 'lucide-react'

export default function BusinessInfoPage() {
    const { user, isLoading } = useUser()

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <LoaderCircle className="animate-spin text-orange-500" size={48} />
            </div>
        )
    }

    if (!user || user.userType !== 'business') {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center text-center">
                <h3 className="text-lg font-semibold text-gray-900">Business Profile Required</h3>
                <p className="mt-2 text-gray-600">Please switch to a business profile to view this information.</p>
            </div>
        )
    }

    // Default empty address
    const emptyAddress = {
        line1: '',
        line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: ''
    }

    const companyProfile = {
        company_name: user?.business?.name || user?.name || '',
        company_logo: user?.imageUrl || undefined,
        tax_id: '',  // TODO: Add GST field to businesses table if needed
        industry: '',
        company_size: '',
        billing_address: emptyAddress,  // TODO: Add address fields to businesses table if needed
        shipping_address: emptyAddress,
        contact_email: user.email || '',
        contact_phone: ''  // TODO: Add contact_phone field to businesses table if needed
    }

    return (
        <CompanyInfoSection
            company={companyProfile}
            onUpdate={async (updates) => {
                console.log('Update company info:', updates)
                // TODO: Implement updates
            }}
            onUploadLogo={async (file) => {
                console.log('Upload logo:', file)
                return ''
            }}
        />
    )
}
