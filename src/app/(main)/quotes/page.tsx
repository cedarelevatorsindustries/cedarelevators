import { Suspense } from 'react';
import { getQuotes } from '@/lib/actions/quotes';
import { QuoteList } from '@/modules/quote/components/quote-list';
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';


export const metadata: Metadata = {
    title: 'My Quotes | Cedar Elevators',
    description: 'Manage your quote requests',
}

export default async function QuotesPage() {
    const { userId } = await auth();
    if (!userId) {
        redirect('/sign-in');
    }

    // Fetch Quotes
    const { success, quotes, error } = await getQuotes();

    // Determine User Type (Basic logic for now)
    // Ideally fetch profile to check if business/verified
    const user = await currentUser();
    const userType = user?.publicMetadata?.role === 'admin' ? 'verified' :
        user?.publicMetadata?.account_type === 'business' ? 'business' : 'individual';

    // If fetching profile from DB is preferred:
    // const profile = await getUserProfile(userId);
    // const userType = profile?.is_verified ? 'verified' : profile?.account_type || 'individual';

    if (!success) {
        return <div className="p-8 text-red-500">Error loading quotes: {error}</div>;
    }

    return (
        <div className="container py-8 max-w-5xl mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-industrial-blue">Quotations</h1>
                <a href="/quotes/new" className="bg-cedar-orange text-white px-4 py-2 rounded font-medium hover:bg-orange-600">
                    + New Quote
                </a>
            </div>

            <Suspense fallback={<div>Loading...</div>}>
                <QuoteList
                    quotes={quotes || []}
                    userType={userType as any}
                />
            </Suspense>
        </div>
    )
}
