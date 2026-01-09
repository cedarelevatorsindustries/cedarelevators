import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
    title: 'Personal Information | Cedar Elevators',
    description: 'Manage your personal information',
}

export default function PersonalInfoPage() {
    // Redirect to account page which handles personal info
    redirect('/profile/account')
}
