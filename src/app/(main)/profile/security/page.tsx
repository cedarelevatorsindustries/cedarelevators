import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
    title: 'Security Settings | Cedar Elevators',
    description: 'Manage your account security settings',
}

export default function SecurityPage() {
    // Redirect to the security section in profile
    redirect('/profile/password')
}
