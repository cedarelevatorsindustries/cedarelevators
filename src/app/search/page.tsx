import { redirect } from 'next/navigation'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Search Products | Cedar Elevators',
    description: 'Search our complete catalog of premium elevator components. ISO certified quality with pan-India delivery.',
}

interface SearchPageProps {
    searchParams: Promise<{
        q?: string
    }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const params = await searchParams
    const query = params.q || ''

    // Redirect to catalog with search param
    // This maintains SEO while providing unified browsing experience
    redirect(`/catalog?search=${encodeURIComponent(query)}`)
}


