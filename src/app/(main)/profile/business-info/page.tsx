import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
    title: 'Business Information | Cedar Elevators',
    description: 'Manage your business information',
}

export default function BusinessInfoPage() {
    // Redirect to business verification page which includes business info
    redirect('/profile/business/verification')
}
