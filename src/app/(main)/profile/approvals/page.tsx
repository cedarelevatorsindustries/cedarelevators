import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
    title: 'Verification | Cedar Elevators',
    description: 'Business verification status',
}

export default function ApprovalsPage() {
    // Redirect to the existing verification page
    redirect('/profile/verification')
}
