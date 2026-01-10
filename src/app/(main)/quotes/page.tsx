import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { QuoteList } from '@/modules/quote/components/quote-list';
import { getQuotes } from '@/lib/actions/quotes';
import { getCollectionsWithProductsByDisplayContext } from '@/lib/actions/collections-display-context';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'My Quotes | Cedar Elevators',
    description: 'View and manage your quote requests',
}

export default async function QuotesPage() {
    const { userId } = await auth();

    // GUEST USERS: Redirect to quote creation (no list view for guests)
    if (!userId) {
        redirect('/quotes/new');
    }

    // Determine user type for logged-in users
    const user = await currentUser();
    const accountType = user?.publicMetadata?.account_type as string;
    const verificationStatus = user?.publicMetadata?.verification_status as string;

    let userType: 'individual' | 'business' | 'verified' = 'individual';
    let isVerified = false;

    if (verificationStatus === 'verified') {
        userType = 'verified';
        isVerified = true;
    } else if (accountType === 'business') {
        userType = 'business';
    }

    // Fetch quotes for logged-in users
    const result = await getQuotes({ status: 'all' });
    const quotes = result.success && result.quotes ? result.quotes : [];

    // Fetch business hub collections
    const { collections: businessCollections = [] } = await getCollectionsWithProductsByDisplayContext('business_hub');

    return (
        <div className="container py-8 pt-24 max-w-7xl mx-auto px-4">
            <QuoteList
                quotes={quotes}
                userType={userType}
                collections={businessCollections}
            />
        </div>
    );
}
