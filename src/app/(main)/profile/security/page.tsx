import SecuritySection from '@/modules/profile/components/sections/security-section'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Security Settings | Cedar Elevators',
    description: 'Manage your account security settings',
}

export default function SecurityPage() {
    return <SecuritySection />
}
