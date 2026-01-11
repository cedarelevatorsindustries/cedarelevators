import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { getQuoteById } from '@/lib/actions/quotes';
import { QuoteDetail } from '@/modules/quote/components/quote-detail';
import { auth, currentUser } from '@clerk/nextjs/server';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Quote Details | Cedar Elevators',
}

interface PageProps {
    params: { id: string }
}

export default async function QuoteDetailPage({ params }: PageProps) {
    const { userId } = await auth();
    if (!userId) {
        redirect(`/sign-in?redirect_url=/quotes/${params.id}`);
    }

    const { success, quote, error } = await getQuoteById(params.id);

    if (!success || !quote) {
        if (error !== 'Unauthorized') {
            // Maybe 404
            if (!quote) notFound();
            return <div className="p-8 text-red-500">Error: {error}</div>;
        }
        return <div className="p-8 text-red-500">Could not load quote.</div>;
    }

    // Determine user type for role-based visibility
    const user = await currentUser();
    let userType: 'guest' | 'individual' | 'business' | 'verified' = 'individual';

    if (!user) {
        userType = 'guest';
    } else if (user.publicMetadata?.verification_status === 'verified' || user.publicMetadata?.role === 'admin') {
        userType = 'verified';
    } else if (user.publicMetadata?.account_type === 'business') {
        userType = 'business';
    } else {
        userType = 'individual';
    }

    return (
        <div className="container py-8 max-w-5xl mx-auto px-4">
            <div className="mb-6">
                <a href="/quotes" className="text-neutral-500 hover:text-industrial-blue text-sm flex items-center gap-1">
                    ← Back to Quotes
                </a>
            </div>
            <Suspense fallback={<div>Loading details...</div>}>
                <QuoteDetail quote={quote} userType={userType as any} />
            </Suspense>
        </div>
    )
}
