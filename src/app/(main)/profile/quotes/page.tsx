import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
    title: 'Quotes | Cedar Elevators',
    description: 'View and manage your quotes',
}

export default function ProfileQuotesPage() {
    // Redirect to the main quotes page
    redirect('/quotes')
}
